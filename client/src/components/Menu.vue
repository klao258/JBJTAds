<template>
    <n-layout has-sider style="min-height: 100vh;">
      <n-layout-sider :inverted="true" style="height: 100vh;" width="200" bordered collapse-mode="width">
        <n-menu
          :inverted="true"
          :options="menuOptions"
          :value="activeMenu"
          :default-value="currentRouteName"
          @update:value="handleMenuClick"
        />
      </n-layout-sider>
  
      <n-layout>
        <n-layout-content style="padding: 5px; height: 100vh;">
          <router-view />
        </n-layout-content>
      </n-layout>
    </n-layout>
  </template>
  
  <script setup>
  import { NIcon } from 'naive-ui'
  import { useRouter, useRoute } from 'vue-router'
  import { routes } from '@/router/index.js'
  
  const router = useRouter()
  const route = useRoute()

  const renderIcon = icon => () => h(NIcon, null, { default: () => h(icon) })

  // 当前菜单选中项
  const activeMenu = computed(() => route.name || 'Home')  // 👈 默认选中 Home
  const currentRouteName = computed(() => route.name)
  
  // 生成菜单项
  const menuOptions = routes.map(r => ({
    label: r.meta?.title || r.name,
    key: r.name,
    icon: r.meta?.icon ? renderIcon(r.meta.icon) : null
  }))
  
  const handleMenuClick = name => {
    const target = routes.find(r => r.name === name)
    if (target) router.push({ name: target.name })
  }
  </script>
  