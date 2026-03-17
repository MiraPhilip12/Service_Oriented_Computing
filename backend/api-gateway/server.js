// backend/api-gateway/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const Redis = require('ioredis');
const CircuitBreaker = require('opossum');

const app = express();

// Redis client for rate limiting
const redis = new Redis({
    host: 'localhost',
    port: 6379,
});

// Circuit breaker options
const breakerOptions = {
    timeout: 3000, // If service takes >3s, trigger failure
    errorThresholdPercentage: 50, // When 50% of requests fail, open circuit
    resetTimeout: 30000 // After 30s, try again
};

// Service configurations
const services = {
    user: { url: 'http://localhost:3001', maxRequests: 100 },
    restaurant: { url: 'http://localhost:3002', maxRequests: 100 },
    order: { url: 'http://localhost:3003', maxRequests: 50 },
    delivery: { url: 'http://localhost:3004', maxRequests: 50 }
};

// Create circuit breakers for each service
const breakers = {};
Object.keys(services).forEach(key => {
    breakers[key] = new CircuitBreaker(async (req, res, next) => {
        // This will be handled by the proxy
        return new Promise((resolve, reject) => {
            next();
            resolve();
        });
    }, breakerOptions);
    
    breakers[key].fallback((req, res) => {
        res.status(503).json({ 
            message: `Service ${key} is currently unavailable. Please try again later.` 
        });
    });
});

// Rate limiting function
const createRateLimiter = (maxRequests) => {
    return rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: maxRequests,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => {
            return req.ip || req.connection.remoteAddress;
        },
        handler: (req, res) => {
            res.status(429).json({
                message: 'Too many requests, please try again later.'
            });
        }
    });
};

// Middleware
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true
}));
app.use(express.json());

// Global rate limiting
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: 'Too many requests from this IP'
}));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Service proxies with circuit breakers
app.use('/api/auth', createRateLimiter(services.user.maxRequests), (req, res, next) => {
    breakers.user.fire(req, res, () => {
        createProxyMiddleware({
            target: services.user.url,
            changeOrigin: true,
            pathRewrite: { '^/api/auth': '/api/auth' },
            onError: (err, req, res) => {
                console.error('User service error:', err);
                res.status(503).json({ message: 'User service unavailable' });
            }
        })(req, res, next);
    });
});

app.use('/api/restaurants', createRateLimiter(services.restaurant.maxRequests), (req, res, next) => {
    breakers.restaurant.fire(req, res, () => {
        createProxyMiddleware({
            target: services.restaurant.url,
            changeOrigin: true,
            pathRewrite: { '^/api/restaurants': '/api/restaurants' },
            onError: (err, req, res) => {
                console.error('Restaurant service error:', err);
                res.status(503).json({ message: 'Restaurant service unavailable' });
            }
        })(req, res, next);
    });
});

app.use('/api/orders', createRateLimiter(services.order.maxRequests), (req, res, next) => {
    breakers.order.fire(req, res, () => {
        createProxyMiddleware({
            target: services.order.url,
            changeOrigin: true,
            pathRewrite: { '^/api/orders': '/api/orders' },
            onError: (err, req, res) => {
                console.error('Order service error:', err);
                res.status(503).json({ message: 'Order service unavailable' });
            }
        })(req, res, next);
    });
});

app.use('/api/delivery', createRateLimiter(services.delivery.maxRequests), (req, res, next) => {
    breakers.delivery.fire(req, res, () => {
        createProxyMiddleware({
            target: services.delivery.url,
            changeOrigin: true,
            pathRewrite: { '^/api/delivery': '/api/delivery' },
            onError: (err, req, res) => {
                console.error('Delivery service error:', err);
                res.status(503).json({ message: 'Delivery service unavailable' });
            }
        })(req, res, next);
    });
});

// Health check endpoint
app.get('/health', async (req, res) => {
    const healthStatus = {};
    
    for (const [key, service] of Object.entries(services)) {
        try {
            const response = await fetch(`${service.url}/health`);
            healthStatus[key] = response.ok ? 'healthy' : 'unhealthy';
        } catch (error) {
            healthStatus[key] = 'down';
        }
    }
    
    res.json({
        gateway: 'healthy',
        timestamp: new Date().toISOString(),
        services: healthStatus
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
    console.log('Available routes:');
    console.log('- /api/auth -> User Service (port 3001)');
    console.log('- /api/restaurants -> Restaurant Service (port 3002)');
    console.log('- /api/orders -> Order Service (port 3003)');
    console.log('- /api/delivery -> Delivery Service (port 3004)');
});