import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  borrowBook,
  returnBook,
  getUserBorrowHistory,
  getActiveBorrows
} from "../controllers/Borrow.controller.js";

const router = express.Router();

// Borrow a book by id
router.post("/:bookId", authenticate, borrowBook);

// Return a book by id
router.patch("/:bookId/return", authenticate, returnBook);

// Get user's borrowing history
router.get("/history", authenticate, getUserBorrowHistory);

// Get active borrowed book
router.get("/active", authenticate, getActiveBorrows);

export default router;