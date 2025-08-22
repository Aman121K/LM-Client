const config = {
    development: {
        // BASE_URL: 'http://localhost:5000/api',
        // https://lm-server-ladl.onrender.com/
        
        BASE_URL: 'https://lm-server-ladl.onrender.com/api'
        // BASE_URL: 'https://lm-server-pmuo.onrender.com/api' Backup to tomorrow
    },
    production: {
        BASE_URL: 'https://lm-server-ladl.onrender.com/api' // Replace with your actual production URL
        // BASE_URL: 'https://lm-server-pmuo.onrender.com/api' Backup to tomorrow
    }
};


const env = process.env.NODE_ENV || 'development';


export const BASE_URL = config[env].BASE_URL;

export default config[env]; 
