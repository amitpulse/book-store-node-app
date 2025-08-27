import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import {
  getMostBorrowedBooks,
  getMostActiveMembers,
  getBookAvailability
} from '../controllers/Report.controller.js';

const router = express.Router();

// Most borrowed books report - accessible to all authenticated users
router.get('/most-borrowed', authenticate, getMostBorrowedBooks);

// Most active members/users report- admin only
router.get('/active-members', authenticate, requireAdmin, getMostActiveMembers);

// Book availability report - accessible to all authenticated users
router.get('/book-availability', authenticate, getBookAvailability);

export default router;