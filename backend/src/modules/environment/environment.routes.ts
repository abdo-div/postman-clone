import { Router } from 'express';
import { environmentController } from './environment.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createEnvironmentSchema,
  updateEnvironmentSchema,
  environmentIdParamSchema,
} from './environment.dto.js';

const router = Router();

router.post('/', validate(createEnvironmentSchema), environmentController.create);
router.get('/', environmentController.getAll);
router.get('/:id', validate(environmentIdParamSchema), environmentController.getById);
router.patch('/:id', validate(updateEnvironmentSchema), environmentController.update);
router.delete('/:id', validate(environmentIdParamSchema), environmentController.delete);

export default router;