const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./src/config/db');
const apiRoutes = require('./src/routes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Build allowed origins list from env + defaults
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
];

// Add production CORS_ORIGIN if set (comma-separated for multiple)
if (process.env.CORS_ORIGIN) {
  process.env.CORS_ORIGIN.split(',').forEach(origin => {
    allowedOrigins.push(origin.trim());
  });
}

// Enable CORS for frontend
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Mount versioned API routes
app.use('/api/v1', apiRoutes);

// Root greeting
app.get('/', (req, res) => {
  res.json({
    project: 'BhoomiSetu (भूमिसेतु)',
    tagline: 'National Land Acquisition & Management System',
    authority: 'Government of India',
    statutoryAct: 'RFCTLARR Act, 2013',
    docs: '/api/v1/health'
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server only when NOT running on Vercel (Vercel uses the exported app)
if (!process.env.VERCEL) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🇮🇳 BhoomiSetu Backend Server running on http://localhost:${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/v1/health`);
      console.log(`👥 Demo Users API: http://localhost:${PORT}/api/v1/auth/demo-users`);
    });
  });
} else {
  // On Vercel, connect DB without starting a listener
  connectDB();
}

// Export for Vercel serverless
module.exports = app;
