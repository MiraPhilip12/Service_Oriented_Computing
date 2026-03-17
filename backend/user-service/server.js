const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('../shared/config/database');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
connectDB(process.env.MONGODB_URI);

// Routes
app.use('/api/users', require('./routes/userRoutes'));

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'user-service' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`User Service running on port ${PORT}`);
});