<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <DefaultLayout />
  </n-config-provider>
</template>
  
<script setup>
import { NConfigProvider } from 'naive-ui'
import DefaultLayout from '@/components/Menu.vue'

const themeOverrides = {
  common: {},
  Card: {
    titleTextColor: '#42b983', // 设置标题文字颜色
    paddingMedium: '5px 10px'  // 修改默认中等尺寸 padding
  }
}
</script>

<style>
.flex{
  display: flex;
}
.flex-v{
  flex-direction: column;
}
.flex-1{
  flex: 1;
  overflow: hidden;
}
.flex-center-x {
  justify-content: center;
}
.flex-center-y {
  align-items: center;
}
.flex-center {
  justify-content: center;
  align-items: center;
}
.flex-between{
  justify-content: space-between;
}

.page{
  height: 100% !important;
}
.n-card-header__extra {
  color: red !important;
}
</style>
