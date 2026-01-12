import { parsePublicKey, sealData, generateSealedSecretYAML } from './crypto'
import type { SealRequest, SealResponse } from '../types'

/**
 * Seal secrets using the provided public key
 */
export function sealSecrets(request: SealRequest): SealResponse {
  const { publicKey: pemKey, data, namespace = 'default', name = 'my-secret' } = request

  if (!pemKey) {
    throw new Error('Public key is required')
  }

  if (!data || Object.keys(data).length === 0) {
    throw new Error('Data is required')
  }

  const publicKey = parsePublicKey(pemKey)
  const sealedData = sealData(publicKey, data)
  const resourceYAML = generateSealedSecretYAML(name, namespace, sealedData)

  return {
    sealedData,
    resourceYAML,
  }
}

