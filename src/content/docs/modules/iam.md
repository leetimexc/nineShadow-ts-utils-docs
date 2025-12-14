---
title: IAM 身份认证
description: 完整的身份认证和授权功能
---

IAM（Identity and Access Management）模块提供了完整的身份认证功能，包括验证码、登录、注册、密码管理等。

## API 列表

| 方法 | 说明 | 返回类型 |
|------|------|----------|
| `generateTextCaptcha()` | 生成文字验证码 | `Promise<TextCaptchaResponse>` |
| `sendPhoneCaptcha(data)` | 发送手机验证码 | `Promise<SendPhoneCaptchaResponse>` |
| `loginByPhoneCaptcha(data)` | 手机验证码登录 | `Promise<LoginResponse>` |
| `loginByPassword(data)` | 账号密码登录 | `Promise<LoginResponse>` |
| `registerByPhone(data)` | 手机号注册 | `Promise<LoginResponse>` |
| `resetPassword(data)` | 重置密码 | `Promise<void>` |
| `refreshToken(token?)` | 刷新 Token | `Promise<LoginResponse>` |
| `logout()` | 登出 | `Promise<void>` |
| `checkToken()` | 检查 Token 是否有效 | `Promise<boolean>` |

## 验证码功能

### 生成文字验证码

生成图形验证码，用于防止机器人攻击：

```typescript
import { generateTextCaptcha } from '@nine-shadow/http-utils'

const captcha = await generateTextCaptcha()

console.log(captcha.key)  // 验证码 key
console.log(captcha.img)  // base64 图片数据

// 在页面中显示
document.getElementById('captcha-img').src = captcha.img
```

### 发送手机验证码

发送短信验证码到指定手机号：

```typescript
import { sendPhoneCaptcha } from '@nine-shadow/http-utils'

// 不需要图形验证码
const result = await sendPhoneCaptcha({
  phone: '18639150947'
})

// 需要图形验证码
const result = await sendPhoneCaptcha({
  phone: '18639150947',
  textCaptcha: {
    key: captcha.key,
    value: '用户输入的验证码'
  }
})

console.log(result.nextSendTime)  // 下次可发送时间（时间戳）
console.log(result.expireTime)    // 验证码过期时间间隔（毫秒）
```

## 登录功能

### 手机验证码登录

使用手机号和验证码登录：

```typescript
import { loginByPhoneCaptcha } from '@nine-shadow/http-utils'

const result = await loginByPhoneCaptcha({
  phone: '18639150947',
  captcha: '123456'
})

console.log(result.accessToken)   // 访问令牌
console.log(result.refreshToken)  // 刷新令牌
console.log(result.tokenType)     // 令牌类型（通常是 'Bearer'）
console.log(result.expiresIn)     // 过期时间（秒）
console.log(result.userInfo)      // 用户信息
```

### 账号密码登录

使用账号（手机号或用户名）和密码登录：

```typescript
import { loginByPassword } from '@nine-shadow/http-utils'

// 基础登录
const result = await loginByPassword({
  account: 'username',
  password: 'password123'
})

// 带图形验证码
const result = await loginByPassword({
  account: 'username',
  password: 'password123',
  textCaptcha: {
    key: captcha.key,
    value: '验证码'
  }
})
```

## 注册功能

### 手机号注册

使用手机号和验证码注册新用户：

```typescript
import { registerByPhone } from '@nine-shadow/http-utils'

const result = await registerByPhone({
  phone: '18639150947',
  captcha: '123456',
  password: 'password123',
  confirmPassword: 'password123',
  inviteCode: 'ABC123'  // 可选：邀请码
})

console.log(result.accessToken)
console.log(result.userInfo)
```

## 密码管理

### 重置密码

通过手机验证码重置密码：

```typescript
import { resetPassword } from '@nine-shadow/http-utils'

await resetPassword({
  phone: '18639150947',
  captcha: '123456',
  newPassword: 'newPassword123',
  confirmPassword: 'newPassword123'
})
```

### 修改密码

已登录用户修改密码（在用户管理模块）：

```typescript
import { updatePassword } from '@nine-shadow/http-utils'

await updatePassword({
  oldPassword: 'oldPassword123',
  newPassword: 'newPassword123',
  confirmPassword: 'newPassword123'
})
```

## Token 管理

### 刷新 Token

在 Token 即将过期时刷新：

```typescript
import { refreshToken, setToken } from '@nine-shadow/http-utils'

// 使用当前 Token 刷新
const result = await refreshToken()
setToken(result.accessToken)

// 使用指定 Token 刷新
const result = await refreshToken('specific-refresh-token')
```

### 检查 Token 有效性

检查当前 Token 是否有效：

```typescript
import { checkToken } from '@nine-shadow/http-utils'

const isValid = await checkToken()

if (isValid) {
  console.log('Token 有效')
} else {
  console.log('Token 无效或已过期')
  // 跳转到登录页
  window.location.href = '/login'
}
```

### 登出

退出登录并清除认证信息：

```typescript
import { logout } from '@nine-shadow/http-utils'

await logout()

// Token 会自动清除
// 跳转到登录页
window.location.href = '/login'
```

## 完整登录流程示例

### 手机验证码登录流程

```typescript
import {
  generateTextCaptcha,
  sendPhoneCaptcha,
  loginByPhoneCaptcha,
  getUserInfo
} from '@nine-shadow/http-utils'

// 1. 生成图形验证码（如果需要）
const textCaptcha = await generateTextCaptcha()
document.getElementById('captcha-img').src = textCaptcha.img

// 2. 用户输入图形验证码后，发送手机验证码
const userInputCaptcha = '用户输入的图形验证码'
const phoneCaptchaResult = await sendPhoneCaptcha({
  phone: '18639150947',
  textCaptcha: {
    key: textCaptcha.key,
    value: userInputCaptcha
  }
})

// 3. 显示倒计时
let countdown = 60
const timer = setInterval(() => {
  countdown--
  if (countdown <= 0) {
    clearInterval(timer)
  }
  document.getElementById('countdown').textContent = countdown
}, 1000)

// 4. 用户输入手机验证码后登录
const userInputPhoneCaptcha = '123456'
const loginResult = await loginByPhoneCaptcha({
  phone: '18639150947',
  captcha: userInputPhoneCaptcha
})

// 5. 登录成功，获取用户信息
const userInfo = await getUserInfo()
console.log('登录成功:', userInfo)

// 6. 跳转到首页
window.location.href = '/'
```

### 账号密码登录流程

```typescript
import {
  generateTextCaptcha,
  loginByPassword,
  getUserInfo
} from '@nine-shadow/http-utils'

// 1. 生成图形验证码（如果需要）
const textCaptcha = await generateTextCaptcha()
document.getElementById('captcha-img').src = textCaptcha.img

// 2. 用户输入账号、密码和验证码后登录
const loginResult = await loginByPassword({
  account: 'username',
  password: 'password123',
  textCaptcha: {
    key: textCaptcha.key,
    value: '用户输入的验证码'
  }
})

// 3. 登录成功，获取用户信息
const userInfo = await getUserInfo()
console.log('登录成功:', userInfo)

// 4. 跳转到首页
window.location.href = '/'
```

## 类型定义

### TextCaptchaResponse

```typescript
interface TextCaptchaResponse {
  key: string   // 验证码 key
  img: string   // base64 图片
}
```

### SendPhoneCaptchaResponse

```typescript
interface SendPhoneCaptchaResponse {
  nextSendTime: number  // 下次可发送时间（时间戳，毫秒）
  expireTime: number    // 验证码过期时间间隔（毫秒）
}
```

### LoginResponse

```typescript
interface LoginResponse {
  accessToken: string    // 访问令牌
  refreshToken: string   // 刷新令牌
  tokenType: string      // 令牌类型
  expiresIn: number      // 过期时间（秒）
  userInfo?: UserInfo    // 用户信息
}
```

### UserInfo

```typescript
interface UserInfo {
  id: string              // 用户 ID
  username?: string       // 用户名
  nickname?: string       // 昵称
  phone?: string          // 手机号
  email?: string          // 邮箱
  avatar?: string         // 头像
  roles?: string[]        // 角色列表
  permissions?: string[]  // 权限列表
}
```

## 错误处理

```typescript
import { loginByPhoneCaptcha } from '@nine-shadow/http-utils'

try {
  const result = await loginByPhoneCaptcha({
    phone: '18639150947',
    captcha: '123456'
  })
} catch (error) {
  if (error.response?.status === 400) {
    alert('验证码错误或已过期')
  } else if (error.response?.status === 404) {
    alert('用户不存在')
  } else {
    alert('登录失败，请稍后重试')
  }
}
```

## 最佳实践

1. **验证码倒计时**：发送验证码后显示倒计时，防止频繁发送
2. **密码强度检查**：注册和修改密码时检查密码强度
3. **Token 自动刷新**：配置自动刷新机制，提升用户体验
4. **错误提示**：提供友好的错误提示信息
5. **安全存储**：Token 存储在 localStorage，避免 XSS 攻击

## 相关链接

- [用户管理](/modules/user/)
- [配置管理](/core/config/)
