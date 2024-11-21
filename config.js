module.exports = {
    JWT_SECRET: process.env.JWT_SECRET || 'your_secret_key', // Use an environment variable
    JWT_EXPIRES_IN: '1h' // Or whatever expiration you want
};