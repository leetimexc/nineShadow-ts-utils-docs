---
title: WebSocket 长连接
description: WebSocket 客户端、自动重连、心跳检测、消息管理
---

WebSocket 模块提供了长连接支持，内置自动重连、心跳检测、消息管理等功能。

## API 列表

| 方法 | 说明 | 返回类型 |
|------|------|----------|
| `createWebSocketClient(config)` | 创建 WebSocket 客户端 | `WebSocketClient` |
| `getSocketBindCode()` | 获取 Socket 绑定码 | `Promise<SocketBindCodeResponse>` |

## 创建 WebSocket 客户端

```typescript
import { createWebSocketClient } from '@nine-shadow/http-utils'

const ws = createWebSocketClient({
  url: 'wss://api.example.com/ws',
  heartbeatInterval: 30000,      // 心跳间隔（毫秒）
  reconnectInterval: 5000,       // 重连间隔（毫秒）
  maxReconnectAttempts: 5        // 最大重连次数
})
```

## WebSocketClient 方法

| 方法 | 说明 | 参数 |
|------|------|------|
| `connect()` | 连接 WebSocket | - |
| `disconnect()` | 断开连接 | - |
| `send(type, data)` | 发送消息 | type: string, data: any |
| `on(type, handler)` | 监听消息 | type: string, handler: Function |
| `off(type, handler?)` | 取消监听 | type: string, handler?: Function |
| `isConnected()` | 是否已连接 | - |

## 基础用法

### 连接和断开

```typescript
import { createWebSocketClient } from '@nine-shadow/http-utils'

const ws = createWebSocketClient({
  url: 'wss://api.example.com/ws'
})

// 连接
await ws.connect()

// 检查连接状态
if (ws.isConnected()) {
  console.log('已连接')
}

// 断开连接
ws.disconnect()
```

### 监听系统事件

```typescript
// 监听连接成功
ws.on('open', () => {
  console.log('WebSocket 已连接')
})

// 监听连接关闭
ws.on('close', () => {
  console.log('WebSocket 已断开')
})

// 监听连接错误
ws.on('error', (error) => {
  console.error('WebSocket 错误:', error)
})

// 监听重连
ws.on('reconnect', (attempt) => {
  console.log(`正在重连，第 ${attempt} 次尝试`)
})
```

### 发送和接收消息

```typescript
// 监听消息
ws.on('chat', (data) => {
  console.log('收到聊天消息:', data)
})

ws.on('notification', (data) => {
  console.log('收到通知:', data)
})

// 发送消息
ws.send('chat', {
  content: 'Hello, World!',
  timestamp: Date.now()
})

ws.send('notification', {
  type: 'info',
  message: '这是一条通知'
})
```

### 取消监听

```typescript
// 定义处理函数
const chatHandler = (data) => {
  console.log('收到消息:', data)
}

// 监听
ws.on('chat', chatHandler)

// 取消监听特定处理函数
ws.off('chat', chatHandler)

// 取消监听所有 chat 事件
ws.off('chat')
```

## 完整示例

### 聊天应用

```typescript
import { createWebSocketClient } from '@nine-shadow/http-utils'
import { ref, onMounted, onUnmounted } from 'vue'

const ws = createWebSocketClient({
  url: 'wss://api.example.com/ws',
  heartbeatInterval: 30000,
  reconnectInterval: 5000,
  maxReconnectAttempts: 5
})

const messages = ref([])
const connected = ref(false)
const inputMessage = ref('')

onMounted(async () => {
  // 连接 WebSocket
  await ws.connect()

  // 监听连接状态
  ws.on('open', () => {
    connected.value = true
    console.log('已连接到聊天服务器')
  })

  ws.on('close', () => {
    connected.value = false
    console.log('已断开连接')
  })

  // 监听聊天消息
  ws.on('chat', (data) => {
    messages.value.push({
      id: data.id,
      user: data.user,
      content: data.content,
      timestamp: data.timestamp
    })
  })

  // 监听系统通知
  ws.on('system', (data) => {
    messages.value.push({
      type: 'system',
      content: data.message,
      timestamp: Date.now()
    })
  })
})

onUnmounted(() => {
  // 组件卸载时断开连接
  ws.disconnect()
})

// 发送消息
const sendMessage = () => {
  if (!inputMessage.value.trim()) return

  ws.send('chat', {
    content: inputMessage.value,
    timestamp: Date.now()
  })

  inputMessage.value = ''
}
```

### 实时通知

```typescript
import { createWebSocketClient } from '@nine-shadow/http-utils'

const ws = createWebSocketClient({
  url: 'wss://api.example.com/ws'
})

await ws.connect()

// 监听不同类型的通知
ws.on('notification', (data) => {
  switch (data.type) {
    case 'info':
      showInfoNotification(data.message)
      break
    case 'warning':
      showWarningNotification(data.message)
      break
    case 'error':
      showErrorNotification(data.message)
      break
    case 'success':
      showSuccessNotification(data.message)
      break
  }
})

// 监听订单状态更新
ws.on('order-update', (data) => {
  console.log('订单状态更新:', data)
  updateOrderStatus(data.orderId, data.status)
})

// 监听用户上线/下线
ws.on('user-status', (data) => {
  if (data.status === 'online') {
    console.log(`${data.username} 上线了`)
  } else {
    console.log(`${data.username} 下线了`)
  }
})
```

## 获取绑定码

某些场景需要先获取绑定码再连接 WebSocket：

```typescript
import { getSocketBindCode, createWebSocketClient } from '@nine-shadow/http-utils'

// 1. 获取绑定码
const bindCodeResult = await getSocketBindCode()
console.log('绑定码:', bindCodeResult.code)
console.log('过期时间:', bindCodeResult.expireTime)

// 2. 使用绑定码连接
const ws = createWebSocketClient({
  url: `wss://api.example.com/ws?code=${bindCodeResult.code}`
})

await ws.connect()
```

## 配置选项

### WebSocketConfig

```typescript
interface WebSocketConfig {
  url: string                    // WebSocket URL（必填）
  heartbeatInterval?: number     // 心跳间隔（毫秒），默认 30000
  reconnectInterval?: number     // 重连间隔（毫秒），默认 5000
  maxReconnectAttempts?: number  // 最大重连次数，默认 5
}
```

### 自定义配置示例

```typescript
const ws = createWebSocketClient({
  url: 'wss://api.example.com/ws',
  heartbeatInterval: 60000,      // 60 秒发送一次心跳
  reconnectInterval: 3000,       // 3 秒后重连
  maxReconnectAttempts: 10       // 最多重连 10 次
})
```

## 消息格式

### WebSocketMessage

```typescript
interface WebSocketMessage<T = any> {
  type: string      // 消息类型
  data: T           // 消息数据
  timestamp?: number // 时间戳
}
```

### 发送消息示例

```typescript
// 发送聊天消息
ws.send('chat', {
  roomId: '123',
  content: 'Hello',
  user: {
    id: '456',
    name: 'John'
  }
})

// 发送心跳
ws.send('ping', {
  timestamp: Date.now()
})
```

## 自动重连机制

WebSocket 客户端内置了自动重连机制：

1. **连接断开时自动重连**
2. **重连间隔由 `reconnectInterval` 控制**
3. **最大重连次数由 `maxReconnectAttempts` 控制**
4. **超过最大重连次数后停止重连**

```typescript
const ws = createWebSocketClient({
  url: 'wss://api.example.com/ws',
  reconnectInterval: 5000,       // 5 秒后重连
  maxReconnectAttempts: 5        // 最多重连 5 次
})

// 监听重连事件
ws.on('reconnect', (attempt) => {
  console.log(`正在重连，第 ${attempt} 次尝试`)
})

// 监听重连失败
ws.on('reconnect-failed', () => {
  console.log('重连失败，已达到最大重连次数')
  alert('连接已断开，请刷新页面')
})
```

## 心跳检测机制

WebSocket 客户端内置了心跳检测机制：

1. **定期发送心跳包保持连接**
2. **心跳间隔由 `heartbeatInterval` 控制**
3. **如果服务器无响应会触发重连**

```typescript
const ws = createWebSocketClient({
  url: 'wss://api.example.com/ws',
  heartbeatInterval: 30000  // 每 30 秒发送一次心跳
})

// 心跳消息会自动发送，无需手动处理
```

## 错误处理

```typescript
import { createWebSocketClient } from '@nine-shadow/http-utils'

const ws = createWebSocketClient({
  url: 'wss://api.example.com/ws'
})

try {
  await ws.connect()
} catch (error) {
  console.error('连接失败:', error)
  alert('无法连接到服务器，请检查网络')
}

// 监听错误
ws.on('error', (error) => {
  console.error('WebSocket 错误:', error)
})
```

## 最佳实践

1. **组件卸载时断开连接**：避免内存泄漏
2. **监听连接状态**：根据连接状态显示 UI
3. **错误处理**：提供友好的错误提示
4. **消息类型**：使用明确的消息类型区分不同业务
5. **心跳配置**：根据实际需求调整心跳间隔

## 相关链接

- [配置管理](/core/config/)
- [IAM 身份认证](/modules/iam/)
