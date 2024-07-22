import { IsNotEmpty } from 'class-validator'

export class ExchangeCommitmentDto {
    @IsNotEmpty()
    readonly clientCommitment: string

    @IsNotEmpty()
    readonly clientPublicKey: string
}
