import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validateUserAuth } from '../middlewares/validators/user.validator';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
const userController = new UserController();

router.post('/auth', validateUserAuth, userController.authenticate);
router.get('/profile', authMiddleware, userController.getProfile);

export default router; 