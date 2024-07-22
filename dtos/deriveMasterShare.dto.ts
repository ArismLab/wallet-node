import { IsNotEmpty } from 'class-validator'
import { CommitmentDto } from '@dtos'

export class DeriveMasterShareDto {
    @IsNotEmpty()
    readonly user: string

    @IsNotEmpty()
    readonly idToken: string

    @IsNotEmpty()
    readonly clientPublicKey: string

    readonly commitment: CommitmentDto
}
