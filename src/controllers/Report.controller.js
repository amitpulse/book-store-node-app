import reportService from '../services/Report.service.js';

export const getMostBorrowedBooks = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const books = await reportService.getMostBorrowedBooks(limit);
    res.json({
      success: true,
      data: books
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getMostActiveMembers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const members = await reportService.getMostActiveMembers(limit);
    res.json({
      success: true,
      data: members
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getBookAvailability = async (req, res) => {
  try {
    const report = await reportService.getBookAvailability();
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};