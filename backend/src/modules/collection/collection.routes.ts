import { Router } from 'express';
import { collectionController } from './collection.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createCollectionSchema,
  updateCollectionSchema,
  collectionIdParamSchema,
} from './collection.dto.js';

const router = Router();

router.post('/', validate(createCollectionSchema), collectionController.create);
router.get('/', collectionController.getAll);
router.get('/:id', validate(collectionIdParamSchema), collectionController.getById);
router.patch('/:id', validate(updateCollectionSchema), collectionController.update);
router.delete('/:id', validate(collectionIdParamSchema), collectionController.delete);

export default router;