import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { HttpModule } from '@nestjs/axios'

import { GoogleVerifier } from '@verifiers/google.verifier'

import configuration from '@config'
import * as controllers from '@controllers'
import * as services from '@services'
import { Commitment, CommitmentSchema, Secret, SecretSchema, Wallet, WalletSchema } from '@schemas'

@Module({
    imports: [
        HttpModule,
        ConfigModule.forRoot({
            load: [configuration],
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => {
                return {
                    uri: configService.get<string>('database.mongoUri'),
                }
            },
            inject: [ConfigService],
        }),
        MongooseModule.forFeature([
            { name: Commitment.name, schema: CommitmentSchema },
            { name: Wallet.name, schema: WalletSchema },
            { name: Secret.name, schema: SecretSchema },
        ]),
        ConfigModule,
    ],
    controllers: [].concat(Object.values(controllers)),
    providers: [].concat(Object, Object.values(services), GoogleVerifier),
})
export class AppModule {}
