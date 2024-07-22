import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type SecretDocument = HydratedDocument<Secret>

@Schema({ timestamps: true })
export class Secret {
    @Prop({ required: true, lowercase: true, trim: true })
    user: string

    @Prop({ required: true })
    secret: string

    @Prop({ required: true })
    claimedShares: string[]

    @Prop()
    masterShare: string
}

export const SecretSchema = SchemaFactory.createForClass(Secret)
