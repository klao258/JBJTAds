import 'dotenv/config'; // 或 import dotenv from 'dotenv'; dotenv.config();
import Koa from 'koa';
// import cors from '@koa/cors'
import bodyParser from 'koa-bodyparser';
import userRoutes from './routes/user.js';
import adsRoutes from './routes/ads.js';
import authRoutes from './routes/auth.js';
import channelRoutes from './routes/channel.js';
import './models/db.js'; // mongoose 连接
import serve from 'koa-static';
import path from 'path';
import fs from 'fs';

const app = new Koa();

const __dirname = path.dirname(new URL(import.meta.url).pathname);

app.use(
	cors({
		origin: (ctx) => {
			// 允许来自 Telegram Ads 的请求
			if (ctx.request.header.origin === 'https://ads.telegram.org') {
				return 'https://ads.telegram.org';
			}
			return '*'; // 或设置为特定域名
		},
		credentials: true,
		allowMethods: ['GET', 'POST', 'OPTIONS'],
		allowHeaders: ['Content-Type', 'Authorization'],
	})
);

app.use(async (ctx, next) => {
	const { method, path, ip, headers } = ctx;
	// console.log(`🟢 ${method} ${path} from ${ip}`)
	// console.log('📦 headers:', headers)
	if (['POST', 'PUT', 'PATCH'].includes(method)) {
		console.log('📨 body:', ctx.request.body);
	}
	await next();
});

app.use(bodyParser());

app.use(authRoutes.routes()).use(authRoutes.allowedMethods());
app.use(userRoutes.routes()).use(userRoutes.allowedMethods());
app.use(adsRoutes.routes()).use(adsRoutes.allowedMethods());
app.use(channelRoutes.routes()).use(channelRoutes.allowedMethods());

// 读取 client/dist 作为静态资源目录
const distDir = path.resolve(__dirname, './client/dist');
const indexHtmlPath = path.join(distDir, 'index.html');

app.use(serve(distDir));

// 前端 history fallback
app.use(async (ctx) => {
	if (
		ctx.method === 'GET' &&
		(!ctx.url.startsWith('/api') || !ctx.url.startsWith('/ads') || !ctx.url.startsWith('/user'))
	) {
		ctx.type = 'text/html';
		ctx.body = fs.createReadStream(indexHtmlPath);
	}
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
	console.log(`🚀 ADS分析服务已启动， http://localhost:${PORT}`);
});
