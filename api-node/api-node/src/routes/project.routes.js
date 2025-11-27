import express from 'express';
import { ProjectController } from '../controllers/project.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', ProjectController.create);
router.get('/', ProjectController.getAll);
router.get('/:id', ProjectController.getById);
router.put('/:id', ProjectController.update);
router.delete('/:id', ProjectController.delete);
router.get('/:id/issues', ProjectController.getIssues);

export default router;
