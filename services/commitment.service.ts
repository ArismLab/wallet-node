import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Commitment, CommitmentDocument } from '@schemas'

@Injectable()
export class CommitmentService {
    constructor(
        @InjectModel(Commitment.name)
        private commitmentModel: Model<CommitmentDocument>
    ) {}

    async find(clientCommitment: string): Promise<Commitment | null> {
        const commitment: Commitment | null = await this.commitmentModel.findOne({ clientCommitment })
        return commitment
    }

    async create(clientCommitment: string, clientPublicKey: string): Promise<Commitment> {
        // TODO: TEST PURPOSE ONLY
        // const existed: Commitment | null = await this.commitmentModel.findOne({ clientCommitment })

        // if (existed) {
        //     throw new Error('Commitment already exists')
        // }

        const created: Commitment = await this.commitmentModel.create({ clientCommitment, clientPublicKey })
        return created
    }
}
