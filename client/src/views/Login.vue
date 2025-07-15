<template>
    <div class="login-box">
      <h2>后台登录</h2>
      <form @submit.prevent="handleLogin">
        <input v-model="form.username" placeholder="用户名" />
        <input v-model="form.password" type="password" placeholder="密码" />
        <button type="submit">登录</button>
      </form>
      <p v-if="error" style="color:red">{{ error }}</p>
    </div>
</template>
  
<script setup>
import { login } from '@/api'
import { useRouter } from 'vue-router'

const router = useRouter()
const form = reactive({ username: '', password: '' })
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  try {
    const res = await login(form)
    localStorage.setItem('user', res.user)
    localStorage.setItem('accessToken', res.accessToken)
    localStorage.setItem('refreshToken', res.refreshToken)
    router.push('/')
  } catch (e) {
    error.value = e?.response?.data || '登录失败'
  }
}
</script>
  
<style scoped>
  .login-box {
    max-width: 300px;
    margin: 100px auto;
    padding: 2rem;
    border: 1px solid #ccc;
    border-radius: 8px;
  }
  .login-box input {
    width: 100%;
    margin-bottom: 10px;
    padding: 8px;
  }
</style>
  