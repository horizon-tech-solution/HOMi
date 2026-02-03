export const formatPrice = (price) => {
  if (!price) return '0 XAF';
  return new Intl.NumberFormat('fr-FR').format(price) + ' XAF';
};

export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
};

export const truncate = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
};

export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidPhone = (phone) => {
  const cleaned = phone.replace(/\s/g, '');
  return /^(237)?[0-9]{9}$/.test(cleaned);
};

export const formatPhone = (phone) => {
  const cleaned = phone.replace(/\s/g, '');
  if (cleaned.startsWith('237')) return `+${cleaned}`;
  return `+237${cleaned}`;
};

export const isValidPassword = (password) => {
  return password.length >= 8;
};

export const slugify = (text) => {
  return text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const isValidImage = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  const maxSize = 10 * 1024 * 1024;
  return validTypes.includes(file.type) && file.size <= maxSize;
};