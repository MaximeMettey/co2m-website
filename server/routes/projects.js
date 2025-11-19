const express = require('express');
const router = express.Router();
const Database = require('better-sqlite3');
const path = require('path');
const authMiddleware = require('../middleware/auth');
const { adminLimiter } = require('../middleware/rate-limit');

const dbPath = path.join(__dirname, '../database/co2m.db');

// GET all active projects (public)
router.get('/', (req, res) => {
    try {
        const db = new Database(dbPath, { readonly: true });
        const projects = db.prepare('SELECT * FROM projects WHERE is_active = 1 ORDER BY order_index ASC').all();
        db.close();

        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// GET featured projects (public)
router.get('/featured', (req, res) => {
    try {
        const db = new Database(dbPath, { readonly: true });
        const projects = db.prepare('SELECT * FROM projects WHERE is_featured = 1 AND is_active = 1 ORDER BY order_index ASC').all();
        db.close();

        res.json(projects);
    } catch (error) {
        console.error('Error fetching featured projects:', error);
        res.status(500).json({ error: 'Failed to fetch featured projects' });
    }
});

// GET all projects including inactive (admin only)
router.get('/all', authMiddleware, (req, res) => {
    try {
        const db = new Database(dbPath, { readonly: true });
        const projects = db.prepare('SELECT * FROM projects ORDER BY order_index ASC').all();
        db.close();

        res.json(projects);
    } catch (error) {
        console.error('Error fetching all projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// GET single project by slug (public)
router.get('/:slug', (req, res) => {
    try {
        const db = new Database(dbPath, { readonly: true });
        const project = db.prepare('SELECT * FROM projects WHERE slug = ? AND is_active = 1').get(req.params.slug);
        db.close();

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json(project);
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});

// CREATE, UPDATE, DELETE routes (admin only) - similar to services
router.post('/', authMiddleware, adminLimiter, (req, res) => {
    try {
        const { title, slug, icon, image, short_description, full_description, tags, technologies, project_url, github_url, gallery, order_index, is_featured, is_active } = req.body;

        if (!title || !slug) {
            return res.status(400).json({ error: 'Title and slug are required' });
        }

        const db = new Database(dbPath);

        const result = db.prepare(`
            INSERT INTO projects (title, slug, icon, image, short_description, full_description, tags, technologies, project_url, github_url, gallery, order_index, is_featured, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(title, slug, icon, image, short_description, full_description, tags, technologies, project_url, github_url, gallery || '[]', order_index || 0, is_featured ? 1 : 0, is_active ? 1 : 0);

        const newProject = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);

        db.close();

        res.status(201).json(newProject);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

router.put('/:id', authMiddleware, adminLimiter, (req, res) => {
    try {
        const { title, slug, icon, image, short_description, full_description, tags, technologies, project_url, github_url, gallery, order_index, is_featured, is_active } = req.body;

        const db = new Database(dbPath);

        const result = db.prepare(`
            UPDATE projects
            SET title = ?, slug = ?, icon = ?, image = ?, short_description = ?, full_description = ?,
                tags = ?, technologies = ?, project_url = ?, github_url = ?, gallery = ?, order_index = ?, is_featured = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(title, slug, icon, image, short_description, full_description, tags, technologies, project_url, github_url, gallery || '[]', order_index, is_featured ? 1 : 0, is_active ? 1 : 0, req.params.id);

        if (result.changes === 0) {
            db.close();
            return res.status(404).json({ error: 'Project not found' });
        }

        const updatedProject = db.prepare('Select * FROM projects WHERE id = ?').get(req.params.id);

        db.close();

        res.json(updatedProject);
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Failed to update project' });
    }
});

router.delete('/:id', authMiddleware, adminLimiter, (req, res) => {
    try {
        const db = new Database(dbPath);

        const result = db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);

        db.close();

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

module.exports = router;
