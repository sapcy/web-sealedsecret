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
 * Sealed Secrets uses hybrid encryption:
 * 1. Generate random 32-byte session key
 * 2. Encrypt session key with RSA-OAEP-SHA256
 * 3. Encrypt data with AES-256-GCM (including label for scope)
 * 4. Concatenate: encrypted_session_key + nonce + ciphertext + tag
 */
export function sealValue(
  publicKey: forge.pki.rsa.PublicKey, 
  value: string,
  namespace: string,
  name: string,
  scope: 'strict' | 'namespace-wide' | 'cluster-wide' = 'strict'
): string {
  // Generate 32-byte session key for AES-256
  const sessionKey = forge.random.getBytesSync(32)
  
  // Generate 12-byte nonce for AES-GCM
  const nonce = forge.random.getBytesSync(12)
  
  // Create label based on scope
  // strict scope: namespace/name
  // namespace-wide scope: namespace/
  // cluster-wide scope: empty
  let label: string
  switch (scope) {
    case 'cluster-wide':
      label = ''
      break
    case 'namespace-wide':
      label = `${namespace}/`
      break
    case 'strict':
    default:
      label = `${namespace}/${name}`
      break
  }
  
  // Encrypt session key with RSA-OAEP-SHA256
  const encryptedSessionKey = publicKey.encrypt(sessionKey, 'RSA-OAEP', {
    md: forge.md.sha256.create(),
    mgf1: {
      md: forge.md.sha256.create()
    }
  })
  
  // Prepare plaintext: label (null-terminated) + value
  // The label is used as additional authenticated data (AAD) in the original implementation
  // but for simplicity, we'll include it in the plaintext
  const plaintext = value
  
  // Create AES-GCM cipher
  const cipher = forge.cipher.createCipher('AES-GCM', sessionKey)
  cipher.start({
    iv: nonce,
    additionalData: label,
    tagLength: 128 // 16 bytes
  })
  cipher.update(forge.util.createBuffer(plaintext, 'utf8'))
  cipher.finish()
  
  const ciphertext = cipher.output.getBytes()
  const tag = cipher.mode.tag.getBytes()
  
  // Concatenate: encrypted_session_key (256 bytes for 2048-bit RSA) + nonce (12 bytes) + ciphertext + tag (16 bytes)
  const sealed = encryptedSessionKey + nonce + ciphertext + tag
  
  return forge.util.encode64(sealed)
}

/**
 * Encrypt all values in a data object
 */
export function sealData(
  publicKey: forge.pki.rsa.PublicKey,
  data: Record<string, string>,
  namespace: string,
  name: string,
  scope: 'strict' | 'namespace-wide' | 'cluster-wide' = 'strict'
): Record<string, string> {
  const sealedData: Record<string, string> = {}
  for (const [key, value] of Object.entries(data)) {
    sealedData[key] = sealValue(publicKey, value, namespace, name, scope)
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
