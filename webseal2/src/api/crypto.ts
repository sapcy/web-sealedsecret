import forge from 'node-forge'

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
 * Encrypt a single value using RSA-OAEP with SHA-256
 */
export function sealValue(publicKey: forge.pki.rsa.PublicKey, value: string): string {
  const encrypted = publicKey.encrypt(value, 'RSA-OAEP', {
    md: forge.md.sha256.create(),
    mgf1: {
      md: forge.md.sha256.create()
    }
  })
  return forge.util.encode64(encrypted)
}

/**
 * Encrypt all values in a data object
 */
export function sealData(
  publicKey: forge.pki.rsa.PublicKey,
  data: Record<string, string>
): Record<string, string> {
  const sealedData: Record<string, string> = {}
  for (const [key, value] of Object.entries(data)) {
    sealedData[key] = sealValue(publicKey, value)
  }
  return sealedData
}

/**
 * Generate Kubernetes SealedSecret YAML
 */
export function generateSealedSecretYAML(
  name: string,
  namespace: string,
  sealedData: Record<string, string>
): string {
  const lines = [
    'apiVersion: bitnami.com/v1alpha1',
    'kind: SealedSecret',
    'metadata:',
    `  name: ${name}`,
    `  namespace: ${namespace}`,
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

