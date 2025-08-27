import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import {
  getAllBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook,
} from '../controllers/Book.controller.js';

const router = express.Router();

// Public routes
router.get('/', getAllBooks);
router.get('/:id', getBookById);

// Admin only routes
router.post('/', authenticate, requireAdmin, addBook);
router.put('/:id', authenticate, requireAdmin, updateBook);
router.delete('/:id', authenticate, requireAdmin, deleteBook);

export default router;