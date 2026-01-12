'use client'

import type { KeyValuePair } from '../types'

interface WebSealFormProps {
  publicKey: string
  keyValues: KeyValuePair[]
  namespace: string
  secretName: string
  loading: boolean
  onPublicKeyChange: (value: string) => void
  onNamespaceChange: (value: string) => void
  onSecretNameChange: (value: string) => void
  onAddKeyValue: () => void
  onRemoveKeyValue: (id: string) => void
  onUpdateKeyValue: (id: string, field: 'key' | 'value', value: string) => void
  onSubmit: (e: React.FormEvent) => void
  className?: string
}

export function WebSealForm({
  publicKey,
  keyValues,
  namespace,
  secretName,
  loading,
  onPublicKeyChange,
  onNamespaceChange,
  onSecretNameChange,
  onAddKeyValue,
  onRemoveKeyValue,
  onUpdateKeyValue,
  onSubmit,
  className = '',
}: WebSealFormProps) {
  return (
    <div className={`bg-white rounded border border-gray-200 elevation-1 p-6 ${className}`}>
      <h2 className="text-lg font-medium text-gray-900 mb-6">Configuration</h2>
      
      <form onSubmit={onSubmit} className="space-y-5">
        {/* Public Key */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Public Key (PEM)
          </label>
          <textarea
            value={publicKey}
            onChange={(e) => onPublicKeyChange(e.target.value)}
            className="w-full px-3 py-2 rounded material-input text-sm font-mono h-32 resize-y"
            placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
            required
          />
        </div>

        {/* Namespace & Name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Namespace
            </label>
            <input
              type="text"
              value={namespace}
              onChange={(e) => onNamespaceChange(e.target.value)}
              className="w-full px-3 py-2 rounded material-input text-sm"
              placeholder="default"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Secret Name
            </label>
            <input
              type="text"
              value={secretName}
              onChange={(e) => onSecretNameChange(e.target.value)}
              className="w-full px-3 py-2 rounded material-input text-sm"
              placeholder="my-secret"
            />
          </div>
        </div>

        {/* Key-Value Pairs */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Secret Data
          </label>
          <div className="space-y-2">
            {keyValues.map((kv) => (
              <div key={kv.id} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={kv.key}
                  onChange={(e) => onUpdateKeyValue(kv.id, 'key', e.target.value)}
                  className="flex-1 px-3 py-2 rounded material-input text-sm"
                  placeholder="key"
                />
                <span className="text-gray-400">=</span>
                <input
                  type="text"
                  value={kv.value}
                  onChange={(e) => onUpdateKeyValue(kv.id, 'value', e.target.value)}
                  className="flex-1 px-3 py-2 rounded material-input text-sm"
                  placeholder="value"
                />
                <button
                  type="button"
                  onClick={() => onRemoveKeyValue(kv.id)}
                  className="p-2 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  disabled={keyValues.length === 1}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={onAddKeyValue}
            className="mt-2 flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 material-btn-text px-2 py-1 rounded"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Field
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded material-btn text-sm flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </>
          ) : (
            'Generate Sealed Secret'
          )}
        </button>
      </form>
    </div>
  )
}
