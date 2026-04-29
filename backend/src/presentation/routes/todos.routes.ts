import { Router } from 'express';
import * as ctrl from '../controllers/todos.ctrl.js';
import { requireAuth } from '../middleware/auth.mw.js';

export const todosRouter = Router();

todosRouter.use(requireAuth);
todosRouter.post('/', ctrl.create);
todosRouter.get('/', ctrl.list);
todosRouter.get('/:id', ctrl.getOne);
todosRouter.patch('/:id', ctrl.update);
todosRouter.delete('/:id', ctrl.remove);
