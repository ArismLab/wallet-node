import { BadRequestException, Body, Controller, InternalServerErrorException, Post } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { CommitmentService } from '@services'
import { C } from '@common'
import { Commitment } from '@schemas'
import { ExchangeCommitmentRequest, ExchangeCommitmentResponse } from '@dtos'

@Controller('commitment')
export class CommitmentController {
    constructor(
        private readonly commitmentService: CommitmentService,
        private readonly configService: ConfigService
    ) {}

    @Post()
    async exchangeCommitment(@Body() data: ExchangeCommitmentRequest): Promise<ExchangeCommitmentResponse> {
        const { clientCommitment, clientPublicKey } = data

        const existedCommitment: Commitment | null = await this.commitmentService.find(clientCommitment)
        if (existedCommitment) {
            throw new BadRequestException('Commitment already exists')
        }

        try {
            await this.commitmentService.create(clientCommitment, clientPublicKey)
        } catch ({ message }) {
            throw new InternalServerErrorException('Error at commitmentService.create', message)
        }

        const privateKey = this.configService.get<string>('privateKey')
        const keyPair = C.secp256k1.keyFromPrivate(privateKey)
        const publicKey = keyPair.getPublic('hex')
        // TODO: USE THIS
        const signature = keyPair.sign(clientCommitment + ',' + clientPublicKey).toDER('hex')

        return { publicKey }
    }
}
