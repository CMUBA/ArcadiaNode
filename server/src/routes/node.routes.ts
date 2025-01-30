import { Router } from 'express';
import { NodeController } from '../controllers/node.controller';
import { validateNodeRegister, validateNodeAuth } from '../middlewares/validators/node.validator';

const router = Router();
const nodeController = new NodeController();

router.post('/register', validateNodeRegister, nodeController.register);
router.post('/auth', validateNodeAuth, nodeController.authenticate);

export default router; 