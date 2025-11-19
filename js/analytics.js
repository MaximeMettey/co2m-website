// ============================================
// Google Analytics Integration
// ============================================

(async function initAnalytics() {
    try {
        // Fetch public config to get GA measurement ID
        const response = await fetch('/api/config/public');
        const config = await response.json();

        const gaId = config.analytics?.gaId;

        // Only load Google Analytics if measurement ID is configured
        if (!gaId) {
            console.log('ℹ️ Google Analytics is not configured');
            return;
        }

        console.log('📊 Loading Google Analytics...');

        // Load Google Analytics script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(script);

        // Initialize Google Analytics
        window.dataLayer = window.dataLayer || [];
        function gtag() {
            dataLayer.push(arguments);
        }
        window.gtag = gtag;

        gtag('js', new Date());
        gtag('config', gaId, {
            'anonymize_ip': true, // Anonymize IP addresses (GDPR compliance)
            'cookie_flags': 'SameSite=None;Secure', // Secure cookies
            'cookie_expires': 63072000, // 2 years in seconds
        });

        console.log('✅ Google Analytics loaded');

    } catch (error) {
        console.error('Error loading analytics:', error);
    }
})();
