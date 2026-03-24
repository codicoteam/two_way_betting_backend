const crypto = require('crypto');

// Generate a random referral code
const generateReferralCode = (length = 8) => {
  return crypto.randomBytes(length).toString('hex').toUpperCase().slice(0, length);
};

// Calculate pagination offset
const getPagination = (page, limit) => {
  const offset = (page - 1) * limit;
  return { offset, limit };
};

// Extract file extension from base64 or filename
const getFileExtension = (filename) => {
  return filename.split('.').pop();
};

// Sleep utility (for testing or retry logic)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Convert object keys to camelCase (for API responses)
const toCamelCase = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }
  if (obj && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = toCamelCase(obj[key]);
      return acc;
    }, {});
  }
  return obj;
};

// Convert object keys to snake_case (for database)
const toSnakeCase = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  }
  if (obj && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      acc[snakeKey] = toSnakeCase(obj[key]);
      return acc;
    }, {});
  }
  return obj;
};

module.exports = {
  generateReferralCode,
  getPagination,
  getFileExtension,
  sleep,
  toCamelCase,
  toSnakeCase,
};