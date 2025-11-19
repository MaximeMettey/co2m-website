// Service Detail Page - loads service by slug from URL

document.addEventListener('DOMContentLoaded', async () => {
    // Get slug from URL - support both /services/:slug and /service.html?slug=:slug
    let slug = null;

    // Try to get from path (e.g., /services/web-development)
    const pathMatch = window.location.pathname.match(/\/services\/([^\/]+)/);
    if (pathMatch) {
        slug = pathMatch[1];
    } else {
        // Fallback to query parameter (e.g., /service.html?slug=web-development)
        const urlParams = new URLSearchParams(window.location.search);
        slug = urlParams.get('slug');
    }

    if (!slug) {
        showError();
        return;
    }

    await loadServiceDetail(slug);
});

async function loadServiceDetail(slug) {
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const serviceContent = document.getElementById('serviceContent');

    try {
        console.log(`Loading service: ${slug}`);
        const service = await API.getServiceBySlug(slug);

        // Update page metadata
        document.title = `${service.title} - CO2M`;
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', service.short_description || service.title);
        }

        // Hide loading, show content
        loadingState.style.display = 'none';
        serviceContent.style.display = 'block';

        // Populate content
        document.getElementById('breadcrumbTitle').textContent = service.title;
        document.getElementById('serviceIcon').textContent = service.icon || '🌐';
        document.getElementById('serviceTitle').textContent = service.title;
        document.getElementById('serviceShortDescription').textContent = service.short_description || '';

        // Full description - insert HTML directly from WYSIWYG editor
        const fullDescDiv = document.getElementById('serviceFullDescription');
        if (service.full_description) {
            fullDescDiv.innerHTML = service.full_description;
        } else {
            fullDescDiv.innerHTML = '<p>Aucune description disponible.</p>';
        }

        // Features list
        const featuresList = document.getElementById('serviceFeaturesList');
        const features = service.features ? JSON.parse(service.features) : [];

        if (features.length > 0) {
            featuresList.innerHTML = features.map(feature => `<li>${feature}</li>`).join('');
        } else {
            featuresList.innerHTML = '<li>Aucune fonctionnalité spécifiée.</li>';
        }

        // Observe new elements for fade-in animation
        document.querySelectorAll('.fade-in').forEach(el => {
            if (window.observer) {
                window.observer.observe(el);
            }
        });

        console.log('✅ Service loaded:', service.title);
    } catch (error) {
        console.error('Error loading service:', error);
        showError();
    }
}

function showError() {
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const serviceContent = document.getElementById('serviceContent');

    loadingState.style.display = 'none';
    errorState.style.display = 'block';
    serviceContent.style.display = 'none';
}
