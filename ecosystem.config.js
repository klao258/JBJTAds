// ecosystem.config.js
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default {
    apps: [
      {
        name: "JBJTAds",
        script: "app.js",
        interpreter: "node",
        cwd: __dirname,
        watch: false,
        autorestart: true,
        env: {
          NODE_ENV: "production"
        }
      }
    ]
};