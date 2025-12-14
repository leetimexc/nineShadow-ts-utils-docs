---
title: 安装配置
description: 详细的安装和配置指南
---

## 环境要求

- **Node.js**: >= 16.0.0
- **TypeScript**: >= 5.0.0（如果使用 TypeScript）
- **Axios**: >= 1.0.0（作为 peer dependency）

## 安装

### 从私服安装

九影科技内部项目推荐使用私服拉取依赖，速度更快且稳定：

```bash
# npm
npm install @nineshadow/http-utils --registry="https://nexus.9shadow.com/repository/npm-public/"

# pnpm
pnpm add @nineshadow/http-utils --registry="https://nexus.9shadow.com/repository/npm-public/"

# yarn
yarn add @nineshadow/http-utils --registry="https://nexus.9shadow.com/repository/npm-public/"
```

:::tip[配置 npm 私服]
为了避免每次都输入 `--registry` 参数，可以配置 `.npmrc` 文件：

```ini
# .npmrc
registry=https://nexus.9shadow.com/repository/npm-public/
```

或者只为 `@nineshadow` 作用域配置私服：

```ini
# .npmrc
@nineshadow:registry=https://nexus.9shadow.com/repository/npm-public/
```

:::

:::note[私服账号信息]

- **账号**: web
- **密码**: 请联系管理员获取
- **私服地址**: https://nexus.9shadow.com/repository/npm-public/
  :::

## TypeScript 配置

如果你使用 TypeScript，确保 `tsconfig.json` 中包含以下配置：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true
  }
}
```

## 全局配置

### 基础配置

在应用入口文件中设置全局配置：

```typescript
import { setConfig } from '@nine-shadow/http-utils'

setConfig({
  baseURL: 'https://api.example.com',
  timeout: 30000,
  language: 'zh-CN',
  tokenKey: 'access_token',
})
```

### 完整配置选项

```typescript
import { setConfig } from '@nine-shadow/http-utils'
import type { NsHttpConfig } from '@nine-shadow/http-utils'

const config: NsHttpConfig = {
  // 必填：API 基础 URL
  baseURL: 'https://api.example.com',

  // 可选：超时时间（毫秒），默认 30000
  timeout: 30000,

  // 可选：多语言编码，默认 'zh-CN'
  language: 'zh-CN',

  // 可选：Token 存储 key，默认 'access_token'
  tokenKey: 'access_token',

  // 可选：是否自动刷新 token，默认 false
  autoRefreshToken: true,

  // 可选：默认请求头
  headers: {
    'X-Custom-Header': 'custom-value',
  },

  // 可选：请求拦截器
  requestInterceptor: (config) => {
    // 在发送请求前做些什么
    console.log('发送请求:', config.url)
    return config
  },

  // 可选：响应拦截器
  responseInterceptor: (response) => {
    // 对响应数据做些什么
    return response.data
  },

  // 可选：错误处理器
  errorHandler: (error) => {
    // 对响应错误做些什么
    console.error('请求错误:', error)
  },
}

setConfig(config)
```

## 配置管理 API

### getConfig()

获取当前配置：

```typescript
import { getConfig } from '@nine-shadow/http-utils'

const currentConfig = getConfig()
console.log(currentConfig.baseURL)
```

### resetConfig()

重置配置为默认值：

```typescript
import { resetConfig } from '@nine-shadow/http-utils'

resetConfig()
```

### Token 管理

```typescript
import {
  getToken,
  setToken,
  removeToken,
  clearAuth,
} from '@nine-shadow/http-utils'

// 获取 token
const token = getToken()

// 设置 token
setToken('new-token-value')

// 移除 token
removeToken()

// 清除所有认证信息
clearAuth()
```

## 模块导入

### 按需导入（推荐）

```typescript
// 只导入需要的功能
import {
  setConfig,
  loginByPhoneCaptcha,
  uploadFile,
} from '@nine-shadow/http-utils'
```

### 命名空间导入

```typescript
// 导入整个模块
import * as nsHttp from '@nine-shadow/http-utils'

nsHttp.setConfig({ baseURL: 'https://api.example.com' })
await nsHttp.loginByPhoneCaptcha({ phone: '18639150947', captcha: '123456' })
```

### 默认导入

```typescript
// 使用默认导出
import NsHttp from '@nine-shadow/http-utils'

NsHttp.setConfig({ baseURL: 'https://api.example.com' })
await NsHttp.iam.loginByPhoneCaptcha({
  phone: '18639150947',
  captcha: '123456',
})
await NsHttp.upload.uploadFile(file)
```

## 类型导入

```typescript
// 导入类型定义
import type {
  NsHttpConfig,
  LoginResponse,
  UserInfo,
  UploadOptions,
} from '@nine-shadow/http-utils'

const config: NsHttpConfig = {
  baseURL: 'https://api.example.com',
}

const handleLogin = async (): Promise<LoginResponse> => {
  // ...
}
```

## 环境变量配置

推荐使用环境变量管理不同环境的配置：

```typescript
// .env.development
VITE_API_BASE_URL=https://dev-api.example.com

// .env.production
VITE_API_BASE_URL=https://api.example.com
```

```typescript
// main.ts
import { setConfig } from '@nine-shadow/http-utils'

setConfig({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
})
```

## 常见问题

### 如何处理跨域问题？

跨域问题需要在服务端配置 CORS，或者在开发环境使用代理：

```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': {
        target: 'https://api.example.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
}
```

### Token 存储在哪里？

默认存储在 `localStorage` 中，key 为 `access_token`（可通过 `tokenKey` 配置修改）。

### 如何自定义错误处理？

通过 `errorHandler` 配置自定义错误处理逻辑：

```typescript
setConfig({
  baseURL: 'https://api.example.com',
  errorHandler: (error) => {
    if (error.response?.status === 401) {
      // 处理未授权错误
      window.location.href = '/login'
    } else if (error.response?.status === 500) {
      // 处理服务器错误
      alert('服务器错误，请稍后重试')
    }
  },
})
```
