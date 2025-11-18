const axios = require('axios');

const verifyHCaptcha = async (req, res, next) => {
    try {
        const { hcaptchaToken } = req.body;

        if (!hcaptchaToken) {
            return res.status(400).json({ error: 'hCaptcha token required' });
        }

        // Verify the token with hCaptcha API
        const response = await axios.post(
            'https://hcaptcha.com/siteverify',
            new URLSearchParams({
                secret: process.env.HCAPTCHA_SECRET,
                response: hcaptchaToken,
                remoteip: req.ip
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        if (!response.data.success) {
            return res.status(400).json({
                error: 'Échec de la vérification hCaptcha',
                details: response.data['error-codes']
            });
        }

        // hCaptcha verified successfully
        next();
    } catch (error) {
        console.error('hCaptcha verification error:', error);
        return res.status(500).json({ error: 'Erreur lors de la vérification hCaptcha' });
    }
};

module.exports = verifyHCaptcha;
