// API Configuration
const config = {
    // Development environment
    development: {
        // BASE_URL: 'http://localhost:5000/api',
        BASE_URL: 'https://lm-server-pmuo.onrender.com/api'
    },
    // Production environment
    production: {
        BASE_URL: 'https://lm-server-pmuo.onrender.com/api' // Replace with your actual production URL
    }
};

// Get the current environment
const env = process.env.NODE_ENV || 'development';

// Export the configuration for the current environment
export const BASE_URL = config[env].BASE_URL;

export default config[env]; 