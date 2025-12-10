// Main server file
// Load environment variables FIRST before any imports that need them
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import analyzeRoute from './routes/analyzeRoute.js';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Cho phép CORS từ chrome extension
app.use(express.json({ limit: '50mb' })); // Tăng limit để nhận base64 image lớn
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api', analyzeRoute);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(port, () => {
  console.log(` Server is running on port ${port}`);
  console.log(` Health check: http://localhost:${port}/health`);
  console.log(` Analyze endpoint: http://localhost:${port}/api/analyze`);
  
  // Check if Gemini API key is set
  if (!process.env.GEMINI_API_KEY) {
    console.warn('  WARNING: GEMINI_API_KEY is not set in .env file');
  } else {
    console.log(' Gemini API key is configured');
  }
});