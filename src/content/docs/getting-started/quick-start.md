---
title: 快速开始
description: 5 分钟快速上手 @nine-shadow/http-utils
---

本指南将帮助你在 5 分钟内快速上手 `@nine-shadow/http-utils`。

## 安装

### 从私服安装

使用九影科技私服拉取依赖：

```bash
# npm
npm install @nineshadow/http-utils --registry="https://nexus.9shadow.com/repository/npm-public/"

# pnpm
pnpm add @nineshadow/http-utils --registry="https://nexus.9shadow.com/repository/npm-public/"

# yarn
yarn add @nineshadow/http-utils --registry="https://nexus.9shadow.com/repository/npm-public/"
```

:::note[私服账号]

- **账号**: web
- **密码**: 请联系管理员获取
  :::

## 初始化配置

在应用入口文件（如 `main.ts` 或 `main.js`）中设置全局配置：

```typescript
import { setConfig } from '@nine-shadow/http-utils'

setConfig({
  baseURL: 'https://api.example.com', // API 基础 URL
  timeout: 30000, // 超时时间（毫秒）
  language: 'zh-CN', // 多语言编码
  tokenKey: 'access_token', // Token 存储 key
  autoRefreshToken: true, // 自动刷新 token
})
```

## 使用身份认证

### 手机验证码登录

```typescript
import {
  generateTextCaptcha,
  sendPhoneCaptcha,
  loginByPhoneCaptcha,
  getUserInfo,
} from '@nine-shadow/http-utils'

// 1. 生成文字验证码（如果需要）
const captcha = await generateTextCaptcha()
console.log(captcha.img) // base64 图片

// 2. 发送手机验证码
await sendPhoneCaptcha({
  phone: '18639150947',
  textCaptcha: {
    key: captcha.key,
    value: '用户输入的验证码',
  },
})

// 3. 手机验证码登录
const loginResult = await loginByPhoneCaptcha({
  phone: '18639150947',
  captcha: '123456',
})

// 4. 获取用户信息
const userInfo = await getUserInfo()
console.log(userInfo)
```

### 账号密码登录

```typescript
import { loginByPassword } from '@nine-shadow/http-utils'

const result = await loginByPassword({
  account: 'username',
  password: 'password123',
  textCaptcha: {
    // 可选
    key: captcha.key,
    value: '验证码',
  },
})

console.log(result.accessToken)
console.log(result.userInfo)
```

## 文件上传

### 单文件上传

```typescript
import { uploadFile } from '@nine-shadow/http-utils'

const fileUrl = await uploadFile(file, {
  onProgress: (progress) => {
    console.log(`上传进度: ${progress}%`)
  },
})

console.log('文件地址:', fileUrl)
```

### 图片上传（带压缩）

```typescript
import { uploadImage } from '@nine-shadow/http-utils'

const imageUrl = await uploadImage(
  imageFile,
  1920, // 最大宽度
  1080, // 最大高度
  0.8, // 压缩质量 (0-1)
  {
    onProgress: (progress) => {
      console.log(`上传进度: ${progress}%`)
    },
  }
)

console.log('图片地址:', imageUrl)
```

## WebSocket 长连接

```typescript
import { createWebSocketClient } from '@nine-shadow/http-utils'

// 创建 WebSocket 客户端
const ws = createWebSocketClient({
  url: 'wss://api.example.com/ws',
  heartbeatInterval: 30000, // 心跳间隔
  reconnectInterval: 5000, // 重连间隔
  maxReconnectAttempts: 5, // 最大重连次数
})

// 连接
await ws.connect()

// 监听消息
ws.on('chat', (data) => {
  console.log('收到聊天消息:', data)
})

// 发送消息
ws.send('chat', {
  content: 'Hello, World!',
  timestamp: Date.now(),
})

// 断开连接
ws.disconnect()
```

## 下一步

- 查看 [配置管理](/core/config/) 了解更多配置选项
- 查看 [IAM 身份认证](/modules/iam/) 了解完整的认证流程
- 查看 [文件上传](/modules/upload/) 了解更多上传功能
- 查看 [WebSocket](/modules/websocket/) 了解长连接的高级用法
