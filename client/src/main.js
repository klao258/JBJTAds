import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import copyText from './directives/copyText.js';

const app = createApp(App);

// 注册全局指令
app.directive('copy', copyText);

app.use(router);
app.mount('#app');
