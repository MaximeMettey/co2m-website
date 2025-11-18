const rateLimit = require('express-rate-limit');
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../database/co2m.db');

// Login rate limiter - strict limits to prevent brute force
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        error: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.',
        retryAfter: 15 * 60 // seconds
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Store failed attempts in database
    handler: (req, res) => {
        // Log the failed attempt
        try {
            const db = new Database(dbPath);
            const insertAttempt = db.prepare(`
                INSERT INTO login_attempts (ip_address, username, success)
                VALUES (?, ?, 0)
            `);
            insertAttempt.run(req.ip, req.body.username || 'unknown');
            db.close();
        } catch (error) {
            console.error('Error logging failed attempt:', error);
        }

        res.status(429).json({
            error: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.',
            retryAfter: 15 * 60
        });
    }
});

// API rate limiter - more permissive for general API calls
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // Limit each IP to 100 requests per minute
    message: {
        error: 'Trop de requêtes. Veuillez réessayer dans quelques instants.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Admin API rate limiter - moderate limits for admin operations
const adminLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // Limit each IP to 30 admin requests per minute
    message: {
        error: 'Trop de requêtes administrateur. Veuillez ralentir.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    loginLimiter,
    apiLimiter,
    adminLimiter
};
