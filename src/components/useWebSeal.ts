'use client'

import { useState, useCallback } from 'react'
import type { SealResponse, KeyValuePair, WebSealConfig } from '../types'

export interface UseWebSealReturn {
  // State
  publicKey: string
  keyValues: KeyValuePair[]
  namespace: string
  secretName: string
  result: SealResponse | null
  error: string | null
  loading: boolean
  copied: boolean

  // Actions
  setPublicKey: (value: string) => void
  setNamespace: (value: string) => void
  setSecretName: (value: string) => void
  addKeyValue: () => void
  removeKeyValue: (id: string) => void
  updateKeyValue: (id: string, field: 'key' | 'value', value: string) => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
  copyToClipboard: () => Promise<void>
  reset: () => void
}

export function useWebSeal(config: WebSealConfig = {}): UseWebSealReturn {
  const { apiEndpoint = '/api/seal' } = config

  const [publicKey, setPublicKey] = useState('')
  const [keyValues, setKeyValues] = useState<KeyValuePair[]>([
    { id: crypto.randomUUID(), key: '', value: '' }
  ])
  const [namespace, setNamespace] = useState('default')
  const [secretName, setSecretName] = useState('my-secret')
  const [result, setResult] = useState<SealResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const addKeyValue = useCallback(() => {
    setKeyValues(prev => [...prev, { id: crypto.randomUUID(), key: '', value: '' }])
  }, [])

  const removeKeyValue = useCallback((id: string) => {
    setKeyValues(prev => prev.length > 1 ? prev.filter(kv => kv.id !== id) : prev)
  }, [])

  const updateKeyValue = useCallback((id: string, field: 'key' | 'value', value: string) => {
    setKeyValues(prev => prev.map(kv => kv.id === id ? { ...kv, [field]: value } : kv))
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setResult(null)
    setLoading(true)

    const data: Record<string, string> = {}
    keyValues.forEach(kv => {
      if (kv.key.trim()) {
        data[kv.key.trim()] = kv.value
      }
    })

    if (Object.keys(data).length === 0) {
      setError('최소 하나의 key-value 쌍이 필요합니다')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicKey,
          data,
          namespace,
          name: secretName,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || 'Seal 요청 실패')
      }

      setResult(responseData)
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }, [apiEndpoint, publicKey, keyValues, namespace, secretName])

  const copyToClipboard = useCallback(async () => {
    if (result?.resourceYAML) {
      await navigator.clipboard.writeText(result.resourceYAML)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [result])

  const reset = useCallback(() => {
    setPublicKey('')
    setKeyValues([{ id: crypto.randomUUID(), key: '', value: '' }])
    setNamespace('default')
    setSecretName('my-secret')
    setResult(null)
    setError(null)
    setCopied(false)
  }, [])

  return {
    publicKey,
    keyValues,
    namespace,
    secretName,
    result,
    error,
    loading,
    copied,
    setPublicKey,
    setNamespace,
    setSecretName,
    addKeyValue,
    removeKeyValue,
    updateKeyValue,
    handleSubmit,
    copyToClipboard,
    reset,
  }
}

