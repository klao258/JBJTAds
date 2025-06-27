<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <DefaultLayout />
  </n-config-provider>
</template>
  
<script setup>
import DefaultLayout from '@/components/Menu.vue'

const themeOverrides = {
  common: {},
  Card: {
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
</style>
