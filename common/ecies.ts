import * as Crypto from '@toruslabs/eccrypto'

export const decrypt = async (privateKey: string, opts: Ecies): Promise<string> => {
    const deserializedPrivateKey: Buffer = Buffer.from(privateKey, 'hex')
    const deserializeOpts: Crypto.Ecies = {
        iv: Buffer.from(opts.iv, 'hex'),
        ephemPublicKey: Buffer.from(opts.ephemPublicKey, 'hex'),
        ciphertext: Buffer.from(opts.ciphertext, 'hex'),
        mac: Buffer.from(opts.mac, 'hex'),
    }

    const decrypted: Buffer = await Crypto.decrypt(deserializedPrivateKey, deserializeOpts)
    const serializedDecrypted: string = decrypted.toString('hex')

    return serializedDecrypted
}

export const encrypt = async (publicKeyTo: string, msg: string): Promise<Ecies> => {
    const deserializedPublicKeyTo: Buffer = Buffer.from(publicKeyTo, 'hex')
    const deserializedMsg: Buffer = Buffer.from(msg, 'hex')

    const encrypted: Crypto.Ecies = await Crypto.encrypt(deserializedPublicKeyTo, deserializedMsg)
    const serializedEncrypted: Ecies = {
        iv: encrypted.iv.toString('hex'),
        ephemPublicKey: encrypted.ephemPublicKey.toString('hex'),
        ciphertext: encrypted.ciphertext.toString('hex'),
        mac: encrypted.mac.toString('hex'),
    }

    return serializedEncrypted
}

export const getPublicKey = (privateKey: string): string => {
    const deserializedPrivateKey: Buffer = Buffer.from(privateKey, 'hex')

    const publicKey: Buffer = Crypto.getPublic(deserializedPrivateKey)
    const serializedPublicKey: string = publicKey.toString('hex')

    return serializedPublicKey
}

export const generatePrivateKey = (): string => {
    const privateKey: Buffer = Crypto.generatePrivate()
    const serializedPrivateKey: string = privateKey.toString('hex')
    return serializedPrivateKey
}

export const generateKeyPair = (): [string, string] => {
    const privateKey: Buffer = Crypto.generatePrivate()
    const publicKey: Buffer = Crypto.getPublic(privateKey)

    const serializedPrivateKey: string = privateKey.toString('hex')
    const serializedPublicKey: string = publicKey.toString('hex')

    return [serializedPrivateKey, serializedPublicKey]
}
