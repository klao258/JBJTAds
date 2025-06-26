import 'dotenv/config' // 或 import dotenv from 'dotenv'; dotenv.config();
import Koa from 'koa'
// import cors from '@koa/cors'
import bodyParser from 'koa-bodyparser'
import userRoutes from './routes/user.js'
import adsRoutes from './routes/ads.js'
import './models/db.js' // mongoose 连接

const app = new Koa();

// app.use(cors()); // 允许所有来源跨域

app.use(bodyParser());

app.use(userRoutes.routes()).use(userRoutes.allowedMethods());
app.use(adsRoutes.routes()).use(adsRoutes.allowedMethods());

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
