---
title: 用户管理
description: 用户信息管理、头像上传、账号绑定功能
---

用户管理模块提供了用户信息的获取、更新、头像上传、手机邮箱绑定等功能。

## API 列表

| 方法 | 说明 | 返回类型 |
|------|------|----------|
| `getUserInfo()` | 获取当前用户信息 | `Promise<UserInfo>` |
| `updateUserInfo(data)` | 更新用户信息 | `Promise<UserInfo>` |
| `updatePassword(data)` | 修改密码 | `Promise<void>` |
| `uploadAvatar(file)` | 上传头像 | `Promise<string>` |
| `bindPhone(phone, captcha)` | 绑定手机号 | `Promise<void>` |
| `bindEmail(email, captcha)` | 绑定邮箱 | `Promise<void>` |

## 获取用户信息

```typescript
import { getUserInfo } from '@nine-shadow/http-utils'

const userInfo = await getUserInfo()

console.log(userInfo.id)          // 用户 ID
console.log(userInfo.username)    // 用户名
console.log(userInfo.nickname)    // 昵称
console.log(userInfo.phone)       // 手机号
console.log(userInfo.email)       // 邮箱
console.log(userInfo.avatar)      // 头像 URL
console.log(userInfo.roles)       // 角色列表
console.log(userInfo.permissions) // 权限列表
```

## 更新用户信息

```typescript
import { updateUserInfo } from '@nine-shadow/http-utils'

const updatedUser = await updateUserInfo({
  nickname: '新昵称',
  email: 'new@example.com'
})

console.log('更新成功:', updatedUser)
```

## 修改密码

```typescript
import { updatePassword } from '@nine-shadow/http-utils'

await updatePassword({
  oldPassword: 'oldPassword123',
  newPassword: 'newPassword123',
  confirmPassword: 'newPassword123'
})

alert('密码修改成功，请重新登录')
```

## 上传头像

```typescript
import { uploadAvatar } from '@nine-shadow/http-utils'

const avatarFile = document.querySelector('input[type="file"]').files[0]
const avatarUrl = await uploadAvatar(avatarFile)

console.log('头像地址:', avatarUrl)
```

## 绑定手机号

```typescript
import { sendPhoneCaptcha, bindPhone } from '@nine-shadow/http-utils'

// 1. 发送验证码
await sendPhoneCaptcha({
  phone: '18639150947'
})

// 2. 绑定手机号
await bindPhone('18639150947', '123456')

alert('手机号绑定成功')
```

## 绑定邮箱

```typescript
import { bindEmail } from '@nine-shadow/http-utils'

await bindEmail('user@example.com', '123456')

alert('邮箱绑定成功')
```

## 完整示例

### 用户资料编辑

```typescript
import { getUserInfo, updateUserInfo, uploadAvatar } from '@nine-shadow/http-utils'
import { ref, onMounted } from 'vue'

const userInfo = ref(null)
const avatarFile = ref(null)
const uploading = ref(false)

// 加载用户信息
onMounted(async () => {
  userInfo.value = await getUserInfo()
})

// 选择头像
const handleAvatarChange = (event) => {
  avatarFile.value = event.target.files[0]
}

// 上传头像
const handleUploadAvatar = async () => {
  if (!avatarFile.value) return

  uploading.value = true
  
  try {
    const avatarUrl = await uploadAvatar(avatarFile.value)
    
    // 更新用户信息
    userInfo.value = await updateUserInfo({
      avatar: avatarUrl
    })
    
    alert('头像上传成功')
  } catch (error) {
    alert('头像上传失败')
  } finally {
    uploading.value = false
  }
}

// 保存用户信息
const handleSave = async () => {
  try {
    await updateUserInfo({
      nickname: userInfo.value.nickname,
      email: userInfo.value.email
    })
    
    alert('保存成功')
  } catch (error) {
    alert('保存失败')
  }
}
```

### 修改密码表单

```typescript
import { updatePassword } from '@nine-shadow/http-utils'
import { ref } from 'vue'

const form = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const handleSubmit = async () => {
  // 验证密码
  if (form.value.newPassword !== form.value.confirmPassword) {
    alert('两次输入的密码不一致')
    return
  }

  if (form.value.newPassword.length < 6) {
    alert('密码长度不能少于 6 位')
    return
  }

  try {
    await updatePassword(form.value)
    alert('密码修改成功，请重新登录')
    
    // 清除登录状态
    clearAuth()
    window.location.href = '/login'
  } catch (error) {
    if (error.response?.status === 400) {
      alert('原密码错误')
    } else {
      alert('修改失败，请稍后重试')
    }
  }
}
```

## 类型定义

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

### UpdateUserInfoRequest

```typescript
interface UpdateUserInfoRequest {
  nickname?: string       // 昵称
  avatar?: string         // 头像
  email?: string          // 邮箱
  [key: string]: any      // 其他字段
}
```

### UpdatePasswordRequest

```typescript
interface UpdatePasswordRequest {
  oldPassword: string       // 旧密码
  newPassword: string       // 新密码
  confirmPassword?: string  // 确认新密码
}
```

## 最佳实践

1. **密码强度检查**：修改密码时检查密码强度
2. **头像预览**：上传前显示头像预览
3. **表单验证**：提交前验证表单数据
4. **错误处理**：提供友好的错误提示
5. **权限控制**：根据用户角色和权限控制功能访问

## 相关链接

- [IAM 身份认证](/modules/iam/)
- [文件上传](/modules/upload/)
