<template>
  <n-layout has-sider style="min-height: 100vh;">
    <n-layout-sider :inverted="true" style="height: 100vh;" width="200" bordered collapse-mode="width">
      <n-menu
        :inverted="true"
        :options="menuOptions"
        :value="activeMenu"
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
import { h, computed } from 'vue'
import { NIcon } from 'naive-ui'
import { useRouter, useRoute } from 'vue-router'
import { routes } from '@/router/index.js'

const router = useRouter()
const route = useRoute()

const renderIcon = icon => () => h(NIcon, null, { default: () => h(icon) })

const menus = routes.find(v => v.name === 'Layout')?.children || []

const activeMenu = computed(() => route.name || 'Home')

const user = localStorage.getItem('user')

const menuOptions = menus.map(r => ({
  label: r.meta?.title || r.name,
  key: r.name,
  icon: r.meta?.icon ? renderIcon(r.meta.icon) : null
}))

const handleMenuClick = (name) => {
  const target = menus.find(r => r.name === name)
  if (target) {
    router.push({ name: target.name })
  }
}
</script>
