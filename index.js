console.log('=== index.js: Server file starting ===');

// Global error handlers for debugging
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
import express from 'express';
import dotenv from 'dotenv';
import authHandler from './api/auth.js';
import menuHandler from './api/menu.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Route handlers
app.all('/api/auth', (req, res) => {
  Promise.resolve(authHandler(req, res)).catch(err => {
    console.error('Error in /api/auth:', err);
    if (!res.headersSent) res.status(500).json({ error: 'Internal server error' });
  });
});
app.all('/api/menu', (req, res) => {
  Promise.resolve(menuHandler(req, res)).catch(err => {
    console.error('Error in /api/menu:', err);
    if (!res.headersSent) res.status(500).json({ error: 'Internal server error' });
  });
});

// Health check
app.get('/', (req, res) => {
  res.send('Backend server is running.');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

console.log('=== index.js: End of file reached (should not happen unless process is exiting) ===');