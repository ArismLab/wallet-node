import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Secret, SecretDocument } from '@schemas'
import { C, N } from '@common'
import { lagrangeInterpolation, sumMod } from '@libs/arithmetic'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { post } from '@helpers/httpRequest'

@Injectable()
export class SecretService {
    private url: string
    private nodes: ArismNode[]

    constructor(
        @InjectModel(Secret.name)
        private secretModel: Model<SecretDocument>,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService
    ) {}

    onModuleInit() {
        this.url = this.configService.get<string>('url')
        this.nodes = this.configService.get<ArismNode[]>('nodes')
    }

    async find(user: string): Promise<Secret | null> {
        const secret: Secret | null = await this.secretModel.findOne({ user })
        return secret
    }

    async initialize(user: string): Promise<string> {
        const existed: Secret | null = await this.secretModel.findOne({ user })

        let secret: string | undefined
        if (existed) {
            secret = existed.secret
        } else {
            secret = C.generatePrivateKey()
            const claimedShares: string[] = []
            await this.secretModel.create({ user, secret, claimedShares })
        }

        const fixedPoints: Point[] = [{ x: '0', y: secret }]
        const shares: Record<number, string> = {}

        for (const { id } of this.nodes) {
            if (fixedPoints.length < N.DERIVATION_THRESHOLD) {
                const share: string = C.generatePrivateKey()
                shares[id] = share
                fixedPoints.push({ x: id.toString(16), y: share })
            } else {
                const share = lagrangeInterpolation(fixedPoints, id.toString(16))
                shares[id] = share
            }
        }

        await Promise.all(this.nodes.map(({ url, id }) => this.issueShares(url, user, shares[id])))

        const publicKey: string = C.getPublicKeyFromPrivateKey(secret)
        return publicKey
    }

    async issueShares(url: string, user: string, share: string): Promise<void> {
        if (url === this.url) {
            await this.claimShare(user, share)
        } else {
            await post(this.httpService, `${url}/secret/issue-share`, { user, share })
        }
    }

    async claimShare(user: string, share: string): Promise<void> {
        const existed: Secret | null = await this.secretModel.findOne({ user })

        if (existed) {
            if (existed.claimedShares.length >= this.nodes.length) {
                return
            }
            const claimedShares: string[] = [...existed.claimedShares, share]
            await this.secretModel.updateOne({ user }, { claimedShares })
        } else {
            const secret: string = C.generatePrivateKey()
            const claimedShares: string[] = [share]
            await this.secretModel.create({ user, secret, claimedShares })
        }
    }

    async constructMasterShare(user: string): Promise<string> {
        const secret: Secret = await this.secretModel.findOne({ user })

        if (!secret) {
            throw new Error('Not found secret for user')
        }
        if (secret.claimedShares.length < this.nodes.length) {
            throw new Error('Not enough claimed shares')
        }

        const masterShare = sumMod(secret.claimedShares, C.ORDER)
        await this.secretModel.updateOne({ user }, { masterShare })

        return masterShare
    }
}
