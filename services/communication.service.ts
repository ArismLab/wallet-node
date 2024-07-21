import { Injectable, OnModuleInit } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { Wallet } from '@schemas'
import { SecretService } from '@services'
import { lagrangeInterpolation } from '@libs/arithmetic'
import { post } from '@helpers/httpRequest'
import { ConfigService } from '@nestjs/config'
import { C, N } from '@common'

@Injectable()
export class CommunicationService implements OnModuleInit {
    private nodes: ArismNode[]

    constructor(
        private readonly httpService: HttpService,
        private readonly secretService: SecretService,
        private readonly configService: ConfigService
    ) {}

    onModuleInit() {
        this.nodes = this.configService.get<ArismNode[]>('nodes')
    }

    async generateSharedSecret(user: string): Promise<Wallet> {
        const publicKeys: string[] = []

        // Step 1: Initialize Secrets
        for (const { url } of this.nodes) {
            const { data: publicKey } = await post(
                this.httpService,
                `${url}/communication/initialize-secret`,
                { user }
            )

            publicKeys.push(publicKey)
        }

        // Step 2: Generate Shares
        for (const { url } of this.nodes) {
            await post(this.httpService, `${url}/communication/generate-shares`, { user })
        }

        // Step 3: Derive Master Shares
        for (const { url } of this.nodes) {
            await post(this.httpService, `${url}/communication/compute-master-share`, { user })
        }

        let decodedMasterPublicKey: Point = C.decodePublicKey(publicKeys[0])
        for (let i = 1; i < publicKeys.length; i += 1) {
            decodedMasterPublicKey = C.ellipticAddition(
                decodedMasterPublicKey,
                C.decodePublicKey(publicKeys[i])
            )
        }
        const masterPublicKey = C.encodePublicKey(decodedMasterPublicKey)
        console.log({ publicKeys, masterPublicKey, url: this.configService.get('url') })
        const address = C.getAddressFromPublicKey(masterPublicKey)

        // Step 4: Create wallet
        for (const { url } of this.nodes) {
            await post(this.httpService, `${url}/communication/create-wallet`, {
                user,
                address,
                publicKey: masterPublicKey,
            })
        }

        return { user, address, publicKey: masterPublicKey }
    }

    async generateShares(user: string): Promise<void> {
        const { secret } = await this.secretService.find(user)

        const generatedShares: Point[] = [{ x: '0', y: secret }]

        for (const { url, id } of this.nodes) {
            if (generatedShares.length < N.DERIVATION_THRESHOLD) {
                const randomShare: string = C.generatePrivateKey()

                await post(this.httpService, `${url}/communication/receive-share`, {
                    user,
                    receivedShare: randomShare,
                })

                generatedShares.push({ x: id.toString(16), y: randomShare })
            } else {
                const receivedShare = lagrangeInterpolation(generatedShares, id.toString(16))

                await post(this.httpService, `${url}/communication/receive-share`, {
                    user,
                    receivedShare,
                })
            }
        }
    }
}
