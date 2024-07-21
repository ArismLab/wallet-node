import { BadRequestException, Body, Controller, Post } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { CommitmentDto, CreateCommitmentDto } from '@dtos'
import { CommitmentService } from '@services'
import { C } from '@common'

@Controller('commitment')
export class CommitmentController {
    constructor(
        private readonly commitmentService: CommitmentService,
        private configService: ConfigService
    ) {}

    @Post()
    async createCommitment(@Body() data: CreateCommitmentDto): Promise<CommitmentDto> {
        const { commitment, clientPublicKey } = data

        const existedCommitment = await this.commitmentService.find(commitment)

        if (existedCommitment) {
            throw new BadRequestException('Commitment already exists')
        }

        await this.commitmentService.create(commitment, clientPublicKey)

        const privateKey = this.configService.get<string>('privateKey')
        const keyPair = C.secp256k1.keyFromPrivate(privateKey)
        const publicKey = keyPair.getPublic('hex')

        const signature = keyPair.sign(commitment + ',' + clientPublicKey).toDER('hex')

        return { signature, publicKey }
    }
}
