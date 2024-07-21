import { BadRequestException, Body, Controller, Post, UseGuards } from '@nestjs/common'
import { C, E, H } from '@common'
import { ConfigService } from '@nestjs/config'
import { VerifyGuard } from '@verifiers/verify.guard'
import { ConstructMasterShareDto, MasterShareDto } from '@dtos'
import { CommitmentService, SecretService, WalletService } from '@services'

@Controller('secret')
export class SecretController {
    constructor(
        private readonly secretService: SecretService,
        private readonly commitmentService: CommitmentService,
        private readonly walletService: WalletService,
        private readonly configService: ConfigService
    ) {}

    @Post()
    @UseGuards(VerifyGuard)
    async constructMasterShare(@Body() data: ConstructMasterShareDto): Promise<MasterShareDto> {
        const { idToken, clientPublicKey, commitments, user } = data

        const hashedIdToken = H.keccak256(idToken)
        const existedCommitment = await this.commitmentService.find(hashedIdToken)

        if (!existedCommitment) {
            throw new BadRequestException("Commitment of Id Token doesn't exist.")
        }

        const wallet = await this.walletService.find(user)
        if (!wallet) {
            throw new BadRequestException('Wallet have not init yet.')
        }

        const privateKey = this.configService.get<string>('privateKey')
        const publicKey = C.getPublicKeyFromPrivateKey(privateKey)

        const commitment = commitments.find((node) => node.publicKey === publicKey)
        if (!commitment) {
            throw new BadRequestException('Commitment does not contain in this node')
        }

        const secret = await this.secretService.find(user)
        if (!secret) {
            throw new BadRequestException('Not found secret by user')
        }

        const ecies = await E.encrypt(clientPublicKey, secret.masterShare)

        return { publicKey: wallet.publicKey, ecies }
    }
}
