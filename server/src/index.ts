import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env.js';
import { connectDatabase } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/admin/authRoutes.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

if (env.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

app.use('/api', healthRoutes);
app.use('/api/admin/auth', authRoutes);

app.use(errorHandler);

async function start(): Promise<void> {
  try {
    await connectDatabase();
    console.log('Connected to MongoDB');

    app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
