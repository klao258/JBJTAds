require("dotenv").config()
const Koa = require('koa');
const cors = require('@koa/cors');
const bodyParser = require('koa-bodyparser');
const userRoutes = require('./routes/user');
const adsRoutes = require('./routes/ads');
require('./models/db'); // mongoose连接

const app = new Koa();

app.use(cors()); // 允许所有来源跨域

app.use(bodyParser());

app.use(userRoutes.routes()).use(userRoutes.allowedMethods());
app.use(adsRoutes.routes()).use(adsRoutes.allowedMethods());

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
