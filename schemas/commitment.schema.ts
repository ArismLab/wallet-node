import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type CommitmentDocument = HydratedDocument<Commitment>

@Schema({ timestamps: true })
export class Commitment {
    @Prop({ required: true })
    commitment: string

    @Prop()
    clientPublicKey: string
}

export const CommitmentSchema = SchemaFactory.createForClass(Commitment)
