---
title: HTTP 请求
description: 基础 HTTP 请求方法
---

HTTP 请求模块提供了常用的 HTTP 方法封装，基于 Axios 实现。

## API 列表

| 方法 | 说明 | 参数 |
|------|------|------|
| `get(url, params?, config?)` | GET 请求 | url, params, config |
| `post(url, data?, config?)` | POST 请求 | url, data, config |
| `put(url, data?, config?)` | PUT 请求 | url, data, config |
| `del(url, params?, config?)` | DELETE 请求 | url, params, config |
| `patch(url, data?, config?)` | PATCH 请求 | url, data, config |
| `request(config)` | 通用请求方法 | config |
| `getInstance()` | 获取 Axios 实例 | - |

## GET 请求

发送 GET 请求，通常用于获取数据：

```typescript
import { get } from '@nine-shadow/http-utils'

// 基础用法
const users = await get('/api/users')

// 带查询参数
const users = await get('/api/users', {
  page: 1,
  size: 10,
  status: 'active'
})

// 带自定义配置
const users = await get('/api/users', { page: 1 }, {
  timeout: 5000,
  headers: {
    'X-Custom-Header': 'value'
  }
})
```

## POST 请求

发送 POST 请求，通常用于创建数据：

```typescript
import { post } from '@nine-shadow/http-utils'

// 创建用户
const newUser = await post('/api/users', {
  name: 'John Doe',
  email: 'john@example.com',
  age: 25
})

// 带自定义配置
const result = await post('/api/users', userData, {
  headers: {
    'Content-Type': 'application/json'
  }
})
```

## PUT 请求

发送 PUT 请求，通常用于更新整个资源：

```typescript
import { put } from '@nine-shadow/http-utils'

// 更新用户
const updatedUser = await put('/api/users/123', {
  name: 'Jane Doe',
  email: 'jane@example.com',
  age: 26
})
```

## DELETE 请求

发送 DELETE 请求，用于删除资源：

```typescript
import { del } from '@nine-shadow/http-utils'

// 删除用户
await del('/api/users/123')

// 带查询参数
await del('/api/users/123', {
  force: true
})
```

## PATCH 请求

发送 PATCH 请求，通常用于部分更新资源：

```typescript
import { patch } from '@nine-shadow/http-utils'

// 部分更新用户
const updatedUser = await patch('/api/users/123', {
  age: 27
})
```

## request() 通用方法

使用通用请求方法，支持所有 Axios 配置选项：

```typescript
import { request } from '@nine-shadow/http-utils'

// GET 请求
const users = await request({
  url: '/api/users',
  method: 'GET',
  params: {
    page: 1,
    size: 10
  }
})

// POST 请求
const newUser = await request({
  url: '/api/users',
  method: 'POST',
  data: {
    name: 'John Doe',
    email: 'john@example.com'
  },
  headers: {
    'Content-Type': 'application/json'
  }
})

// 文件上传
const formData = new FormData()
formData.append('file', file)

const result = await request({
  url: '/api/upload',
  method: 'POST',
  data: formData,
  headers: {
    'Content-Type': 'multipart/form-data'
  },
  onUploadProgress: (progressEvent) => {
    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
    console.log(`上传进度: ${progress}%`)
  }
})
```

## getInstance()

获取底层 Axios 实例，用于高级自定义：

```typescript
import { getInstance } from '@nine-shadow/http-utils'

const axios = getInstance()

// 添加请求拦截器
axios.interceptors.request.use(
  (config) => {
    console.log('发送请求:', config.url)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 添加响应拦截器
axios.interceptors.response.use(
  (response) => {
    console.log('收到响应:', response.data)
    return response
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 使用 Axios 的所有功能
const response = await axios.get('/api/users')
```

## 高级用法

### 并发请求

同时发送多个请求：

```typescript
import { get } from '@nine-shadow/http-utils'

const [users, posts, comments] = await Promise.all([
  get('/api/users'),
  get('/api/posts'),
  get('/api/comments')
])
```

### 请求取消

取消正在进行的请求：

```typescript
import { request } from '@nine-shadow/http-utils'
import axios from 'axios'

const controller = new AbortController()

// 发送请求
const promise = request({
  url: '/api/users',
  signal: controller.signal
})

// 取消请求
controller.abort()

try {
  await promise
} catch (error) {
  if (axios.isCancel(error)) {
    console.log('请求已取消')
  }
}
```

### 超时处理

设置请求超时：

```typescript
import { get } from '@nine-shadow/http-utils'

try {
  const users = await get('/api/users', {}, {
    timeout: 5000  // 5 秒超时
  })
} catch (error) {
  if (error.code === 'ECONNABORTED') {
    console.log('请求超时')
  }
}
```

### 重试机制

实现请求失败自动重试：

```typescript
import { request } from '@nine-shadow/http-utils'

async function requestWithRetry(config, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await request(config)
    } catch (error) {
      if (i === maxRetries - 1) throw error
      
      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}

const users = await requestWithRetry({
  url: '/api/users',
  method: 'GET'
})
```

### 请求队列

限制并发请求数量：

```typescript
class RequestQueue {
  private queue: Array<() => Promise<any>> = []
  private running = 0
  private maxConcurrent = 3

  async add<T>(fn: () => Promise<T>): Promise<T> {
    if (this.running >= this.maxConcurrent) {
      await new Promise(resolve => this.queue.push(resolve as any))
    }

    this.running++
    
    try {
      return await fn()
    } finally {
      this.running--
      const next = this.queue.shift()
      if (next) next()
    }
  }
}

const queue = new RequestQueue()

// 添加请求到队列
const results = await Promise.all([
  queue.add(() => get('/api/users/1')),
  queue.add(() => get('/api/users/2')),
  queue.add(() => get('/api/users/3')),
  queue.add(() => get('/api/users/4')),
  queue.add(() => get('/api/users/5'))
])
```

### 请求防抖

避免短时间内重复请求：

```typescript
import { get } from '@nine-shadow/http-utils'

function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: NodeJS.Timeout
  
  return (...args) => {
    clearTimeout(timeoutId)
    
    return new Promise((resolve) => {
      timeoutId = setTimeout(() => {
        resolve(fn(...args))
      }, delay)
    })
  }
}

const searchUsers = debounce(
  (keyword: string) => get('/api/users/search', { keyword }),
  300
)

// 只会发送最后一次请求
searchUsers('john')
searchUsers('jane')
searchUsers('jack')  // 只有这个会被执行
```

## 错误处理

### 基础错误处理

```typescript
import { get } from '@nine-shadow/http-utils'

try {
  const users = await get('/api/users')
} catch (error) {
  if (error.response) {
    // 服务器返回错误状态码
    console.error('状态码:', error.response.status)
    console.error('错误信息:', error.response.data)
  } else if (error.request) {
    // 请求已发送但没有收到响应
    console.error('网络错误')
  } else {
    // 其他错误
    console.error('错误:', error.message)
  }
}
```

### 统一错误处理

通过配置 `errorHandler` 统一处理错误：

```typescript
import { setConfig } from '@nine-shadow/http-utils'

setConfig({
  baseURL: 'https://api.example.com',
  errorHandler: (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || error.message
    
    switch (status) {
      case 400:
        alert(`请求错误: ${message}`)
        break
      case 401:
        alert('未登录或登录已过期')
        window.location.href = '/login'
        break
      case 403:
        alert('无权限访问')
        break
      case 404:
        alert('请求的资源不存在')
        break
      case 500:
        alert('服务器错误，请稍后重试')
        break
      default:
        alert(`请求失败: ${message}`)
    }
  }
})
```

## 最佳实践

1. **使用 TypeScript**：定义请求和响应的类型
2. **错误处理**：始终使用 try-catch 处理异步请求
3. **超时设置**：为重要请求设置合理的超时时间
4. **取消请求**：在组件卸载时取消未完成的请求
5. **请求封装**：将常用的请求封装成函数

## 相关链接

- [配置管理](/core/config/)
- [IAM 身份认证](/modules/iam/)
- [文件上传](/modules/upload/)
