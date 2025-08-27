import mongoose, {Schema} from 'mongoose';

// schema for borrowinng books
const borrowingSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  book: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book is required']
  },
  borrowDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  returnDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: {
      values: ['Borrowed', 'Returned'],
      message: 'Status must be either Borrowed or Returned'
    },
    default: 'Borrowed',
    required: true
  }
}, {
  timestamps: true
});

// Indexing for efficient queries
borrowingSchema.index({ user: 1, status: 1 });
borrowingSchema.index({ book: 1, status: 1 });
borrowingSchema.index({ borrowDate: 1 });
borrowingSchema.index({ status: 1 });

// Compound index for user history queries
borrowingSchema.index({ user: 1, borrowDate: -1 });

// Virtual field for days borrowed
borrowingSchema.virtual('daysBorrowed').get(function() {
  const endDate = this.returnDate || new Date();
  return Math.ceil((endDate - this.borrowDate) / (1000 * 60 * 60 * 24));
});

// Method to return book
borrowingSchema.methods.returnBook = async function() {
  if (this.status !== 'Borrowed') {
    throw new Error('Book is not currently borrowed');
  }
  
  this.returnDate = new Date();
  this.status = 'Returned';
  await this.save();
  
  // Update book availability
  const Book = mongoose.model('Book');
  const book = await Book.findById(this.book);
  if (book) {
    await book.returnCopy();
  }
  
  return this;
};
// few static methods
// static methods to get users actuvly borrowed book
borrowingSchema.statics.getActiveBorrows = function(userId) {
  return this.find({ user: userId, status: 'Borrowed' }).populate('book');
};

// static method to get borrowed book history
borrowingSchema.statics.getBorrowingHistory = function(userId, limit = 10) {
  return this.find({ user: userId })
    .populate('book')
    .sort({ borrowDate: -1 })
    .limit(limit);
};

export default mongoose.model('Borrowing', borrowingSchema);