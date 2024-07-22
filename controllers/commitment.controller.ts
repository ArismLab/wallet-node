import { BadRequestException, Body, Controller, InternalServerErrorException, Post } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { CommitmentDto, ExchangeCommitmentDto } from '@dtos'
import { CommitmentService } from '@services'
import { C } from '@common'
import { Commitment } from '@schemas'

@Controller('commitment')
export class CommitmentController {
    constructor(
        private readonly commitmentService: CommitmentService,
        private configService: ConfigService
    ) {}

    @Post()
    async exchangeCommitment(@Body() data: ExchangeCommitmentDto): Promise<CommitmentDto> {
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
        const signature = keyPair.sign(clientCommitment + ',' + clientPublicKey).toDER('hex')

        const commitment: CommitmentDto = { signature, publicKey }
        return commitment
    }
}
