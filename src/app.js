import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import http from 'http';

// GraphQL
import { typeDefs, resolvers } from './graphql/index.graphql.js';
import { getGraphQLContext } from './middleware/auth.js';

// Routes
import authRoutes from './routes/Auth.route.js';
import bookRoutes from './routes/Book.routes.js';
import borrowRoutes from './routes/Borrow.route.js';
import reportRoutes from './routes/Report.route.js';

const app = express();
const httpServer = http.createServer(app);

app.use(cors());
app.use(express.json());

// api health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Nalanda Library API' });
});

// REST Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrow', borrowRoutes);
app.use('/api/reports', reportRoutes);

// apollo GraphQL server
async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });
  
  await server.start();
  
  app.use('/graphql', expressMiddleware(server, {
    context: async ({ req }) => await getGraphQLContext(req)
  }));
}

startApolloServer().catch(err => console.error('Apollo Server Error:', err));

export default app;