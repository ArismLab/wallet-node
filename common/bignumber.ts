import BN from 'bn.js'
import Web3 from 'web3'

export const ZERO = new BN(0)
export const ONE = new BN(1)
export const TWO = new BN(2)

export const from = (
    value: number | string | number[] | Uint8Array | Buffer | BN,
    base?: number | 'hex',
    endian?: BN.Endianness
): BN => {
    return new BN(value, base, endian)
}

export const to = (value: BN): string => {
    return value.toString()
}

export const randomHex = (bytes: number): string => {
    return Web3.utils.randomHex(bytes)
}
