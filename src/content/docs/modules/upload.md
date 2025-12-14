---
title: 文件上传
description: 文件上传、图片压缩、批量上传功能
---

文件上传模块提供了单文件上传、批量上传、图片压缩等功能，支持上传进度监控。

## API 列表

| 方法 | 说明 | 返回类型 |
|------|------|----------|
| `getUploadSignature(data)` | 获取上传签名 | `Promise<UploadSignatureResponse>` |
| `uploadFile(file, options?)` | 上传单个文件 | `Promise<string>` |
| `uploadFiles(files, options?)` | 批量上传文件 | `Promise<string[]>` |
| `uploadImage(file, maxWidth?, maxHeight?, quality?, options?)` | 上传图片（带压缩） | `Promise<string>` |

## 单文件上传

### 基础用法

```typescript
import { uploadFile } from '@nine-shadow/http-utils'

const file = document.querySelector('input[type="file"]').files[0]
const fileUrl = await uploadFile(file)

console.log('文件地址:', fileUrl)
```

### 带进度监控

```typescript
import { uploadFile } from '@nine-shadow/http-utils'

const fileUrl = await uploadFile(file, {
  onProgress: (progress) => {
    console.log(`上传进度: ${progress}%`)
    // 更新进度条
    document.getElementById('progress').style.width = `${progress}%`
  }
})
```

### 自定义配置

```typescript
const fileUrl = await uploadFile(file, {
  onProgress: (progress) => console.log(progress),
  headers: {
    'X-Custom-Header': 'value'
  },
  timeout: 60000  // 60 秒超时
})
```

## 批量上传

上传多个文件：

```typescript
import { uploadFiles } from '@nine-shadow/http-utils'

const files = document.querySelector('input[type="file"]').files
const fileUrls = await uploadFiles(Array.from(files), {
  onProgress: (progress) => {
    console.log(`总体进度: ${progress}%`)
  }
})

console.log('文件地址列表:', fileUrls)
// ['https://cdn.example.com/file1.jpg', 'https://cdn.example.com/file2.pdf', ...]
```

## 图片上传（带压缩）

上传图片时自动压缩，减小文件体积：

```typescript
import { uploadImage } from '@nine-shadow/http-utils'

const imageFile = document.querySelector('input[type="file"]').files[0]

const imageUrl = await uploadImage(
  imageFile,
  1920,  // 最大宽度
  1080,  // 最大高度
  0.8,   // 压缩质量 (0-1)
  {
    onProgress: (progress) => {
      console.log(`上传进度: ${progress}%`)
    }
  }
)

console.log('图片地址:', imageUrl)
```

### 压缩参数说明

- **maxWidth**: 图片最大宽度，超过会等比缩放
- **maxHeight**: 图片最大高度，超过会等比缩放
- **quality**: 压缩质量，范围 0-1，推荐 0.8
  - 1.0 = 原始质量（无压缩）
  - 0.8 = 高质量（推荐）
  - 0.5 = 中等质量
  - 0.3 = 低质量

### 压缩效果示例

```typescript
// 原图：5MB，3000x2000
const imageUrl = await uploadImage(file, 1920, 1080, 0.8)
// 压缩后：约 500KB，1920x1280（保持宽高比）
```

## 获取上传签名

高级用法，手动获取上传签名：

```typescript
import { getUploadSignature } from '@nine-shadow/http-utils'

const signature = await getUploadSignature({
  fileName: 'example.jpg',
  fileType: 'image/jpeg',
  fileSize: 1024000  // 字节
})

console.log(signature.uploadUrl)  // 上传 URL
console.log(signature.fileUrl)    // 文件访问 URL
console.log(signature.signature)  // 签名
```

## 完整示例

### 单文件上传组件

```typescript
import { uploadFile } from '@nine-shadow/http-utils'
import { ref } from 'vue'

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
    fileUrl.value = await uploadFile(file.value, {
      onProgress: (p) => {
        progress.value = p
      }
    })
    
    alert('上传成功！')
  } catch (error) {
    alert('上传失败：' + error.message)
  } finally {
    uploading.value = false
  }
}
```

### 图片上传预览

```typescript
import { uploadImage } from '@nine-shadow/http-utils'
import { ref } from 'vue'

const imageFile = ref<File | null>(null)
const previewUrl = ref('')
const uploadedUrl = ref('')
const uploading = ref(false)

const handleImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    imageFile.value = file
    // 生成预览
    previewUrl.value = URL.createObjectURL(file)
  }
}

const handleUpload = async () => {
  if (!imageFile.value) return

  uploading.value = true

  try {
    uploadedUrl.value = await uploadImage(
      imageFile.value,
      1920,
      1080,
      0.8,
      {
        onProgress: (progress) => {
          console.log(`上传进度: ${progress}%`)
        }
      }
    )
    
    alert('上传成功！')
  } catch (error) {
    alert('上传失败')
  } finally {
    uploading.value = false
  }
}
```

### 拖拽上传

```typescript
import { uploadFile } from '@nine-shadow/http-utils'

const dropZone = document.getElementById('drop-zone')

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault()
  dropZone.classList.add('drag-over')
})

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over')
})

dropZone.addEventListener('drop', async (e) => {
  e.preventDefault()
  dropZone.classList.remove('drag-over')

  const files = Array.from(e.dataTransfer.files)
  
  for (const file of files) {
    try {
      const url = await uploadFile(file, {
        onProgress: (progress) => {
          console.log(`${file.name}: ${progress}%`)
        }
      })
      console.log(`${file.name} 上传成功:`, url)
    } catch (error) {
      console.error(`${file.name} 上传失败:`, error)
    }
  }
})
```

## 文件类型限制

```typescript
const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
const maxSize = 5 * 1024 * 1024  // 5MB

const handleFileChange = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  
  if (!file) return

  // 检查文件类型
  if (!allowedTypes.includes(file.type)) {
    alert('只支持 JPG、PNG、GIF 格式')
    return
  }

  // 检查文件大小
  if (file.size > maxSize) {
    alert('文件大小不能超过 5MB')
    return
  }

  // 上传文件
  const url = await uploadFile(file)
  console.log('上传成功:', url)
}
```

## 类型定义

### UploadOptions

```typescript
interface UploadOptions {
  onProgress?: (progress: number) => void  // 进度回调
  headers?: Record<string, string>         // 自定义请求头
  timeout?: number                         // 超时时间
}
```

### UploadSignatureResponse

```typescript
interface UploadSignatureResponse {
  uploadUrl: string    // 上传 URL
  fileUrl: string      // 文件访问 URL
  signature?: string   // 签名
  expireTime?: number  // 过期时间
  [key: string]: any   // 其他参数
}
```

## 错误处理

```typescript
import { uploadFile } from '@nine-shadow/http-utils'

try {
  const url = await uploadFile(file, {
    onProgress: (progress) => console.log(progress)
  })
} catch (error) {
  if (error.code === 'ECONNABORTED') {
    alert('上传超时，请重试')
  } else if (error.response?.status === 413) {
    alert('文件太大')
  } else {
    alert('上传失败：' + error.message)
  }
}
```

## 最佳实践

1. **文件大小限制**：在前端检查文件大小，避免上传过大文件
2. **文件类型检查**：限制允许上传的文件类型
3. **进度显示**：使用进度回调显示上传进度
4. **图片压缩**：上传图片时使用 `uploadImage` 进行压缩
5. **错误处理**：提供友好的错误提示

## 相关链接

- [用户管理](/modules/user/) - 头像上传
- [HTTP 请求](/core/http/)
