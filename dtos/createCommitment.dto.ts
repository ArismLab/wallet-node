import { IsNotEmpty } from 'class-validator'

export class CreateCommitmentDto {
    @IsNotEmpty()
    readonly commitment: string

    @IsNotEmpty()
    readonly clientPublicKey: string
}
