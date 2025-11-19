const express = require('express');
const router = express.Router();
const Database = require('better-sqlite3');
const path = require('path');
const authMiddleware = require('../middleware/auth');
const { adminLimiter } = require('../middleware/rate-limit');

const dbPath = path.join(__dirname, '../database/co2m.db');

// GET all active services (public)
router.get('/', (req, res) => {
    try {
        const db = new Database(dbPath, { readonly: true });
        const services = db.prepare('SELECT * FROM services WHERE is_active = 1 ORDER BY order_index ASC').all();
        db.close();

        res.json(services);
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});

// GET all services including inactive (admin only)
router.get('/all', authMiddleware, (req, res) => {
    try {
        const db = new Database(dbPath, { readonly: true });
        const services = db.prepare('SELECT * FROM services ORDER BY order_index ASC').all();
        db.close();

        res.json(services);
    } catch (error) {
        console.error('Error fetching all services:', error);
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});

// GET single service by slug (public)
router.get('/:slug', (req, res) => {
    try {
        const db = new Database(dbPath, { readonly: true });
        const service = db.prepare('SELECT * FROM services WHERE slug = ? AND is_active = 1').get(req.params.slug);
        db.close();

        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }

        res.json(service);
    } catch (error) {
        console.error('Error fetching service:', error);
        res.status(500).json({ error: 'Failed to fetch service' });
    }
});

// CREATE service (admin only)
router.post('/', authMiddleware, adminLimiter, (req, res) => {
    try {
        const { title, slug, icon, short_description, full_description, features, order_index, is_active } = req.body;

        if (!title || !slug) {
            return res.status(400).json({ error: 'Title and slug are required' });
        }

        const db = new Database(dbPath);

        const result = db.prepare(`
            INSERT INTO services (title, slug, icon, short_description, full_description, features, order_index, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(title, slug, icon, short_description, full_description, features, order_index || 0, is_active ? 1 : 0);

        const newService = db.prepare('SELECT * FROM services WHERE id = ?').get(result.lastInsertRowid);

        db.close();

        res.status(201).json(newService);
    } catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({ error: 'Failed to create service' });
    }
});

// UPDATE service (admin only)
router.put('/:id', authMiddleware, adminLimiter, (req, res) => {
    try {
        const { title, slug, icon, short_description, full_description, features, order_index, is_active } = req.body;

        const db = new Database(dbPath);

        const result = db.prepare(`
            UPDATE services
            SET title = ?, slug = ?, icon = ?, short_description = ?, full_description = ?,
                features = ?, order_index = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(title, slug, icon, short_description, full_description, features, order_index, is_active ? 1 : 0, req.params.id);

        if (result.changes === 0) {
            db.close();
            return res.status(404).json({ error: 'Service not found' });
        }

        const updatedService = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);

        db.close();

        res.json(updatedService);
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({ error: 'Failed to update service' });
    }
});

// DELETE service (admin only)
router.delete('/:id', authMiddleware, adminLimiter, (req, res) => {
    try {
        const db = new Database(dbPath);

        const result = db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);

        db.close();

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Service not found' });
        }

        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ error: 'Failed to delete service' });
    }
});

module.exports = router;
