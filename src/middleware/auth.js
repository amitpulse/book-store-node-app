import jwt from 'jsonwebtoken';
import User from '../models/User.schema.js';

// token generation using jwt
export const generateToken = (userId, email, role) => {
  return jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET || 'your-jwt-secret',
    { expiresIn: '7d' }
  );
};

// jwt token verification
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// authentication middleware
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Role based access
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// GraphQL context for authentication
export const getGraphQLContext = async (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return { user: null };
    
    const token = authHeader.replace('Bearer ', '');
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select('-password');
    
    return { user };
  } catch (error) {
    return { user: null };
  }
};