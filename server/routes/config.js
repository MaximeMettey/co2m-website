const express = require('express');
const router = express.Router();

/**
 * GET /api/config/public
 * Returns public configuration (sitekey for hCaptcha, etc.)
 * This endpoint is public and doesn't require authentication
 */
router.get('/public', (req, res) => {
    try {
        const publicConfig = {
            hcaptcha: {
                sitekey: process.env.HCAPTCHA_SITEKEY || '10000000-ffff-ffff-ffff-000000000001'
            },
            analytics: {
                gaId: process.env.GA_MEASUREMENT_ID || null
            },
            environment: process.env.NODE_ENV || 'development'
        };

        res.json(publicConfig);
    } catch (error) {
        console.error('Error getting public config:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération de la configuration' });
    }
});

module.exports = router;
