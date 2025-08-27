import Book from '../models/Book.schema.js';
import Borrowing from '../models/Borrowing.schema.js';

const getMostBorrowedBooks = async (limit = 10) => {
  return await Borrowing.aggregate([
    {
      $group: {
        _id: '$book',
        borrowCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'books',
        localField: '_id',
        foreignField: '_id',
        as: 'book'
      }
    },
    {
      $unwind: '$book'
    },
    {
      $sort: { borrowCount: -1 }
    },
    {
      $limit: limit
    },
    {
      $project: {
        book: '$book',
        borrowCount: 1
      }
    }
  ]);
};

const getMostActiveMembers = async (limit = 10) => {
  return await Borrowing.aggregate([
    {
      $group: {
        _id: '$user',
        borrowCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $sort: { borrowCount: -1 }
    },
    {
      $limit: limit
    },
    {
      $project: {
        user: {
          _id: '$user._id',
          name: '$user.name',
          email: '$user.email'
        },
        borrowCount: 1
      }
    }
  ]);
};

const getBookAvailability = async () => {
  const totalBooks = await Book.countDocuments();
  const totalCopies = await Book.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: '$totalCopies' },
        available: { $sum: '$availableCopies' }
      }
    }
  ]);

  const activeBorrows = await Borrowing.countDocuments({ status: 'Borrowed' });

  return {
    totalBooks,
    totalCopies: totalCopies[0]?.total || 0,
    availableCopies: totalCopies[0]?.available || 0,
    borrowedCopies: (totalCopies[0]?.total || 0) - (totalCopies[0]?.available || 0),
    activeBorrows
  };
};

export default {
  getMostBorrowedBooks,
  getMostActiveMembers,
  getBookAvailability
};