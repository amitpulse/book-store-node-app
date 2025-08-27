// src/controllers/Auth.controller.js
import userService from '../services/User.service.js';

export const register = async (req, res) => {
  try {
    console.log('Register request body:', req.body); // Debug log
    
    const result = await userService.register(req.body);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result
    });
  } catch (error) {
    console.error('Register controller error:', error); // Debug log
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    console.log('Login request body:', req.body); // Debug log
    
    const { email, password } = req.body;
    const result = await userService.login(email, password);
    
    res.json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    console.error('Login controller error:', error); // Debug log
    
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
};