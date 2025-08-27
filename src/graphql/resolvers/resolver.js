import userService from '../../services/User.service.js';
import bookService from '../../services/Book.service.js';
import borrowService from '../../services/Borrow.service.js';
import reportService from '../../services/Report.service.js';
import { GraphQLError } from 'graphql';

// this is a helpr function for requiring authentication
const requireAuth = (user) => {
  if (!user) {
    throw new GraphQLError('You must be logged in', {
      extensions: { code: 'UNAUTHENTICATED' }
    });
  }
};

// this is a helpr function for requiring admin role
const requireAdmin = (user) => {
  requireAuth(user);
  if (user.role !== 'Admin') {
    throw new GraphQLError('Admin access required', {
      extensions: { code: 'FORBIDDEN' }
    });
  }
};

export const resolvers = {
  Query: {
    // User queies
    // get current logged in user
    me: (_, __, { user }) => {
      requireAuth(user);
      return user;
    },

    // get list of all users - only admin access
    users: async (_, { page = 1, limit = 20 }, { user }) => {
      requireAdmin(user);
      const result = await userService.getAllUsers(page, limit);
      return result.users;
    },

    // Book queries
    // get all books
    books: async (_, { page = 1, limit = 20, filters = {} }) => {
      const result = await bookService.getAllBooks(filters, { page, limit });
      return {
        books: result.books,
        pagination: result.pagination
      };
    },

    // get single book by id
    book: async (_, { id }) => {
      return await bookService.getBookById(id);
    },

    // Borrowing queries
    // Borrowed books istory by current user
    myBorrowings: async (_, { limit = 10 }, { user }) => {
      requireAuth(user);
      return await borrowService.getUserBorrowHistory(user.id, limit);
    },

    // currently all borrowed books
    myActiveBorrows: async (_, __, { user }) => {
      requireAuth(user);
      return await borrowService.getActiveBorrows(user.id);
    },

    // books borrowd by all users- admin access only
    allBorrowings: async (_, { page = 1, limit = 20 }, { user }) => {
      requireAdmin(user);
      const result = await borrowService.getAllBorrowings(page, limit);
      return {
        borrowings: result.borrowings,
        pagination: result.pagination
      };
    },

    // Reports
    mostBorrowedBooks: async (_, { limit = 10 }, { user }) => {
      requireAuth(user);
      return await reportService.getMostBorrowedBooks(limit);
    },

    mostActiveMembers: async (_, { limit = 10 }, { user }) => {
      requireAdmin(user);
      return await reportService.getMostActiveMembers(limit);
    },

    bookAvailability: async (_, __, { user }) => {
      requireAuth(user);
      return await reportService.getBookAvailability();
    }
  },

  Mutation: {
    // Authentication
    register: async (_, { input }) => {
      try {
        const result = await userService.register(input);
        // Returning properly formatted response
        return {
          token: result.token,
          user: {
            id: result.user.id, 
            name: result.user.name,
            email: result.user.email,
            role: result.user.role,
            createdAt: result.user.createdAt instanceof Date 
              ? result.user.createdAt.toISOString() 
              : result.user.createdAt
          }
        };
      } catch (error) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
    },

    login: async (_, { input }) => {
      try {
        const result = await userService.login(input.email, input.password);
        // Return properly formatted response
        return {
          token: result.token,
          user: {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            role: result.user.role,
            createdAt: result.user.createdAt instanceof Date 
              ? result.user.createdAt.toISOString() 
              : result.user.createdAt
          }
        };
      } catch (error) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }
    },

    // Book management
    addBook: async (_, { input }, { user }) => {
      requireAdmin(user);
      return await bookService.addBook(input);
    },

    updateBook: async (_, { id, input }, { user }) => {
      requireAdmin(user);
      return await bookService.updateBook(id, input);
    },

    deleteBook: async (_, { id }, { user }) => {
      requireAdmin(user);
      await bookService.deleteBook(id);
      return 'Book deleted successfully';
    },

    // Borrowing
    borrowBook: async (_, { bookId }, { user }) => {
      requireAuth(user);
      return await borrowService.borrowBook(user.id, bookId);
    },

    returnBook: async (_, { bookId }, { user }) => {
      requireAuth(user);
      return await borrowService.returnBook(user.id, bookId);
    }
  },

  // Field resolvers
  Book: {
    borrowedCopies: (book) => book.totalCopies - book.availableCopies,
    id: (book) => book._id ? book._id.toString() : book.id,
    createdAt: (book) => book.createdAt ? book.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: (book) => book.updatedAt ? book.updatedAt.toISOString() : new Date().toISOString(),
    publicationDate: (book) => book.publicationDate ? book.publicationDate.toISOString() : null
  },

  User: {
    id: (user) => {
      // Handle different id formats
      if (user._id) return user._id.toString();
      if (user.id) return user.id.toString();
      return null;
    },
    createdAt: (user) => {
      if (user.createdAt) {
        return user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt;
      }
      return new Date().toISOString();
    }
  },

  Borrowing: {
    id: (borrowing) => borrowing._id ? borrowing._id.toString() : borrowing.id,
    daysBorrowed: (borrowing) => {
      const endDate = borrowing.returnDate || new Date();
      return Math.ceil((endDate - borrowing.borrowDate) / (1000 * 60 * 60 * 24));
    },
    borrowDate: (borrowing) => borrowing.borrowDate ? borrowing.borrowDate.toISOString() : new Date().toISOString(),
    returnDate: (borrowing) => borrowing.returnDate ? borrowing.returnDate.toISOString() : null
  }
};