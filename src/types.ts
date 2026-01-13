export type SealScope = 'cluster' | 'namespace' | 'strict'

export interface SealRequest {
  publicKey: string
  data: Record<string, string>
  namespace?: string
  name?: string
  scope?: SealScope
}

export interface SealResponse {
  sealedData: Record<string, string>
  resourceYAML: string
}

export interface KeyValuePair {
  id: string
  key: string
  value: string
}

export interface WebSealConfig {
  apiEndpoint?: string
}

