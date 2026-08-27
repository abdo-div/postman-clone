import { Router } from 'express';
import { healthController } from './health.controller.js';

const router = Router();

router.get('/health', healthController.getLiveness);
router.get('/ready', healthController.getReadiness);

export default router;