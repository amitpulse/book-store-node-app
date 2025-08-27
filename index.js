import mongoose from "mongoose";
import app from "./src/app.js";
import connectDB from './src/config/database.js';
import dotenv from 'dotenv';

dotenv.config({quiet: true});

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Graceful shutdown handling
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

async function startServer() {
  try {
    // Connect to MongoDB atlas
    await connectDB();
    console.log('===> Database connected successfully');
    
    // express server start
    const server = app.listen(PORT, () => {
      console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
      console.log(`Nalanda Library API ready at http://localhost:${PORT}`);
      
      if (NODE_ENV === 'development') {
        console.log(`GraphQL Playground: http://localhost:${PORT}/graphql`);
        console.log(`Health Check: http://localhost:${PORT}/health`);
      }
    });

    // server errors handler
    server.on('error', handleServerError);
    
    // server reference for graceful shutdown
    global.server = server;
    
  } catch (error) {
    console.error('ERROR: Failed to start server:', error.message);
    process.exit(1);
  }
}

function handleServerError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  switch (error.code) {
    case 'EACCES':
      console.error(`Port ${PORT} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`Port ${PORT} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function gracefulShutdown(signal) {
  console.log(`\n ${signal} received. Starting graceful shutdown...`);
  
  if (global.server) {
    global.server.close(() => {
      console.log('HTTP server closed');
      
      mongoose.connection.close(() => {
        console.log('Database connection closed');
        console.log('Graceful shutdown completed');
        process.exit(0);
      });
    });
  } else {
    process.exit(0);
  }
}

// Start server
startServer();