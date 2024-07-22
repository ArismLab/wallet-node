export type DerivePublicKeyRequest = {
    user: string
}
export type DerivePublicKeyResponse = {
    publicKey: string
}
export type InitializeSecretRequest = {
    user: string
}
export type InitializeSecretResponse = {
    publicKey: string
}
export type IssueShareRequest = {
    user: string
    share: string
}
export type IssueShareResponse = void
export type ConstructMasterShareRequest = {
    idToken: string
    clientPublicKey: string
    commitment: {
        signature: string
        publicKey: string
    }
    user: string
}
export type ConstructMasterShareResponse = Ecies
