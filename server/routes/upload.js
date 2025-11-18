const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../uploads/projects');

        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename: timestamp-randomstring-originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const nameWithoutExt = path.basename(file.originalname, ext);
        const safeName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        cb(null, safeName + '-' + uniqueSuffix + ext);
    }
});

// File filter - only images
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Type de fichier non supporté. Utilisez JPG, PNG, GIF ou WebP.'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    }
});

// Upload endpoint (protected - admin only)
router.post('/project-image', authMiddleware, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Aucun fichier uploadé' });
        }

        // Return the public URL path
        const imageUrl = `/uploads/projects/${req.file.filename}`;

        res.json({
            success: true,
            url: imageUrl,
            filename: req.file.filename
        });

        console.log(`✅ Image uploaded: ${imageUrl}`);
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Erreur lors de l\'upload' });
    }
});

// Delete image endpoint (protected - admin only)
router.delete('/project-image', authMiddleware, (req, res) => {
    try {
        const { filename } = req.body;

        if (!filename) {
            return res.status(400).json({ error: 'Nom de fichier manquant' });
        }

        const filePath = path.join(__dirname, '../../uploads/projects', path.basename(filename));

        // Check if file exists
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`🗑️  Image deleted: ${filename}`);
            res.json({ success: true, message: 'Image supprimée' });
        } else {
            res.status(404).json({ error: 'Fichier non trouvé' });
        }
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
});

module.exports = router;
