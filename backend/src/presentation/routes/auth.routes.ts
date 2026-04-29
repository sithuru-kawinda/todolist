import { Router } from 'express';
import * as ctrl from '../controllers/auth.ctrl.js';
import { requireAuth } from '../middleware/auth.mw.js';
import { authLimiter } from '../middleware/rateLimit.mw.js';

export const authRouter = Router();

authRouter.post('/register', authLimiter, ctrl.register);
authRouter.post('/login', authLimiter, ctrl.login);
authRouter.post('/logout', requireAuth, ctrl.logout);
authRouter.get('/me', requireAuth, ctrl.me);
