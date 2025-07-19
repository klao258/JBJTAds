import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createDiscreteApi } from 'naive-ui';
import copyDirective from './directives/copy';

const app = createApp(App);

// 创建全局 message 实例
const { message } = createDiscreteApi(['message']);
window.$message = message;

// 注册全局指令
app.directive('copy', copyDirective);

app.use(router);
app.mount('#app');
