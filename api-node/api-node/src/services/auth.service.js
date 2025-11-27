import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development';

export class AuthService {
  static generateToken(user) {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  static async hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}

const loginAttempts = new Map();

export class LoginAttemptService {
  static MAX_ATTEMPTS = 3;
  static LOCKOUT_DURATION = 3 * 60 * 1000; // 3 minutes

  static isLocked(email) {
    const attempt = loginAttempts.get(email);
    if (!attempt) return false;

    const now = Date.now();
    if (now - attempt.lockUntil > 0) {
      loginAttempts.delete(email);
      return false;
    }

    return true;
  }

  static getRemainingLockTime(email) {
    const attempt = loginAttempts.get(email);
    if (!attempt) return 0;

    const now = Date.now();
    const remaining = attempt.lockUntil - now;
    return Math.max(0, remaining);
  }

  static recordFailedAttempt(email) {
    const attempt = loginAttempts.get(email) || { count: 0, lockUntil: 0 };
    attempt.count += 1;

    if (attempt.count >= this.MAX_ATTEMPTS) {
      attempt.lockUntil = Date.now() + this.LOCKOUT_DURATION;
    }

    loginAttempts.set(email, attempt);
    return {
      attempts: attempt.count,
      remainingAttempts: Math.max(0, this.MAX_ATTEMPTS - attempt.count),
      isLocked: attempt.count >= this.MAX_ATTEMPTS,
      lockTime: attempt.count >= this.MAX_ATTEMPTS ? this.LOCKOUT_DURATION : 0
    };
  }

  static recordSuccessfulAttempt(email) {
    loginAttempts.delete(email);
  }

  static getAttemptInfo(email) {
    const attempt = loginAttempts.get(email);
    if (!attempt) return { attempts: 0, remainingAttempts: this.MAX_ATTEMPTS, isLocked: false };

    const isLocked = this.isLocked(email);
    return {
      attempts: attempt.count,
      remainingAttempts: Math.max(0, this.MAX_ATTEMPTS - attempt.count),
      isLocked,
      lockTime: isLocked ? this.getRemainingLockTime(email) : 0
    };
  }
}
