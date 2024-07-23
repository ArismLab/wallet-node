export type DerivePublicKeyRequest = {
    user: string
}
export type DerivePublicKeyResponse = {
    publicKey: string
}
export type InitializeSecretRequest = DerivePublicKeyRequest
export type InitializeSecretResponse = DerivePublicKeyResponse
export type IssueShareRequest = {
    user: string
    share: string
}
export type IssueShareResponse = void
export type DeriveMasterShareRequest = {
    idToken: string
    clientPublicKey: string
    nodeCommitment: string
    user: string
}
export type DeriveMasterShareResponse = Ecies
export type ConstructMasterShareRequest = DeriveMasterShareRequest
export type ConstructMasterShareResponse = DeriveMasterShareResponse
