import borrowService from '../services/Borrow.service.js';

export const borrowBook = async (req, res) => {
  try {
    const borrowing = await borrowService.borrowBook(
      req.user.id,
      req.params.bookId
    );
    res.status(201).json({
      success: true,
      message: "Book borrowed successfully",
      data: borrowing,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const returnBook = async (req, res) => {
  try {
    const borrowing = await borrowService.returnBook(
      req.user.id,
      req.params.bookId
    );
    res.json({
      success: true,
      message: "Book returned successfully",
      data: borrowing,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserBorrowHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const borrowings = await borrowService.getUserBorrowHistory(
      req.user.id,
      limit
    );
    res.json({
      success: true,
      data: borrowings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getActiveBorrows = async (req, res) => {
  try {
    const borrowings = await borrowService.getActiveBorrows(req.user.id);
    res.json({
      success: true,
      data: borrowings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};