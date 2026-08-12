import { Router, Request, Response } from 'express';
import { isDatabaseConnected } from '../config/db.js';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  const dbConnected = isDatabaseConnected();

  if (!dbConnected) {
    res.status(503).json({
      status: 'error',
      message: 'API is running but database is not connected',
      database: 'disconnected',
    });
    return;
  }

  res.json({
    status: 'ok',
    message: 'API is running',
    database: 'connected',
  });
});

export default router;
