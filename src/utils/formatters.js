// Format currency (USD)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Format date (e.g., "Jan 1, 2025")
const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

// Format time (e.g., "18:30")
const formatTime = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

// Format datetime (e.g., "Jan 1, 2025 18:30")
const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

// Truncate text with ellipsis
const truncate = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Calculate win rate percentage
const winRate = (wins, totalBets) => {
  if (totalBets === 0) return 0;
  return ((wins / totalBets) * 100).toFixed(1);
};

module.exports = {
  formatCurrency,
  formatDate,
  formatTime,
  formatDateTime,
  truncate,
  winRate,
};