---
title: Vue 集成
description: 在 Vue 项目中使用 @nine-shadow/http-utils
---

本指南介绍如何在 Vue 2 和 Vue 3 项目中使用 `@nine-shadow/http-utils`。

## Vue 3 + Composition API

### 安装和配置

在 `main.ts` 中初始化配置：

```typescript
import { createApp } from 'vue'
import { setConfig } from '@nine-shadow/http-utils'
import App from './App.vue'

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

createApp(App).mount('#app')
```

### 登录组件示例

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { 
  generateTextCaptcha, 
  sendPhoneCaptcha,
  loginByPhoneCaptcha,
  getUserInfo
} from '@nine-shadow/http-utils'
import type { UserInfo } from '@nine-shadow/http-utils'

const phone = ref('')
const captcha = ref('')
const textCaptchaKey = ref('')
const textCaptchaImg = ref('')
const userInputCaptcha = ref('')
const loading = ref(false)
const countdown = ref(0)

// 生成图形验证码
const generateCaptcha = async () => {
  const result = await generateTextCaptcha()
  textCaptchaKey.value = result.key
  textCaptchaImg.value = result.img
}

// 发送手机验证码
const sendCaptcha = async () => {
  if (!phone.value) {
    alert('请输入手机号')
    return
  }

  try {
    await sendPhoneCaptcha({
      phone: phone.value,
      textCaptcha: {
        key: textCaptchaKey.value,
        value: userInputCaptcha.value
      }
    })

    // 开始倒计时
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)

    alert('验证码已发送')
  } catch (error) {
    alert('发送失败，请重试')
  }
}

// 登录
const handleLogin = async () => {
  if (!phone.value || !captcha.value) {
    alert('请填写完整信息')
    return
  }

  loading.value = true

  try {
    const result = await loginByPhoneCaptcha({
      phone: phone.value,
      captcha: captcha.value
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
    loading.value = false
  }
}

// 组件挂载时生成验证码
generateCaptcha()
</script>

<template>
  <div class="login-form">
    <h2>手机验证码登录</h2>
    
    <div class="form-item">
      <input v-model="phone" placeholder="请输入手机号" />
    </div>

    <div class="form-item">
      <img :src="textCaptchaImg" @click="generateCaptcha" />
      <input v-model="userInputCaptcha" placeholder="请输入图形验证码" />
    </div>

    <div class="form-item">
      <input v-model="captcha" placeholder="请输入手机验证码" />
      <button @click="sendCaptcha" :disabled="countdown > 0">
        {{ countdown > 0 ? `${countdown}秒后重试` : '发送验证码' }}
      </button>
    </div>

    <button @click="handleLogin" :disabled="loading">
      {{ loading ? '登录中...' : '登录' }}
    </button>
  </div>
</template>
```

### 文件上传组件

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { uploadFile, uploadImage } from '@nine-shadow/http-utils'

const file = ref<File | null>(null)
const uploading = ref(false)
const progress = ref(0)
const fileUrl = ref('')

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  file.value = target.files?.[0] || null
}

const handleUpload = async () => {
  if (!file.value) {
    alert('请选择文件')
    return
  }

  uploading.value = true
  progress.value = 0

  try {
    // 如果是图片，使用 uploadImage 进行压缩
    if (file.value.type.startsWith('image/')) {
      fileUrl.value = await uploadImage(
        file.value,
        1920,
        1080,
        0.8,
        {
          onProgress: (p) => {
            progress.value = p
          }
        }
      )
    } else {
      fileUrl.value = await uploadFile(file.value, {
        onProgress: (p) => {
          progress.value = p
        }
      })
    }

    alert('上传成功！')
  } catch (error) {
    alert('上传失败')
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <div class="upload-form">
    <input type="file" @change="handleFileChange" />
    
    <div v-if="uploading" class="progress">
      <div class="progress-bar" :style="{ width: progress + '%' }"></div>
      <span>{{ progress }}%</span>
    </div>

    <button @click="handleUpload" :disabled="!file || uploading">
      {{ uploading ? '上传中...' : '上传' }}
    </button>

    <div v-if="fileUrl">
      <p>文件地址：{{ fileUrl }}</p>
      <img v-if="file?.type.startsWith('image/')" :src="fileUrl" />
    </div>
  </div>
</template>
```

### WebSocket 聊天组件

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { createWebSocketClient } from '@nine-shadow/http-utils'

const ws = createWebSocketClient({
  url: 'wss://api.example.com/ws',
  heartbeatInterval: 30000,
  reconnectInterval: 5000
})

const messages = ref<any[]>([])
const inputMessage = ref('')
const connected = ref(false)

onMounted(async () => {
  await ws.connect()

  ws.on('open', () => {
    connected.value = true
  })

  ws.on('close', () => {
    connected.value = false
  })

  ws.on('chat', (data) => {
    messages.value.push(data)
  })
})

onUnmounted(() => {
  ws.disconnect()
})

const sendMessage = () => {
  if (!inputMessage.value.trim()) return

  ws.send('chat', {
    content: inputMessage.value,
    timestamp: Date.now()
  })

  inputMessage.value = ''
}
</script>

<template>
  <div class="chat">
    <div class="status">
      {{ connected ? '已连接' : '未连接' }}
    </div>

    <div class="messages">
      <div v-for="msg in messages" :key="msg.id" class="message">
        <span>{{ msg.user }}:</span>
        <span>{{ msg.content }}</span>
      </div>
    </div>

    <div class="input">
      <input v-model="inputMessage" @keyup.enter="sendMessage" />
      <button @click="sendMessage">发送</button>
    </div>
  </div>
</template>
```

## Vue 2 + Options API

### 登录组件示例

```vue
<template>
  <div class="login-form">
    <input v-model="phone" placeholder="手机号" />
    <input v-model="captcha" placeholder="验证码" />
    <button @click="handleLogin" :disabled="loading">登录</button>
  </div>
</template>

<script>
import { loginByPhoneCaptcha, getUserInfo } from '@nine-shadow/http-utils'

export default {
  data() {
    return {
      phone: '',
      captcha: '',
      loading: false
    }
  },
  methods: {
    async handleLogin() {
      this.loading = true

      try {
        await loginByPhoneCaptcha({
          phone: this.phone,
          captcha: this.captcha
        })

        const userInfo = await getUserInfo()
        console.log('用户信息:', userInfo)

        this.$router.push('/')
      } catch (error) {
        alert('登录失败')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
```

## Composables 封装

创建可复用的 Composables：

### useAuth.ts

```typescript
import { ref } from 'vue'
import { 
  loginByPhoneCaptcha,
  loginByPassword,
  logout,
  getUserInfo
} from '@nine-shadow/http-utils'
import type { UserInfo } from '@nine-shadow/http-utils'

export function useAuth() {
  const user = ref<UserInfo | null>(null)
  const loading = ref(false)

  const login = async (phone: string, captcha: string) => {
    loading.value = true
    try {
      await loginByPhoneCaptcha({ phone, captcha })
      user.value = await getUserInfo()
      return true
    } catch (error) {
      return false
    } finally {
      loading.value = false
    }
  }

  const logoutUser = async () => {
    await logout()
    user.value = null
  }

  const fetchUserInfo = async () => {
    try {
      user.value = await getUserInfo()
    } catch (error) {
      user.value = null
    }
  }

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
import { ref } from 'vue'
import { uploadFile, uploadImage } from '@nine-shadow/http-utils'

export function useUpload() {
  const uploading = ref(false)
  const progress = ref(0)

  const upload = async (file: File, compress = false) => {
    uploading.value = true
    progress.value = 0

    try {
      const url = compress
        ? await uploadImage(file, 1920, 1080, 0.8, {
            onProgress: (p) => { progress.value = p }
          })
        : await uploadFile(file, {
            onProgress: (p) => { progress.value = p }
          })

      return url
    } finally {
      uploading.value = false
    }
  }

  return {
    uploading,
    progress,
    upload
  }
}
```

### 使用 Composables

```vue
<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
import { useUpload } from '@/composables/useUpload'

const { user, login, logout } = useAuth()
const { upload, uploading, progress } = useUpload()

const handleLogin = async () => {
  const success = await login('18639150947', '123456')
  if (success) {
    console.log('登录成功:', user.value)
  }
}

const handleUpload = async (file: File) => {
  const url = await upload(file, true)
  console.log('上传成功:', url)
}
</script>
```

## 相关链接

- [React 集成](/integration/react/)
- [快速开始](/getting-started/quick-start/)
