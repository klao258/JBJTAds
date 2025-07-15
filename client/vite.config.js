import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import path from 'path'
import { fileURLToPath } from 'url'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  root: __dirname,
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue'],    // 自动导入 vue 相关API
      dts: path.resolve(__dirname, 'auto-imports.d.ts'),  // 生成声明文件（可选）
    }),
    Components({
        resolvers: [NaiveUiResolver()],
        dts: path.resolve(__dirname, 'components.d.ts') // 自动生成组件类型声明
    })
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true  // ✅ 开启 source map
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        // target: 'http://localhost:3002',
        target: 'https://jbjtads.sso66s.cc',
        changeOrigin: true,
        secure: false,
      },
      '/ads': {
        // target: 'http://localhost:3002',
        target: 'https://jbjtads.sso66s.cc',
        changeOrigin: true,
        secure: false,
      },
      '/user': {
        // target: 'http://localhost:3002',
        target: 'https://jbjtads.sso66s.cc',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
