# @sapcy/web-sealedsecret

Kubernetes Sealed Secrets를 생성하기 위한 React 컴포넌트 및 API 라이브러리입니다.

## 설치

```bash
npm install @sapcy/web-sealedsecret
# 또는
yarn add @sapcy/web-sealedsecret
```

## 사용법

### React 컴포넌트 사용

```tsx
import { useWebSeal, WebSealForm, WebSealOutput } from '@sapcy/web-sealedsecret/components'

function MyComponent() {
  const webseal = useWebSeal({ apiEndpoint: '/api/seal' })

  return (
    <div className="grid grid-cols-2 gap-6">
      <WebSealForm
        publicKey={webseal.publicKey}
        keyValues={webseal.keyValues}
        namespace={webseal.namespace}
        secretName={webseal.secretName}
        loading={webseal.loading}
        onPublicKeyChange={webseal.setPublicKey}
        onNamespaceChange={webseal.setNamespace}
        onSecretNameChange={webseal.setSecretName}
        onAddKeyValue={webseal.addKeyValue}
        onRemoveKeyValue={webseal.removeKeyValue}
        onUpdateKeyValue={webseal.updateKeyValue}
        onSubmit={webseal.handleSubmit}
      />
      <WebSealOutput
        result={webseal.result}
        error={webseal.error}
        copied={webseal.copied}
        onCopy={webseal.copyToClipboard}
      />
    </div>
  )
}
```

### API 직접 사용 (SSR/API Routes)

```ts
import { sealSecrets } from '@sapcy/web-sealedsecret/api'

// Next.js API Route 예시
export async function POST(request: Request) {
  const body = await request.json()
  
  try {
    const result = sealSecrets(body)
    return Response.json(result)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 })
  }
}
```

### 저수준 API 사용

```ts
import { parsePublicKey, sealData, generateSealedSecretYAML } from '@sapcy/web-sealedsecret/api'

const publicKey = parsePublicKey(pemCertificate)
const sealedData = sealData(publicKey, { username: 'admin', password: 'secret' })
const yaml = generateSealedSecretYAML('my-secret', 'default', sealedData)
```

## API

### Components

- `useWebSeal(config?)` - WebSeal 상태 관리 훅
- `WebSealForm` - 입력 폼 컴포넌트
- `WebSealOutput` - 결과 출력 컴포넌트

### API Functions

- `sealSecrets(request)` - 시크릿 암호화 및 YAML 생성
- `parsePublicKey(pem)` - PEM 인증서/공개키 파싱
- `sealValue(publicKey, value)` - 단일 값 암호화
- `sealData(publicKey, data)` - 여러 값 암호화
- `generateSealedSecretYAML(name, namespace, sealedData)` - YAML 생성

## 라이선스

MIT

