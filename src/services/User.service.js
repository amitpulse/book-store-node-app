import User from '../models/User.schema.js';
import { generateToken } from '../middleware/auth.js';

const register = async (userData) => {
  try {
    const { name, email, password, role = 'Member' } = userData;
    
    console.log('Register attempt for:', email); // Debug log
    console.log('User model type:', typeof User); // Debug log
    console.log('User.findOne type:', typeof User.findOne); // Debug log
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Create user
    const user = new User({ name, email, password, role });
    const savedUser = await user.save();
    
    console.log('User saved successfully:', savedUser._id); // Debug log
    
    // Generate token
    const token = generateToken(savedUser._id, savedUser.email, savedUser.role);
    
    return {
      token,
      user: {
        id: savedUser._id.toString(),
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        createdAt: savedUser.createdAt
      }
    };
  } catch (error) {
    console.error('Registration error:', error); // Debug log
    throw error;
  }
};

const login = async (email, password) => {
  try {
    console.log('Login attempt for:', email); // Debug log
    
    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }
    
    // Generate token
    const token = generateToken(user._id, user.email, user.role);
    
    return {
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    };
  } catch (error) {
    console.error('Login error:', error); // Debug log
    throw error;
  }
};

const getUserById = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

const getAllUsers = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const users = await User.find().select('-password').skip(skip).limit(limit);
  const total = await User.countDocuments();
  
  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

export default {
  register,
  login,
  getUserById,
  getAllUsers
};