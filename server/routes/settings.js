const express = require('express');
const router = express.Router();
const Database = require('better-sqlite3');
const path = require('path');
const authMiddleware = require('../middleware/auth');
const { adminLimiter } = require('../middleware/rate-limit');

const dbPath = path.join(__dirname, '../database/co2m.db');

// GET all settings (public - can filter by category)
router.get('/', (req, res) => {
    try {
        const { category } = req.query;

        const db = new Database(dbPath, { readonly: true });

        let settings;
        if (category) {
            settings = db.prepare('SELECT * FROM settings WHERE category = ?').all(category);
        } else {
            settings = db.prepare('SELECT * FROM settings').all();
        }

        db.close();

        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// GET specific setting by key (public)
router.get('/:key', (req, res) => {
    try {
        const db = new Database(dbPath, { readonly: true });
        const setting = db.prepare('SELECT * FROM settings WHERE key = ?').get(req.params.key);
        db.close();

        if (!setting) {
            return res.status(404).json({ error: 'Setting not found' });
        }

        res.json(setting);
    } catch (error) {
        console.error('Error fetching setting:', error);
        res.status(500).json({ error: 'Failed to fetch setting' });
    }
});

// UPDATE setting (admin only)
router.put('/:key', authMiddleware, adminLimiter, (req, res) => {
    try {
        const { value } = req.body;

        if (value === undefined) {
            return res.status(400).json({ error: 'Value is required' });
        }

        const db = new Database(dbPath);

        const result = db.prepare(`
            UPDATE settings
            SET value = ?, updated_at = CURRENT_TIMESTAMP
            WHERE key = ?
        `).run(value, req.params.key);

        if (result.changes === 0) {
            db.close();
            return res.status(404).json({ error: 'Setting not found' });
        }

        const updatedSetting = db.prepare('SELECT * FROM settings WHERE key = ?').get(req.params.key);

        db.close();

        res.json(updatedSetting);
    } catch (error) {
        console.error('Error updating setting:', error);
        res.status(500).json({ error: 'Failed to update setting' });
    }
});

// UPDATE multiple settings at once (admin only)
router.post('/bulk', authMiddleware, adminLimiter, (req, res) => {
    try {
        const { settings } = req.body;

        if (!Array.isArray(settings)) {
            return res.status(400).json({ error: 'Settings must be an array' });
        }

        const db = new Database(dbPath);

        const updateStmt = db.prepare(`
            UPDATE settings
            SET value = ?, updated_at = CURRENT_TIMESTAMP
            WHERE key = ?
        `);

        const transaction = db.transaction((settingsToUpdate) => {
            for (const setting of settingsToUpdate) {
                updateStmt.run(setting.value, setting.key);
            }
        });

        transaction(settings);

        db.close();

        res.json({ message: 'Settings updated successfully', count: settings.length });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

module.exports = router;
