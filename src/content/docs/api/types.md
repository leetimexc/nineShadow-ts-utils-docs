---
title: 类型定义
description: 完整的 TypeScript 类型定义参考
---

`@nine-shadow/http-utils` 提供了完整的 TypeScript 类型定义。

## 导入类型

```typescript
import type {
  // 配置相关
  NsHttpConfig,
  
  // 通用响应
  ApiResponse,
  
  // IAM 相关
  TextCaptcha,
  TextCaptchaResponse,
  SendPhoneCaptchaRequest,
  SendPhoneCaptchaResponse,
  PhoneCaptchaLoginRequest,
  AccountPasswordLoginRequest,
  LoginResponse,
  RegisterRequest,
  ResetPasswordRequest,
  UpdatePasswordRequest,
  
  // 用户相关
  UserInfo,
  UpdateUserInfoRequest,
  
  // 上传相关
  UploadSignatureRequest,
  UploadSignatureResponse,
  UploadOptions,
  UploadProgressCallback,
  
  // WebSocket 相关
  WebSocketConfig,
  WebSocketMessage,
  SocketBindCodeResponse
} from '@nine-shadow/http-utils'
```

## 配置相关

### NsHttpConfig

全局配置接口：

```typescript
interface NsHttpConfig {
  baseURL: string
  timeout?: number
  headers?: Record<string, string>
  language?: string
  tokenKey?: string
  autoRefreshToken?: boolean
  requestInterceptor?: (config: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>
  responseInterceptor?: (response: AxiosResponse) => any
  errorHandler?: (error: any) => void
}
```

## 通用响应

### ApiResponse

API 响应格式：

```typescript
interface ApiResponse<T = any> {
  success: boolean
  code: number
  message: string
  result: T
}
```

## IAM 身份认证

### TextCaptcha

文字验证码：

```typescript
interface TextCaptcha {
  key: string
  value: string
}
```

### TextCaptchaResponse

文字验证码响应：

```typescript
interface TextCaptchaResponse {
  key: string
  img: string
}
```

### SendPhoneCaptchaRequest

发送手机验证码请求：

```typescript
interface SendPhoneCaptchaRequest {
  phone: string
  textCaptcha?: TextCaptcha
}
```

### SendPhoneCaptchaResponse

发送手机验证码响应：

```typescript
interface SendPhoneCaptchaResponse {
  nextSendTime: number
  expireTime: number
}
```

### PhoneCaptchaLoginRequest

手机验证码登录请求：

```typescript
interface PhoneCaptchaLoginRequest {
  phone: string
  captcha: string
}
```

### AccountPasswordLoginRequest

账号密码登录请求：

```typescript
interface AccountPasswordLoginRequest {
  account: string
  password: string
  textCaptcha?: TextCaptcha
}
```

### LoginResponse

登录响应：

```typescript
interface LoginResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  userInfo?: UserInfo
}
```

### RegisterRequest

注册请求：

```typescript
interface RegisterRequest {
  phone: string
  captcha: string
  password: string
  confirmPassword?: string
  inviteCode?: string
}
```

### ResetPasswordRequest

重置密码请求：

```typescript
interface ResetPasswordRequest {
  phone: string
  captcha: string
  newPassword: string
  confirmPassword?: string
}
```

### UpdatePasswordRequest

修改密码请求：

```typescript
interface UpdatePasswordRequest {
  oldPassword: string
  newPassword: string
  confirmPassword?: string
}
```

## 用户管理

### UserInfo

用户信息：

```typescript
interface UserInfo {
  id: string
  username?: string
  nickname?: string
  phone?: string
  email?: string
  avatar?: string
  roles?: string[]
  permissions?: string[]
}
```

### UpdateUserInfoRequest

更新用户信息请求：

```typescript
interface UpdateUserInfoRequest {
  nickname?: string
  avatar?: string
  email?: string
  [key: string]: any
}
```

## 文件上传

### UploadSignatureRequest

上传签名请求：

```typescript
interface UploadSignatureRequest {
  fileName: string
  fileType?: string
  fileSize?: number
}
```

### UploadSignatureResponse

上传签名响应：

```typescript
interface UploadSignatureResponse {
  uploadUrl: string
  fileUrl: string
  signature?: string
  expireTime?: number
  [key: string]: any
}
```

### UploadProgressCallback

文件上传进度回调：

```typescript
type UploadProgressCallback = (progress: number) => void
```

### UploadOptions

文件上传选项：

```typescript
interface UploadOptions {
  onProgress?: UploadProgressCallback
  headers?: Record<string, string>
  timeout?: number
}
```

## WebSocket 长连接

### WebSocketConfig

WebSocket 配置：

```typescript
interface WebSocketConfig {
  url: string
  heartbeatInterval?: number
  reconnectInterval?: number
  maxReconnectAttempts?: number
}
```

### WebSocketMessage

WebSocket 消息：

```typescript
interface WebSocketMessage<T = any> {
  type: string
  data: T
  timestamp?: number
}
```

### SocketBindCodeResponse

Socket 绑定码响应：

```typescript
interface SocketBindCodeResponse {
  code: string
  expireTime: number
}
```

## 使用示例

### 类型安全的函数

```typescript
import type { LoginResponse, UserInfo } from '@nine-shadow/http-utils'
import { loginByPhoneCaptcha, getUserInfo } from '@nine-shadow/http-utils'

async function handleLogin(phone: string, captcha: string): Promise<UserInfo | null> {
  try {
    const loginResult: LoginResponse = await loginByPhoneCaptcha({
      phone,
      captcha
    })

    const userInfo: UserInfo = await getUserInfo()
    return userInfo
  } catch (error) {
    return null
  }
}
```

### 泛型类型

```typescript
import type { ApiResponse } from '@nine-shadow/http-utils'
import { get } from '@nine-shadow/http-utils'

interface Product {
  id: string
  name: string
  price: number
}

async function getProducts(): Promise<Product[]> {
  const response: ApiResponse<Product[]> = await get('/api/products')
  return response.result
}
```

## 相关链接

- [配置管理](/core/config/)
- [IAM 身份认证](/modules/iam/)
- [文件上传](/modules/upload/)
- [用户管理](/modules/user/)
- [WebSocket](/modules/websocket/)
