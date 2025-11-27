import { AuthService, LoginAttemptService } from '../services/auth.service.js';
import { UserRepository } from '../repositories/index.js';

const userRepository = new UserRepository();

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = AuthService.verifyToken(token);
    const user = await userRepository.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Invalid token - user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const checkLoginLock = (req, res, next) => {
  const { email } = req.body;

  if (LoginAttemptService.isLocked(email)) {
    const remainingTime = Math.ceil(LoginAttemptService.getRemainingLockTime(email) / 1000);
    return res.status(429).json({
      error: 'Account temporarily locked due to too many failed attempts',
      lockTimeRemaining: remainingTime
    });
  }

  next();
};
