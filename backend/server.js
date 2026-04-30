const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { errorHandler } = require('./middleware/error.middleware');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const taskRoutes = require('./routes/task.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Task Manager API is running' });
});

// Serve Frontend in Production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  // Any route that is not an API route, serve the index.html
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../', 'frontend', 'dist', 'index.html'));
  });
}

// Global error handler (must be last)
app.use(errorHandler);

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

async function connectDB() {
  try {
    console.log('⏳ Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ MongoDB connected successfully');
    startServer();
  } catch (err) {
    console.error(`❌ Database connection failed: ${err.message}`);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔄 Spinning up in-memory MongoDB fallback...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      
      await mongoose.connect(mongoUri);
      console.log('✅ In-memory MongoDB connected successfully at', mongoUri);
      startServer();
    } else {
      console.error('🛑 Critical: Database connection failed in production. Exiting.');
      process.exit(1);
    }
  }
}

function startServer() {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

connectDB();

module.exports = app;
