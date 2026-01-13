import { encryptValue, getSealedSecret } from '@socialgouv/aes-gcm-rsa-oaep'
import forge from 'node-forge'

// Library uses 'cluster' | 'namespace' | 'strict'
type LibraryScope = 'cluster' | 'namespace' | 'strict'

/**
 * Parse PEM-encoded certificate or public key
 */
export function parsePublicKey(pemKey: string): forge.pki.rsa.PublicKey {
  try {
    // Try parsing as certificate first
    const cert = forge.pki.certificateFromPem(pemKey)
    return cert.publicKey as forge.pki.rsa.PublicKey
  } catch {
    try {
      // Try parsing as public key directly
      return forge.pki.publicKeyFromPem(pemKey)
    } catch (e) {
      throw new Error(`Failed to parse public key: ${e}`)
    }
  }
}

/**
 * Encrypt a single value using @socialgouv/aes-gcm-rsa-oaep
 * This is compatible with Kubernetes Sealed Secrets Controller
 */
export async function sealValue(
  pemKey: string, 
  value: string,
  namespace: string,
  name: string,
  scope: LibraryScope = 'strict'
): Promise<string> {
  const encrypted = await encryptValue({
    pemKey,
    namespace,
    name,
    scope,
    value
  })
  
  return encrypted
}

/**
 * Encrypt all values in a data object
 */
export async function sealData(
  pemKey: string,
  data: Record<string, string>,
  namespace: string,
  name: string,
  scope: LibraryScope = 'strict'
): Promise<Record<string, string>> {
  const sealedData: Record<string, string> = {}
  
  for (const [key, value] of Object.entries(data)) {
    sealedData[key] = await sealValue(pemKey, value, namespace, name, scope)
  }
  
  return sealedData
}

/**
 * Generate complete SealedSecret object using @socialgouv/aes-gcm-rsa-oaep
 */
export async function generateSealedSecret(
  pemKey: string,
  data: Record<string, string>,
  namespace: string,
  name: string,
  scope: LibraryScope = 'strict'
): Promise<object> {
  const sealedSecret = await getSealedSecret({
    pemKey,
    namespace,
    name,
    scope,
    values: data
  })
  
  return sealedSecret
}

/**
 * Generate Kubernetes SealedSecret YAML from sealed data
 */
export function generateSealedSecretYAML(
  name: string,
  namespace: string,
  sealedData: Record<string, string>,
  scope: LibraryScope = 'strict'
): string {
  const lines = [
    'apiVersion: bitnami.com/v1alpha1',
    'kind: SealedSecret',
    'metadata:',
    `  name: ${name}`,
    `  namespace: ${namespace}`,
    '  annotations:',
    `    sealedsecrets.bitnami.com/cluster-wide: "${scope === 'cluster'}"`,
    `    sealedsecrets.bitnami.com/namespace-wide: "${scope === 'namespace'}"`,
    'spec:',
    '  encryptedData:',
  ]

  for (const [key, value] of Object.entries(sealedData)) {
    lines.push(`    ${key}: ${value}`)
  }

  lines.push(
    '  template:',
    '    metadata:',
    `      name: ${name}`,
    `      namespace: ${namespace}`,
    '    type: Opaque'
  )

  return lines.join('\n')
}
