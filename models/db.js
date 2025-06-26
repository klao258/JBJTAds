import 'dotenv/config' // 或 import dotenv from 'dotenv'; dotenv.config();
import mongoose from 'mongoose';

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('✅ Mongoose connected to jbjtads');
});

export default mongoose;
