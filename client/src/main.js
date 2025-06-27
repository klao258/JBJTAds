import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { create, zhCN } from 'naive-ui'

const naive = create({
  locale: zhCN
})

const app = createApp(App)
app.use(naive)
app.use(router)
app.mount('#app')
