import { AuthService, LoginAttemptService } from '../services/auth.service.js';
import { UserRepository } from '../repositories/index.js';

const userRepository = new UserRepository();

export class AuthController {
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await userRepository.findByEmail(email);
      if (!user) {
        const attemptInfo = LoginAttemptService.recordFailedAttempt(email);
        return res.status(401).json({ 
          error: 'Invalid credentials',
          ...attemptInfo
        });
      }

      const isPasswordValid = await AuthService.comparePassword(password, user.password);
      if (!isPasswordValid) {
        const attemptInfo = LoginAttemptService.recordFailedAttempt(email);
        return res.status(401).json({ 
          error: 'Invalid credentials',
          ...attemptInfo
        });
      }

      LoginAttemptService.recordSuccessfulAttempt(email);

      const token = AuthService.generateToken(user);
      
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        message: 'Login successful',
        token,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async register(req, res) {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Email, password, and name are required' });
      }

      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
      }

      const hashedPassword = await AuthService.hashPassword(password);

      const newUser = await userRepository.create({
        email,
        password: hashedPassword,
        name
      });

      const token = AuthService.generateToken(newUser);

      const { password: _, ...userWithoutPassword } = newUser;

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getProfile(req, res) {
    try {
      const { password: _, ...userWithoutPassword } = req.user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
