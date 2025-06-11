import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { _id: string };
    const user = await User.findOne({ _id: decoded._id, isActive: true });

    if (!user) {
      throw new Error();
    }

    // Update last login time
    user.lastLogin = new Date();
    await user.save();

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate.' });
  }
};

// Middleware to check if user is admin
export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Middleware to check if user is editor or admin
export const isEditorOrAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !['editor', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Editor privileges required.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Rate limiting middleware
export const rateLimit = (windowMs: number, max: number) => {
  const requests = new Map<string, { count: number; firstRequest: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip;
    const now = Date.now();

    if (requests.has(ip)) {
      const request = requests.get(ip)!;
      
      if (now - request.firstRequest > windowMs) {
        request.count = 1;
        request.firstRequest = now;
      } else if (request.count >= max) {
        return res.status(429).json({
          message: 'Too many requests, please try again later.'
        });
      } else {
        request.count++;
      }
    } else {
      requests.set(ip, { count: 1, firstRequest: now });
    }

    // Clean up old entries
    for (const [key, value] of requests.entries()) {
      if (now - value.firstRequest > windowMs) {
        requests.delete(key);
      }
    }

    next();
  };
};

// Validate request body middleware
export const validateRequestBody = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details.map((detail: any) => detail.message)
      });
    }
    next();
  };
};