---
title: 配置管理
description: 全局配置管理和 Token 管理
---

配置管理模块提供了全局配置设置、获取、重置以及 Token 管理等功能。

## API 列表

| 方法 | 说明 | 返回类型 |
|------|------|----------|
| `setConfig(config)` | 设置全局配置 | `void` |
| `getConfig()` | 获取当前配置 | `NsHttpConfig` |
| `resetConfig()` | 重置配置为默认值 | `void` |
| `getToken()` | 获取 Token | `string \| null` |
| `setToken(token)` | 设置 Token | `void` |
| `removeToken()` | 移除 Token | `void` |
| `clearAuth()` | 清除所有认证信息 | `void` |

## setConfig(config)

设置全局配置，支持以下选项：

### 参数

```typescript
interface NsHttpConfig {
  baseURL: string                    // API 基础 URL（必填）
  timeout?: number                   // 超时时间（毫秒），默认 30000
  headers?: Record<string, string>   // 默认请求头
  language?: string                  // 多语言编码，默认 'zh-CN'
  tokenKey?: string                  // Token 存储 key，默认 'access_token'
  autoRefreshToken?: boolean         // 是否自动刷新 token，默认 false
  requestInterceptor?: Function      // 请求拦截器
  responseInterceptor?: Function     // 响应拦截器
  errorHandler?: Function            // 错误处理器
}
```

### 基础示例

```typescript
import { setConfig } from '@nine-shadow/http-utils'

setConfig({
  baseURL: 'https://api.example.com',
  timeout: 30000,
  language: 'zh-CN',
  tokenKey: 'access_token'
})
```

### 自定义请求头

```typescript
setConfig({
  baseURL: 'https://api.example.com',
  headers: {
    'X-App-Version': '1.0.0',
    'X-Platform': 'web'
  }
})
```

### 请求拦截器

在发送请求前修改请求配置：

```typescript
setConfig({
  baseURL: 'https://api.example.com',
  requestInterceptor: (config) => {
    // 添加时间戳
    config.headers['X-Timestamp'] = Date.now().toString()
    
    // 添加签名
    config.headers['X-Signature'] = generateSignature(config)
    
    return config
  }
})
```

### 响应拦截器

处理响应数据：

```typescript
setConfig({
  baseURL: 'https://api.example.com',
  responseInterceptor: (response) => {
    const data = response.data
    
    // 统一处理业务错误
    if (!data.success) {
      throw new Error(data.message)
    }
    
    // 只返回业务数据
    return data.result
  }
})
```

### 错误处理器

统一处理请求错误：

```typescript
setConfig({
  baseURL: 'https://api.example.com',
  errorHandler: (error) => {
    const status = error.response?.status
    
    if (status === 401) {
      // 未授权，跳转登录
      window.location.href = '/login'
    } else if (status === 403) {
      // 无权限
      alert('无权限访问')
    } else if (status === 500) {
      // 服务器错误
      alert('服务器错误，请稍后重试')
    }
  }
})
```

## getConfig()

获取当前配置：

```typescript
import { getConfig } from '@nine-shadow/http-utils'

const config = getConfig()
console.log(config.baseURL)
console.log(config.timeout)
```

## resetConfig()

重置配置为默认值：

```typescript
import { resetConfig } from '@nine-shadow/http-utils'

// 重置所有配置
resetConfig()
```

## Token 管理

### getToken()

获取当前存储的 Token：

```typescript
import { getToken } from '@nine-shadow/http-utils'

const token = getToken()
if (token) {
  console.log('已登录')
} else {
  console.log('未登录')
}
```

### setToken(token)

手动设置 Token：

```typescript
import { setToken } from '@nine-shadow/http-utils'

// 设置 token
setToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
```

### removeToken()

移除 Token：

```typescript
import { removeToken } from '@nine-shadow/http-utils'

// 移除 token
removeToken()
```

### clearAuth()

清除所有认证信息（包括 Token 和其他认证相关数据）：

```typescript
import { clearAuth } from '@nine-shadow/http-utils'

// 清除所有认证信息
clearAuth()
```

## 高级用法

### Token 自动刷新

配置自动刷新 Token 机制：

```typescript
import { setConfig, refreshToken, setToken } from '@nine-shadow/http-utils'

setConfig({
  baseURL: 'https://api.example.com',
  autoRefreshToken: true,
  
  requestInterceptor: async (config) => {
    // 检查 token 是否即将过期
    const tokenExpireTime = getTokenExpireTime()
    const now = Date.now()
    
    // 如果 token 将在 5 分钟内过期，则刷新
    if (tokenExpireTime - now < 5 * 60 * 1000) {
      try {
        const newToken = await refreshToken()
        setToken(newToken.accessToken)
      } catch (error) {
        // 刷新失败，跳转登录
        window.location.href = '/login'
      }
    }
    
    return config
  }
})
```

### 多环境配置

根据不同环境使用不同配置：

```typescript
import { setConfig } from '@nine-shadow/http-utils'

const isDev = import.meta.env.DEV
const isProd = import.meta.env.PROD

setConfig({
  baseURL: isDev 
    ? 'https://dev-api.example.com' 
    : 'https://api.example.com',
  timeout: isDev ? 60000 : 30000,
  errorHandler: (error) => {
    if (isDev) {
      // 开发环境显示详细错误
      console.error('API Error:', error)
    } else {
      // 生产环境只显示友好提示
      alert('操作失败，请稍后重试')
    }
  }
})
```

### 请求重试

实现请求失败自动重试：

```typescript
setConfig({
  baseURL: 'https://api.example.com',
  requestInterceptor: (config) => {
    // 添加重试配置
    config.retry = 3
    config.retryDelay = 1000
    return config
  },
  errorHandler: async (error) => {
    const config = error.config
    
    if (config.retry > 0) {
      config.retry--
      await new Promise(resolve => setTimeout(resolve, config.retryDelay))
      return axios(config)
    }
    
    throw error
  }
})
```

### 请求缓存

实现简单的请求缓存：

```typescript
const cache = new Map()

setConfig({
  baseURL: 'https://api.example.com',
  requestInterceptor: (config) => {
    // 只缓存 GET 请求
    if (config.method === 'get') {
      const cacheKey = config.url + JSON.stringify(config.params)
      const cached = cache.get(cacheKey)
      
      if (cached && Date.now() - cached.time < 60000) {
        // 返回缓存数据
        return Promise.reject({ cached: cached.data })
      }
    }
    
    return config
  },
  responseInterceptor: (response) => {
    // 缓存响应
    if (response.config.method === 'get') {
      const cacheKey = response.config.url + JSON.stringify(response.config.params)
      cache.set(cacheKey, {
        data: response.data,
        time: Date.now()
      })
    }
    
    return response.data
  }
})
```

## 最佳实践

1. **在应用入口配置**：在 `main.ts` 或 `main.js` 中统一配置
2. **使用环境变量**：不同环境使用不同的配置
3. **统一错误处理**：通过 `errorHandler` 统一处理错误
4. **Token 管理**：使用内置的 Token 管理方法，避免手动操作 localStorage
5. **类型安全**：使用 TypeScript 时导入类型定义

## 相关链接

- [HTTP 请求](/core/http/)
- [IAM 身份认证](/modules/iam/)
