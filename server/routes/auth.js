const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');
const path = require('path');
const { loginLimiter } = require('../middleware/rate-limit');
const verifyHCaptcha = require('../middleware/hcaptcha');

const dbPath = path.join(__dirname, '../database/co2m.db');

// Login endpoint with brute force protection and hCaptcha
router.post('/login', loginLimiter, verifyHCaptcha, async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        const db = new Database(dbPath);

        // Get user from database
        const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

        if (!user) {
            // Log failed attempt
            db.prepare(`
                INSERT INTO login_attempts (ip_address, username, success)
                VALUES (?, ?, 0)
            `).run(req.ip, username);

            db.close();
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            // Log failed attempt
            db.prepare(`
                INSERT INTO login_attempts (ip_address, username, success)
                VALUES (?, ?, 0)
            `).run(req.ip, username);

            db.close();
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);

        // Log successful attempt
        db.prepare(`
            INSERT INTO login_attempts (ip_address, username, success)
            VALUES (?, ?, 1)
        `).run(req.ip, username);

        db.close();

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username
            },
            process.env.JWT_SECRET,
            { expiresIn: `${process.env.SESSION_TIMEOUT || 3600}s` }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            },
            expiresIn: parseInt(process.env.SESSION_TIMEOUT || 3600)
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Verify token endpoint
router.get('/verify', (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ valid: false });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        res.json({ valid: true, user: decoded });
    } catch (error) {
        res.status(401).json({ valid: false });
    }
});

// Change password endpoint (requires authentication)
router.post('/change-password', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new password required' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'New password must be at least 8 characters' });
        }

        const db = new Database(dbPath);

        // Get current user
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id);

        if (!user) {
            db.close();
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const validPassword = await bcrypt.compare(currentPassword, user.password_hash);

        if (!validPassword) {
            db.close();
            return res.status(401).json({ error: 'Invalid current password' });
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        // Update password
        db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newPasswordHash, user.id);

        db.close();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
