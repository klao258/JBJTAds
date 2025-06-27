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

<style scoped>
nav {
  margin-bottom: 1em;
}
</style>
