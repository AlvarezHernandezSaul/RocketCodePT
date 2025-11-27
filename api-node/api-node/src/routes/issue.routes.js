import express from 'express';
import { IssueController } from '../controllers/issue.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', IssueController.create);
router.get('/', IssueController.getAll);
router.get('/:id', IssueController.getById);
router.put('/:id', IssueController.update);
router.delete('/:id', IssueController.delete);

export default router;
