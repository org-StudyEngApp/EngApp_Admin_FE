// // Configuration file for the application

// // API Base URL - adjust this to your backend API endpoint
// export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// // Other global configuration constants can be added here
// export const APP_NAME = 'KoraStudy Admin';
// export const APP_VERSION = '1.0.0';

// src/config.js (Updated for Vite)

// API Base URL - use import.meta.env to access VITE_ variables
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

// Other environment variables (example)
export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
export const TINYMCE_API_KEY = import.meta.env.VITE_TINYMCE_API_KEY;

// Other global configuration constants
export const APP_NAME = 'KoraStudy Admin';
export const APP_VERSION = '1.0.0';