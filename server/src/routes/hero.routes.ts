import { Router } from 'express';
import { HeroController } from '../controllers/hero.controller';
import { validateHeroCreate, validateHeroSave } from '../middlewares/validators/hero.validator';
import { authMiddleware } from '../middlewares/auth';

const router = Router();
const heroController = new HeroController();

router.post('/create', [authMiddleware, validateHeroCreate], heroController.create);
router.get('/load', authMiddleware, heroController.load);
router.post('/save', [authMiddleware, validateHeroSave], heroController.save);

export default router; 