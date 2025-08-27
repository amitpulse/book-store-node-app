import Borrowing from '../models/Borrowing.schema.js';
import Book from '../models/Book.schema.js';

const borrowBook = async (userId, bookId) => {
  // Check if book is available
  const book = await Book.findById(bookId);
  if (!book) {
    throw new Error('Book not found');
  }
  
  if (book.availableCopies <= 0) {
    throw new Error('Book is not available');
  }
  
  // Check if user already borrowed this book
  const existingBorrow = await Borrowing.findOne({
    user: userId,
    book: bookId,
    status: 'Borrowed'
  });
  
  if (existingBorrow) {
    throw new Error('You have already borrowed this book');
  }
  
  // Create borrowing record
  const borrowing = new Borrowing({
    user: userId,
    book: bookId
  });
  
  // Update book availability
  book.availableCopies -= 1;
  
  // Save both
  await borrowing.save();
  await book.save();
  
  return await Borrowing.findById(borrowing._id).populate('book user');
};

const returnBook = async (userId, bookId) => {
  const borrowing = await Borrowing.findOne({
    user: userId,
    book: bookId,
    status: 'Borrowed'
  });
  
  if (!borrowing) {
    throw new Error('No active borrow found for this book');
  }
  
  // Update borrowing record
  borrowing.returnDate = new Date();
  borrowing.status = 'Returned';
  
  // Update book availability
  const book = await Book.findById(bookId);
  book.availableCopies += 1;
  
  // Save both
  await borrowing.save();
  await book.save();
  
  return await Borrowing.findById(borrowing._id).populate('book user');
};

const getUserBorrowHistory = async (userId, limit = 10) => {
  return await Borrowing.find({ user: userId })
    .populate('book')
    .sort({ borrowDate: -1 })
    .limit(limit);
};

const getActiveBorrows = async (userId) => {
  return await Borrowing.find({
    user: userId,
    status: 'Borrowed'
  }).populate('book');
};

const getAllBorrowings = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  const borrowings = await Borrowing.find()
    .populate('book user')
    .skip(skip)
    .limit(limit)
    .sort({ borrowDate: -1 });
  
  const total = await Borrowing.countDocuments();
  
  return {
    borrowings,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

export default {
  borrowBook,
  returnBook,
  getUserBorrowHistory,
  getActiveBorrows,
  getAllBorrowings
};