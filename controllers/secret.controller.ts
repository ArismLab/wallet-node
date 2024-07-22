import {
    BadRequestException,
    Body,
    Controller,
    Get,
    InternalServerErrorException,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common'
import { C, E, H } from '@common'
import { ConfigService } from '@nestjs/config'
import { VerifyGuard } from '@verifiers/verify.guard'
import { CommitmentService, SecretService } from '@services'
import { Secret } from '@schemas'
import {
    ConstructMasterShareRequest,
    ConstructMasterShareResponse,
    DerivePublicKeyRequest,
    DerivePublicKeyResponse,
    InitializeSecretRequest,
    InitializeSecretResponse,
    IssueShareRequest,
    IssueShareResponse,
} from '@dtos'

@Controller('secret')
export class SecretController {
    constructor(
        private readonly secretService: SecretService,
        private readonly commitmentService: CommitmentService,
        private readonly configService: ConfigService
    ) {}

    @Get('derive-public-key?') // from client+node
    async derivePublicKey(@Query() data: DerivePublicKeyRequest): Promise<DerivePublicKeyResponse> {
        const { user } = data

        const secret: Secret | null = await this.secretService.find(user)
        if (!secret) {
            throw new BadRequestException('Not found secret by user')
        }

        const publicKey: string = C.getPublicKeyFromPrivateKey(secret.secret)
        return { publicKey }
    }

    @Post('initialize-secret') // from client
    async initializeSecret(@Body() data: InitializeSecretRequest): Promise<InitializeSecretResponse> {
        try {
            const publicKey = await this.secretService.initialize(data.user)
            return { publicKey }
        } catch ({ message }) {
            throw new InternalServerErrorException('Error at secretService.initialize', message)
        }
    }

    @Post('issue-share') // from nodes
    async issueShare(@Body() data: IssueShareRequest): Promise<IssueShareResponse> {
        const { user, share } = data
        await this.secretService.claimShare(user, share)
    }

    @Post('construct-master-share') // from client
    @UseGuards(VerifyGuard)
    async constructMasterShare(@Body() data: ConstructMasterShareRequest): Promise<ConstructMasterShareResponse> {
        const { idToken, clientPublicKey, commitment, user } = data

        const hashedIdToken = H.keccak256(idToken)
        const existedCommitment = await this.commitmentService.find(hashedIdToken)
        if (!existedCommitment) {
            throw new BadRequestException("Commitment of Id Token doesn't exist.")
        }

        const privateKey: string = this.configService.get<string>('privateKey')
        const publicKey: string = C.getPublicKeyFromPrivateKey(privateKey)
        if (commitment.publicKey !== publicKey) {
            throw new BadRequestException('Commitment does not contain in this node')
        }

        const secret: Secret | null = await this.secretService.find(user)
        if (!secret) {
            throw new BadRequestException('Not found secret by user')
        }

        try {
            const masterShare: string = await this.secretService.constructMasterShare(user)
            const ecies = await E.encrypt(clientPublicKey, masterShare)
            return ecies
        } catch ({ message }) {
            throw new InternalServerErrorException('Error at secretService.constructMasterShare', message)
        }
    }
}
