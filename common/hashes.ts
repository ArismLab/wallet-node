import keccak from 'keccak'

export function keccak256(data: string | Buffer): string {
    const hash = keccak('keccak256').update(data).digest('hex')

    return `0x${hash}`
}
