import mongoose, {Schema} from "mongoose";

const bookSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Book title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    author: {
      type: String,
      required: [true, "Author is required"],
      trim: true,
      maxlength: [100, "Author name cannot exceed 100 characters"],
    },
    isbn: {
      type: String,
      required: [true, "ISBN is required"],
      unique: true,
      trim: true,
      match: [
        /^(?:\d{9}[\dX]|\d{13})$/,
        "Please enter a valid ISBN (10 or 13 digits)",
      ],
    },
    publicationDate: {
      type: Date,
      required: [true, "Publication date is required"],
      validate: {
        validator: function (date) {
          return date <= new Date();
        },
        message: "Publication date cannot be in the future",
      },
    },
    genre: {
      type: String,
      required: [true, "Genre is required"],
      trim: true,
      enum: {
        values: [
          "Fiction",
          "Non-Fiction",
          "Science",
          "Technology",
          "History",
          "Biography",
          "Mystery",
          "Romance",
          "Fantasy",
          "Horror",
          "Self-Help",
          "Business",
          "Other",
        ],
        message: "Please select a valid genre",
      },
    },
    totalCopies: {
      type: Number,
      required: [true, "Total copies is required"],
      min: [1, "Total copies must be at least 1"],
      max: [1000, "Total copies cannot exceed 1000"],
    },
    availableCopies: {
      type: Number,
      required: [true, "Available copies is required"],
      min: [0, "Available copies cannot be negative"],
      validate: {
        validator: function (value) {
          return value <= this.totalCopies;
        },
        message: "Available copies cannot exceed total copies",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexing for faster searching and filtering
bookSchema.index({ title: 1 });
bookSchema.index({ author: 1 });
bookSchema.index({ genre: 1 });
bookSchema.index({ title: "text", author: "text" });


// some static methods
// Virtual field for borrowed copies
bookSchema.virtual("borrowedCopies").get(function () {
  return this.totalCopies - this.availableCopies;
});

// Check if book is available
bookSchema.methods.isAvailable = function () {
  return this.availableCopies > 0;
};

// Method to borrow a copy
bookSchema.methods.borrowCopy = async function () {
  if (this.availableCopies > 0) {
    this.availableCopies -= 1;
    await this.save();
    return true;
  }
  return false;
};

// Method to return a copy
bookSchema.methods.returnCopy = async function () {
  if (this.availableCopies < this.totalCopies) {
    this.availableCopies += 1;
    await this.save();
    return true;
  }
  return false;
};

export default mongoose.model("Book", bookSchema);
