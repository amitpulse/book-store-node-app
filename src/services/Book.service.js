import Book from '../models/Book.schema.js';
import Borrowing from '../models/Borrowing.schema.js';

const getAllBooks = async (filters = {}, pagination = {}) => {
  const { page = 1, limit = 20, genre, author, search } = { ...filters, ...pagination };
  const skip = (page - 1) * limit;
  
  // book filter using 
  const filter = {};
  if (genre) filter.genre = genre;
  if (author) filter.author = new RegExp(author, 'i');
  if (search) filter.$text = { $search: search };
  
  const books = await Book.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
    
  const total = await Book.countDocuments(filter);
  
  return {
    books,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

const getBookById = async (bookId) => {
  const book = await Book.findById(bookId);
  if (!book) {
    throw new Error('Book not found');
  }
  return book;
};

const addBook = async (bookData) => {
  const book = new Book({
    ...bookData,
    availableCopies: bookData.totalCopies
  });
  await book.save();
  return book;
};

const updateBook = async (bookId, updateData) => {
  const book = await Book.findById(bookId);
  if (!book) {
    throw new Error('Book not found');
  }
  
  // Update fields
  Object.keys(updateData).forEach(key => {
    if (updateData[key] !== undefined) {
      book[key] = updateData[key];
    }
  });
  
  // totalCopies update 
  if (updateData.totalCopies !== undefined) {
    const borrowedCopies = book.totalCopies - book.availableCopies;
    book.availableCopies = Math.max(0, updateData.totalCopies - borrowedCopies);
  }
  
  await book.save();
  return book;
};


const deleteBook = async (bookId) => {
  const book = await Book.findById(bookId);
  if (!book) {
    throw new Error('Book not found');
  }
  
  // Checking for active borrowed book by users
  const activeBorrows = await Borrowing.countDocuments({
    book: bookId,
    status: 'Borrowed'
  });
  
  if (activeBorrows > 0) {
    throw new Error('Cannot delete book with active borrows');
  }
  
  await Book.findByIdAndDelete(bookId);
  return { message: 'Book deleted successfully' };
};

export default {
  getAllBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook
};