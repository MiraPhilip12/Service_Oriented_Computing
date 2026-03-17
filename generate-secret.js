const crypto = require('crypto');

// Generate a 256-bit (32-byte) random secret
const secret = crypto.randomBytes(32).toString('hex');
console.log('Your JWT Secret:', secret);

// Generate an even stronger 512-bit secret
const strongSecret = crypto.randomBytes(64).toString('base64');
console.log('Strong JWT Secret (Base64):', strongSecret);

// Generate with special characters (URL-safe)
const urlSafeSecret = crypto.randomBytes(32).toString('base64url');
console.log('URL-safe JWT Secret:', urlSafeSecret);