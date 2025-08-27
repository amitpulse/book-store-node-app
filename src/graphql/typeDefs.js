import { gql } from 'graphql-tag';

export const typeDefs = gql`
  # User Types
  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  enum Role {
    Admin
    Member
  }

  # Book Types
  type Book {
    id: ID!
    title: String!
    author: String!
    isbn: String!
    publicationDate: String!
    genre: Genre!
    totalCopies: Int!
    availableCopies: Int!
    borrowedCopies: Int!
    createdAt: String!
    updatedAt: String!
  }



enum Genre {
  Fiction
  "Non-Fiction"     
  Science
  Technology
  History
  Biography
  Mystery
  Romance
  Fantasy
  Horror
  "Self-Help"   
  Business
  Other
}

  # Borrowing Types
  type Borrowing {
    id: ID!
    user: User!
    book: Book!
    borrowDate: String!
    returnDate: String
    status: BorrowStatus!
    daysBorrowed: Int!
  }

  enum BorrowStatus {
    Borrowed
    Returned
  }

  # Report Types
  type BookBorrowStats {
    book: Book!
    borrowCount: Int!
  }

  type UserBorrowStats {
    user: User!
    borrowCount: Int!
  }

  type BookAvailabilityReport {
    totalBooks: Int!
    totalCopies: Int!
    availableCopies: Int!
    borrowedCopies: Int!
    activeBorrows: Int!
  }

  # Pagination Types
  type BookConnection {
    books: [Book!]!
    pagination: PaginationInfo!
  }

  type BorrowingConnection {
    borrowings: [Borrowing!]!
    pagination: PaginationInfo!
  }

  type PaginationInfo {
    page: Int!
    limit: Int!
    total: Int!
    pages: Int!
  }

  # Input Types
  input RegisterInput {
    name: String!
    email: String!
    password: String!
    role: Role = Member
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input BookInput {
    title: String!
    author: String!
    isbn: String!
    publicationDate: String!
    genre: Genre!
    totalCopies: Int!
  }

  input UpdateBookInput {
    title: String
    author: String
    publicationDate: String
    genre: Genre
    totalCopies: Int
  }

  input BookFilters {
    genre: Genre
    author: String
    search: String
  }

  # Queries
  type Query {
    # User queries
    me: User
    users(page: Int = 1, limit: Int = 20): [User!]!

    # Book queries
    books(page: Int = 1, limit: Int = 20, filters: BookFilters): BookConnection!
    book(id: ID!): Book!

    # Borrowing queries
    myBorrowings(limit: Int = 10): [Borrowing!]!
    myActiveBorrows: [Borrowing!]!
    allBorrowings(page: Int = 1, limit: Int = 20): BorrowingConnection!

    # Reports
    mostBorrowedBooks(limit: Int = 10): [BookBorrowStats!]!
    mostActiveMembers(limit: Int = 10): [UserBorrowStats!]!
    bookAvailability: BookAvailabilityReport!
  }

  # Mutations
  type Mutation {
    # Authentication
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!

    # Book management
    addBook(input: BookInput!): Book!
    updateBook(id: ID!, input: UpdateBookInput!): Book!
    deleteBook(id: ID!): String!

    # Borrowing
    borrowBook(bookId: ID!): Borrowing!
    returnBook(bookId: ID!): Borrowing!
  }
`;