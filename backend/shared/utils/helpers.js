// Generate random order number
const generateOrderNumber = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `ORD-${timestamp}-${random}`.toUpperCase();
};

// Calculate delivery fee based on distance
const calculateDeliveryFee = (distance) => {
    const baseFee = 5.00;
    const perKmRate = 1.50;
    return baseFee + (distance * perKmRate);
};

// Format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
};

// Validate email format
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate phone number
const isValidPhone = (phone) => {
    const phoneRegex = /^\+?1?\d{9,15}$/;
    return phoneRegex.test(phone);
};

// Pagination helper
const getPagination = (page, limit, total) => {
    const currentPage = parseInt(page) || 1;
    const itemsPerPage = parseInt(limit) || 10;
    const totalPages = Math.ceil(total / itemsPerPage);
    const skip = (currentPage - 1) * itemsPerPage;

    return {
        currentPage,
        itemsPerPage,
        totalPages,
        skip,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1
    };
};

module.exports = {
    generateOrderNumber,
    calculateDeliveryFee,
    formatCurrency,
    isValidEmail,
    isValidPhone,
    getPagination
};