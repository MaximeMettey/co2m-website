const express = require('express');
const router = express.Router();
const Database = require('better-sqlite3');
const path = require('path');
const authMiddleware = require('../middleware/auth');
const { adminLimiter } = require('../middleware/rate-limit');

const dbPath = path.join(__dirname, '../database/co2m.db');

// GET all content sections (public)
router.get('/', (req, res) => {
    try {
        const db = new Database(dbPath, { readonly: true });
        const sections = db.prepare('SELECT * FROM content_sections').all();
        db.close();

        res.json(sections);
    } catch (error) {
        console.error('Error fetching content sections:', error);
        res.status(500).json({ error: 'Failed to fetch content sections' });
    }
});

// GET specific section by key (public)
router.get('/:key', (req, res) => {
    try {
        const db = new Database(dbPath, { readonly: true });
        const section = db.prepare('SELECT * FROM content_sections WHERE section_key = ?').get(req.params.key);
        db.close();

        if (!section) {
            return res.status(404).json({ error: 'Section not found' });
        }

        res.json(section);
    } catch (error) {
        console.error('Error fetching content section:', error);
        res.status(500).json({ error: 'Failed to fetch content section' });
    }
});

// UPDATE content section (admin only)
router.put('/:key', authMiddleware, adminLimiter, (req, res) => {
    try {
        const { title, subtitle, content, metadata } = req.body;

        const db = new Database(dbPath);

        const result = db.prepare(`
            UPDATE content_sections
            SET title = ?, subtitle = ?, content = ?, metadata = ?, updated_at = CURRENT_TIMESTAMP
            WHERE section_key = ?
        `).run(title, subtitle, content, metadata, req.params.key);

        if (result.changes === 0) {
            db.close();
            return res.status(404).json({ error: 'Section not found' });
        }

        const updatedSection = db.prepare('SELECT * FROM content_sections WHERE section_key = ?').get(req.params.key);

        db.close();

        res.json(updatedSection);
    } catch (error) {
        console.error('Error updating content section:', error);
        res.status(500).json({ error: 'Failed to update content section' });
    }
});

module.exports = router;
