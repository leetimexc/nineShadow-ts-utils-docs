---
title: React 集成
description: 在 React 项目中使用 @nine-shadow/http-utils
---

本指南介绍如何在 React 项目中使用 `@nine-shadow/http-utils`。

## 安装和配置

在 `main.tsx` 或 `index.tsx` 中初始化配置：

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { setConfig } from '@nine-shadow/http-utils'
import App from './App'

// 配置 HTTP 工具
setConfig({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  language: 'zh-CN',
  errorHandler: (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login'
    }
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

## 登录组件示例

```typescript
import { useState } from 'react'
import { 
  generateTextCaptcha,
  sendPhoneCaptcha,
  loginByPhoneCaptcha,
  getUserInfo
} from '@nine-shadow/http-utils'
import type { UserInfo } from '@nine-shadow/http-utils'

function LoginForm() {
  const [phone, setPhone] = useState('')
  const [captcha, setCaptcha] = useState('')
  const [textCaptchaKey, setTextCaptchaKey] = useState('')
  const [textCaptchaImg, setTextCaptchaImg] = useState('')
  const [userInputCaptcha, setUserInputCaptcha] = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // 生成图形验证码
  const generateCaptcha = async () => {
    const result = await generateTextCaptcha()
    setTextCaptchaKey(result.key)
    setTextCaptchaImg(result.img)
  }

  // 发送手机验证码
  const sendCaptcha = async () => {
    if (!phone) {
      alert('请输入手机号')
      return
    }

    try {
      await sendPhoneCaptcha({
        phone,
        textCaptcha: {
          key: textCaptchaKey,
          value: userInputCaptcha
        }
      })

      // 开始倒计时
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      alert('验证码已发送')
    } catch (error) {
      alert('发送失败，请重试')
    }
  }

  // 登录
  const handleLogin = async () => {
    if (!phone || !captcha) {
      alert('请填写完整信息')
      return
    }

    setLoading(true)

    try {
      const result = await loginByPhoneCaptcha({
        phone,
        captcha
      })

      console.log('登录成功:', result)

      // 获取用户信息
      const userInfo = await getUserInfo()
      console.log('用户信息:', userInfo)

      // 跳转到首页
      window.location.href = '/'
    } catch (error) {
      alert('登录失败')
    } finally {
      setLoading(false)
    }
  }

  // 组件挂载时生成验证码
  useEffect(() => {
    generateCaptcha()
  }, [])

  return (
    <div className="login-form">
      <h2>手机验证码登录</h2>
      
      <div className="form-item">
        <input 
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="请输入手机号"
        />
      </div>

      <div className="form-item">
        <img src={textCaptchaImg} onClick={generateCaptcha} alt="验证码" />
        <input 
          value={userInputCaptcha}
          onChange={(e) => setUserInputCaptcha(e.target.value)}
          placeholder="请输入图形验证码"
        />
      </div>

      <div className="form-item">
        <input 
          value={captcha}
          onChange={(e) => setCaptcha(e.target.value)}
          placeholder="请输入手机验证码"
        />
        <button onClick={sendCaptcha} disabled={countdown > 0}>
          {countdown > 0 ? `${countdown}秒后重试` : '发送验证码'}
        </button>
      </div>

      <button onClick={handleLogin} disabled={loading}>
        {loading ? '登录中...' : '登录'}
      </button>
    </div>
  )
}

export default LoginForm
```

## 文件上传组件

```typescript
import { useState } from 'react'
import { uploadFile, uploadImage } from '@nine-shadow/http-utils'

function UploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [fileUrl, setFileUrl] = useState('')

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] || null)
  }

  const handleUpload = async () => {
    if (!file) {
      alert('请选择文件')
      return
    }

    setUploading(true)
    setProgress(0)

    try {
      // 如果是图片，使用 uploadImage 进行压缩
      let url: string
      if (file.type.startsWith('image/')) {
        url = await uploadImage(
          file,
          1920,
          1080,
          0.8,
          {
            onProgress: (p) => setProgress(p)
          }
        )
      } else {
        url = await uploadFile(file, {
          onProgress: (p) => setProgress(p)
        })
      }

      setFileUrl(url)
      alert('上传成功！')
    } catch (error) {
      alert('上传失败')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="upload-form">
      <input type="file" onChange={handleFileChange} />
      
      {uploading && (
        <div className="progress">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          <span>{progress}%</span>
        </div>
      )}

      <button onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? '上传中...' : '上传'}
      </button>

      {fileUrl && (
        <div>
          <p>文件地址：{fileUrl}</p>
          {file?.type.startsWith('image/') && <img src={fileUrl} alt="上传的图片" />}
        </div>
      )}
    </div>
  )
}

export default UploadForm
```

## WebSocket 聊天组件

```typescript
import { useState, useEffect } from 'react'
import { createWebSocketClient } from '@nine-shadow/http-utils'

const ws = createWebSocketClient({
  url: 'wss://api.example.com/ws',
  heartbeatInterval: 30000,
  reconnectInterval: 5000
})

function ChatRoom() {
  const [messages, setMessages] = useState<any[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const connectWebSocket = async () => {
      await ws.connect()

      ws.on('open', () => {
        setConnected(true)
      })

      ws.on('close', () => {
        setConnected(false)
      })

      ws.on('chat', (data) => {
        setMessages(prev => [...prev, data])
      })
    }

    connectWebSocket()

    return () => {
      ws.disconnect()
    }
  }, [])

  const sendMessage = () => {
    if (!inputMessage.trim()) return

    ws.send('chat', {
      content: inputMessage,
      timestamp: Date.now()
    })

    setInputMessage('')
  }

  return (
    <div className="chat">
      <div className="status">
        {connected ? '已连接' : '未连接'}
      </div>

      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <span>{msg.user}:</span>
            <span>{msg.content}</span>
          </div>
        ))}
      </div>

      <div className="input">
        <input 
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage}>发送</button>
      </div>
    </div>
  )
}

export default ChatRoom
```

## 自定义 Hooks

创建可复用的 Hooks：

### useAuth.ts

```typescript
import { useState, useCallback } from 'react'
import { 
  loginByPhoneCaptcha,
  loginByPassword,
  logout,
  getUserInfo
} from '@nine-shadow/http-utils'
import type { UserInfo } from '@nine-shadow/http-utils'

export function useAuth() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (phone: string, captcha: string) => {
    setLoading(true)
    try {
      await loginByPhoneCaptcha({ phone, captcha })
      const userInfo = await getUserInfo()
      setUser(userInfo)
      return true
    } catch (error) {
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const logoutUser = useCallback(async () => {
    await logout()
    setUser(null)
  }, [])

  const fetchUserInfo = useCallback(async () => {
    try {
      const userInfo = await getUserInfo()
      setUser(userInfo)
    } catch (error) {
      setUser(null)
    }
  }, [])

  return {
    user,
    loading,
    login,
    logout: logoutUser,
    fetchUserInfo
  }
}
```

### useUpload.ts

```typescript
import { useState, useCallback } from 'react'
import { uploadFile, uploadImage } from '@nine-shadow/http-utils'

export function useUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const upload = useCallback(async (file: File, compress = false) => {
    setUploading(true)
    setProgress(0)

    try {
      const url = compress
        ? await uploadImage(file, 1920, 1080, 0.8, {
            onProgress: (p) => setProgress(p)
          })
        : await uploadFile(file, {
            onProgress: (p) => setProgress(p)
          })

      return url
    } finally {
      setUploading(false)
    }
  }, [])

  return {
    uploading,
    progress,
    upload
  }
}
```

### 使用自定义 Hooks

```typescript
import { useAuth } from './hooks/useAuth'
import { useUpload } from './hooks/useUpload'

function App() {
  const { user, login, logout } = useAuth()
  const { upload, uploading, progress } = useUpload()

  const handleLogin = async () => {
    const success = await login('18639150947', '123456')
    if (success) {
      console.log('登录成功:', user)
    }
  }

  const handleUpload = async (file: File) => {
    const url = await upload(file, true)
    console.log('上传成功:', url)
  }

  return (
    <div>
      {user ? (
        <div>
          <p>欢迎，{user.nickname}</p>
          <button onClick={logout}>退出登录</button>
        </div>
      ) : (
        <button onClick={handleLogin}>登录</button>
      )}
    </div>
  )
}
```

## React Query 集成

与 React Query 结合使用：

```typescript
import { useQuery, useMutation } from '@tanstack/react-query'
import { getUserInfo, updateUserInfo } from '@nine-shadow/http-utils'
import type { UserInfo, UpdateUserInfoRequest } from '@nine-shadow/http-utils'

// 获取用户信息
function useUserInfo() {
  return useQuery({
    queryKey: ['userInfo'],
    queryFn: getUserInfo
  })
}

// 更新用户信息
function useUpdateUserInfo() {
  return useMutation({
    mutationFn: (data: UpdateUserInfoRequest) => updateUserInfo(data),
    onSuccess: () => {
      // 更新成功后重新获取用户信息
      queryClient.invalidateQueries({ queryKey: ['userInfo'] })
    }
  })
}

// 使用示例
function UserProfile() {
  const { data: user, isLoading } = useUserInfo()
  const updateMutation = useUpdateUserInfo()

  const handleUpdate = () => {
    updateMutation.mutate({
      nickname: '新昵称'
    })
  }

  if (isLoading) return <div>加载中...</div>

  return (
    <div>
      <p>昵称：{user?.nickname}</p>
      <button onClick={handleUpdate}>更新</button>
    </div>
  )
}
```

## 相关链接

- [Vue 集成](/integration/vue/)
- [快速开始](/getting-started/quick-start/)
