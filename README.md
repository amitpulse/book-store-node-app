# Library API


## Feature implemented

- **User Management**: Register, login with admin/member roles
- **Book Management**: CRUD operation and search books (admin only)
- **Borrowing System**: Borrow and return books
- **Reports**: Most borrowed books, active members, book availability
- **Dual shared APIs**: Both REST and GraphQL endpoints

## Important notes

- Books must have unique ISBN numbers
- Users can't borrow the same book twice simultaneously
- Books can only be deleted if no active borrows exist
- JWT tokens expire in 7 days
- All dates are in ISO format
- All API testing was done using Postman (REST) and Apollo Server playground (GraphQL)

## Setup Instruction

### 1. Package Installation
```bash
git clone <repo-link>
cd task-book-store
npm install
```

### 2. Environment Setup

**Please create a `.env` file in root directory:**
```
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/nalanda-library
JWT_SECRET=your-secret-key
PORT=5000
NODE_ENV=development
JWT_EXPIRE=7d
```

### 3. Start the Server
```bash
# Development mode
npm run dev
```

Server will run on base URL `http://localhost:5000`

## How to Use

### Sample data has been provided in "samples" folder
- "samples" folder contain books-sample.json & users-sample.json files.
- Please use those data for quick testing APIs, both REST and GraphQL.
- You can also create your data for testing APIs



### REST API Endpoints

#### Authentication
```bash
# Register a new user
POST /api/auth/register
{
  "name": "Mahesh Babu",
  "email": "maheshbabu@mail.com",
  "password": "mahesh@54321",
  "role": "Member" or "Admin" [default Member]
}
# Login
POST /api/auth/login
{
 "email": "maheshbabu@mail.com",
  "password": "mahesh@54321",
}
```

#### Books (Anyone can view, Admin can manage)
```bash
# Get all books (with filters)
GET /api/books?page=1&limit=10&genre=Fiction&author=Author Name

# Get single book
GET /api/books/:bookId

# Add book (Admin only)
POST /api/books
{
  "title": "Book Title",
  "author": "Author Name",
  "isbn": "1234567890",
  "publicationDate": "2023-01-01",
  "genre": "Fiction",
  "totalCopies": 5
}

# Update book (Admin only)
PUT /api/books/:bookId

# Delete book (Admin only)
DELETE /api/books/:bookId
```

#### Borrowing (Only authenticated users (admin & members))
```bash
# Borrow a book
POST /api/borrow/:bookId

# Return a book
PATCH /api/borrow/:bookId/return

# Get my borrowing history
GET /api/borrow/history?limit=10

# Get my active borrowed books
GET /api/borrow/active
```

#### Reports (Admin only)
```bash
# Most borrowed books
GET /api/reports/most-borrowed (no limit)
GET /api/reports/most-borrowed?limit=10 (with limit)

# Most active members (Admin only)
GET /api/reports/active-members?limit=10

# Book availability stats
GET /api/reports/book-availability
```

### GraphQL API

Open GraphQL Playground at: `http://localhost:5000/graphql`

#### Sample GraphQL Queries

**Register/Login:**
```graphql
mutation Register {
  register(input: {
    name: "Mahesh Babu Jr"
    email: "juniormahesh@example.com"
    password: "jrmahesh@54321"
    role: Member
  }) {
    token
    user {
      id
      name
      email
      role
    }
  }
}

mutation Login {
  login(input: {
    email: "juniormahesh@example.com"
    password: "jrmahesh@54321"
  }) {
    token
    user {
      id
      name
      role
    }
  }
}
```

**Get Books:**
```graphql
query GetBooks {
  books(page: 1, limit: 10, filters: { genre: Fiction }) {
    books {
      id
      title
      author
      availableCopies
      genre
    }
    pagination {
      page
      total
      pages
    }
  }
}
```

**Borrow/Return Books:**
```graphql
mutation BorrowBook {
  borrowBook(bookId: "book-id-here") {
    id
    borrowDate
    book {
      title
      author
    }
  }
}

mutation ReturnBook {
  returnBook(bookId: "book-id-here") {
    id
    returnDate
    daysBorrowed
  }
}
```

**Get Reports:**
```graphql
query Reports {
  mostBorrowedBooks(limit: 5) {
    book {
      title
      author
    }
    borrowCount
  }
  
  bookAvailability {
    totalBooks
    totalCopies
    availableCopies
    activeBorrows
  }
}
```

## Authentication

For protected routes, include the JWT token in headers:
```
Authorization: Bearer your-jwt-token
```

## User Roles

- **Admin**: Can manage books, view all reports, access all user data
- **Member**: Can borrow/return books, view own history, see basic reports

## Available Book Genres

Fiction, Non-Fiction, Science, Technology, History, Biography, Mystery, Romance, Fantasy, Horror, Self-Help, Business, Other

## Health Check

Open `http://localhost:5000/health` to check if API is running.