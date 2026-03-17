const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Route to different services
app.use('/api/users', createProxyMiddleware({ 
    target: 'http://localhost:3001', 
    changeOrigin: true 
}));

app.use('/api/restaurants', createProxyMiddleware({ 
    target: 'http://localhost:3002', 
    changeOrigin: true 
}));

app.use('/api/orders', createProxyMiddleware({ 
    target: 'http://localhost:3003', 
    changeOrigin: true 
}));

app.use('/api/delivery', createProxyMiddleware({ 
    target: 'http://localhost:3004', 
    changeOrigin: true 
}));

app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'API Gateway is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});