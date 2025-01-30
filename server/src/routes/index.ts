import { Router } from 'express';
import nodeRoutes from './node.routes';
import userRoutes from './user.routes';
import heroRoutes from './hero.routes';

const router = Router();

router.use('/node', nodeRoutes);
router.use('/user', userRoutes);
router.use('/hero', heroRoutes);

export default router; 