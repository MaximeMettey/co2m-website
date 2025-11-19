const express = require('express');
const router = express.Router();
const Database = require('better-sqlite3');
const path = require('path');
const authMiddleware = require('../middleware/auth');
const { adminLimiter } = require('../middleware/rate-limit');

const dbPath = path.join(__dirname, '../database/co2m.db');

// GET all active stats (public)
router.get('/', (req, res) => {
    try {
        const db = new Database(dbPath, { readonly: true });
        const stats = db.prepare('SELECT * FROM stats WHERE is_active = 1 ORDER BY order_index ASC').all();
        db.close();

        res.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// GET all stats including inactive (admin only)
router.get('/all', authMiddleware, (req, res) => {
    try {
        const db = new Database(dbPath, { readonly: true });
        const stats = db.prepare('SELECT * FROM stats ORDER BY order_index ASC').all();
        db.close();

        res.json(stats);
    } catch (error) {
        console.error('Error fetching all stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// CRUD operations (admin only)
router.post('/', authMiddleware, adminLimiter, (req, res) => {
    try {
        const { icon, value, label, unit, order_index, is_active } = req.body;

        if (!value || !label) {
            return res.status(400).json({ error: 'Value and label are required' });
        }

        const db = new Database(dbPath);

        const result = db.prepare(`
            INSERT INTO stats (icon, value, label, unit, order_index, is_active)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(icon, value, label, unit, order_index || 0, is_active ? 1 : 0);

        const newStat = db.prepare('SELECT * FROM stats WHERE id = ?').get(result.lastInsertRowid);

        db.close();

        res.status(201).json(newStat);
    } catch (error) {
        console.error('Error creating stat:', error);
        res.status(500).json({ error: 'Failed to create stat' });
    }
});

router.put('/:id', authMiddleware, adminLimiter, (req, res) => {
    try {
        const { icon, value, label, unit, order_index, is_active } = req.body;

        const db = new Database(dbPath);

        const result = db.prepare(`
            UPDATE stats
            SET icon = ?, value = ?, label = ?, unit = ?, order_index = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(icon, value, label, unit, order_index, is_active ? 1 : 0, req.params.id);

        if (result.changes === 0) {
            db.close();
            return res.status(404).json({ error: 'Stat not found' });
        }

        const updatedStat = db.prepare('SELECT * FROM stats WHERE id = ?').get(req.params.id);

        db.close();

        res.json(updatedStat);
    } catch (error) {
        console.error('Error updating stat:', error);
        res.status(500).json({ error: 'Failed to update stat' });
    }
});

router.delete('/:id', authMiddleware, adminLimiter, (req, res) => {
    try {
        const db = new Database(dbPath);

        const result = db.prepare('DELETE FROM stats WHERE id = ?').run(req.params.id);

        db.close();

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Stat not found' });
        }

        res.json({ message: 'Stat deleted successfully' });
    } catch (error) {
        console.error('Error deleting stat:', error);
        res.status(500).json({ error: 'Failed to delete stat' });
    }
});

module.exports = router;
