import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Wallet, WalletDocument } from '@schemas'

@Injectable()
export class WalletService {
    constructor(@InjectModel(Wallet.name) private walletModel: Model<WalletDocument>) {}

    async find(user: string): Promise<Wallet> {
        return this.walletModel.findOne({ user }).exec()
    }

    async create(user: string, address: string, publicKey: string): Promise<Wallet> {
        return this.walletModel.create({ user, address, publicKey })
    }
}
