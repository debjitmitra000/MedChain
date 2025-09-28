// config/lighthouse.config.js
export const LIGHTHOUSE_CONFIG = {
  // API Configuration
  apiKey: import.meta.env.VITE_LIGHTHOUSE_API_KEY || 'your-lighthouse-api-key',
  gateway: 'https://gateway.lighthouse.storage/ipfs/',
  
  // File Upload Limits
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  
  // Image Compression Settings
  compression: {
    enabled: true,
    threshold: 1024 * 1024, // 1MB - compress files larger than this
    quality: 0.8,
    maxDimensions: 1024,
    outputFormat: 'image/jpeg'
  },
  
  // Retry Configuration
  retry: {
    maxAttempts: 3,
    baseDelay: 1000, // milliseconds
    maxDelay: 10000
  },
  
  // Cache Configuration
  cache: {
    enabled: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    maxSize: 100 // maximum number of cached items
  },
  
  // Progress Tracking
  progress: {
    updateInterval: 100, // milliseconds
    showCompressionProgress: true
  },
  
  // Error Messages
  errors: {
    fileSize: 'File size must be less than 5MB',
    fileType: 'Please select a valid image file (JPG, PNG, GIF, WebP)',
    upload: 'Upload failed. Please check your connection and try again.',
    apiKey: 'Lighthouse API key is not configured',
    network: 'Network error. Please check your internet connection.'
  },
  
  // Success Messages
  messages: {
    uploadSuccess: 'File uploaded successfully to IPFS!',
    compressionSuccess: 'Image compressed successfully',
    cacheHit: 'Using cached result for faster loading',
    retrySuccess: 'Upload successful after retry'
  },
  
  // Development Settings
  development: {
    enableLogging: process.env.NODE_ENV === 'development',
    enableVerboseProgress: false,
    mockUpload: false // Set to true to mock uploads during development
  }
};

// Validation helper
export const validateLighthouseConfig = () => {
  const issues = [];
  
  if (!LIGHTHOUSE_CONFIG.apiKey || LIGHTHOUSE_CONFIG.apiKey === 'your-lighthouse-api-key') {
    issues.push('Lighthouse API key is not configured');
  }
  
  if (LIGHTHOUSE_CONFIG.maxFileSize <= 0) {
    issues.push('Max file size must be greater than 0');
  }
  
  if (!LIGHTHOUSE_CONFIG.allowedTypes.length) {
    issues.push('No allowed file types configured');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
};

// Helper function to get file type validation
export const isValidFileType = (file) => {
  return LIGHTHOUSE_CONFIG.allowedTypes.includes(file.type);
};

// Helper function to check file size
export const isValidFileSize = (file) => {
  return file.size <= LIGHTHOUSE_CONFIG.maxFileSize;
};

// Helper function to format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default LIGHTHOUSE_CONFIG;