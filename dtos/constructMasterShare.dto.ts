import { IsNotEmpty } from 'class-validator'
import { CommitmentDto } from '@dtos'

export class ConstructMasterShareDto {
    @IsNotEmpty()
    readonly user: string

    @IsNotEmpty()
    readonly idToken: string

    @IsNotEmpty()
    readonly clientPublicKey: string

    readonly commitments: CommitmentDto[]
}
