import 'dotenv/config' // 或 import dotenv from 'dotenv'; dotenv.config();
import Koa from 'koa'
// import cors from '@koa/cors'
import bodyParser from 'koa-bodyparser'
import userRoutes from './routes/user.js'
import adsRoutes from './routes/ads.js'
import './models/db.js' // mongoose 连接
import serve from 'koa-static'
import path from 'path'
import fs from 'fs'


const app = new Koa();

const __dirname = path.dirname(new URL(import.meta.url).pathname)

// app.use(cors()); // 允许所有来源跨域

app.use(bodyParser());

app.use(userRoutes.routes()).use(userRoutes.allowedMethods());
app.use(adsRoutes.routes()).use(adsRoutes.allowedMethods());


// 读取 client/dist 作为静态资源目录
const distDir = path.resolve(__dirname, './client/dist')
const indexHtmlPath = path.join(distDir, 'index.html')

app.use(serve(distDir))

// 前端 history fallback
app.use(async ctx => {
  if (ctx.method === 'GET' && (!ctx.url.startsWith('/api') || !ctx.url.startsWith('/ads') || !ctx.url.startsWith('/user'))) {
    ctx.type = 'text/html'
    ctx.body = fs.createReadStream(indexHtmlPath)
  }
})


const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`🚀 ADS分析服务已启动， http://localhost:${PORT}`);
});
