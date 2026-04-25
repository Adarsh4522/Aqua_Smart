require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const deviceRoutes = require('./routes/devices');
const usageRoutes = require('./routes/usage');
const goalRoutes = require('./routes/goals');
const tipRoutes = require('./routes/tips');
const adminRoutes = require('./routes/admin');

// Initialize app & DB
const app = express();
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/usage', usageRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/tips', tipRoutes);
app.use('/api/admin', adminRoutes);

// Health Check Root
app.get('/', (req, res) => {
  res.json({ message: 'Smart Water API is running 💧' });
});

// Fallback 404
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'API Route Not Found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
