import express from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { checkLoginLock, authenticateToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/login', checkLoginLock, AuthController.login);
router.post('/register', AuthController.register);
router.get('/profile', authenticateToken, AuthController.getProfile);

export default router;
