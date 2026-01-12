'use client'

import type { SealResponse } from '../types'

interface WebSealOutputProps {
  result: SealResponse | null
  error: string | null
  copied: boolean
  onCopy: () => void
  className?: string
}

export function WebSealOutput({
  result,
  error,
  copied,
  onCopy,
  className = '',
}: WebSealOutputProps) {
  return (
    <div className={`bg-white rounded border border-gray-200 elevation-1 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Output</h2>
        {result && (
          <button
            onClick={onCopy}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-sm material-btn-text"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded bg-gray-100 border border-gray-300">
          <p className="text-sm text-gray-700">{error}</p>
        </div>
      )}

      {result ? (
        <div className="code-block rounded p-4 overflow-auto max-h-[500px]">
          <pre className="text-sm text-gray-800 whitespace-pre">
            {result.resourceYAML}
          </pre>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm text-center">
            Enter configuration and click<br />
            <span className="font-medium text-gray-600">Generate Sealed Secret</span>
          </p>
        </div>
      )}
    </div>
  )
}
