import { sealData, generateSealedSecretYAML } from './crypto'
import type { SealRequest, SealResponse, SealScope } from '../types'

/**
 * Seal secrets using the provided public key
 * Uses @socialgouv/aes-gcm-rsa-oaep for Sealed Secrets Controller compatibility
 */
export async function sealSecrets(request: SealRequest): Promise<SealResponse> {
  const { 
    publicKey: pemKey, 
    data, 
    namespace = 'default', 
    name = 'my-secret',
    scope = 'strict'
  } = request

  if (!pemKey) {
    throw new Error('Public key is required')
  }

  if (!data || Object.keys(data).length === 0) {
    throw new Error('Data is required')
  }

  const sealedData = await sealData(pemKey, data, namespace, name, scope as SealScope)
  const resourceYAML = generateSealedSecretYAML(name, namespace, sealedData, scope as SealScope)

  return {
    sealedData,
    resourceYAML,
  }
}
