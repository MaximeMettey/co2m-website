// Homepage specific JavaScript - loads data from SQLite

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize database
    const initialized = await DB.init();
    if (!initialized) {
        console.error('Failed to initialize database');
        return;
    }

    // Load all content
    loadServices();
    loadProjects();
    loadStats();
    setupContactForm();
});

// ============================================
// Load Services from Database
// ============================================
function loadServices() {
    const services = DB.getActiveServices();
    const servicesGrid = document.getElementById('servicesGrid');

    if (!servicesGrid || services.length === 0) return;

    servicesGrid.innerHTML = services.map(service => {
        const features = service.features ? JSON.parse(service.features) : [];
        const featuresHTML = features.length > 0
            ? `<ul>${features.slice(0, 5).map(f => `<li>${f}</li>`).join('')}</ul>`
            : '';

        return `
            <div class="service-card fade-in">
                <div class="service-icon">${service.icon || '🌐'}</div>
                <h3>${service.title}</h3>
                <p>${service.short_description || ''}</p>
                ${featuresHTML}
            </div>
        `;
    }).join('');

    // Observe new cards for fade-in animation
    document.querySelectorAll('.service-card').forEach(card => {
        if (window.observer) {
            window.observer.observe(card);
        }
    });
}

// ============================================
// Load Projects from Database
// ============================================
function loadProjects() {
    const projects = DB.getActiveProjects();
    const portfolioGrid = document.getElementById('portfolioGrid');

    if (!portfolioGrid) return;

    if (projects.length === 0) {
        portfolioGrid.innerHTML = '<div class="portfolio-empty">Aucun projet disponible pour le moment. N\'hésitez pas à me contacter pour découvrir mes réalisations !</div>';
        return;
    }

    portfolioGrid.innerHTML = projects.map(project => {
        const tags = project.tags ? JSON.parse(project.tags) : [];
        const imageContent = project.image
            ? `<img src="${project.image}" alt="${project.title}">`
            : `<span>${project.icon || '🚀'}</span>`;

        return `
            <div class="portfolio-card fade-in">
                <div class="portfolio-image">
                    ${imageContent}
                </div>
                <div class="portfolio-content">
                    <h3>${project.title}</h3>
                    <p>${project.short_description || ''}</p>
                    <div class="portfolio-tags">
                        ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Observe new cards
    document.querySelectorAll('.portfolio-card').forEach(card => {
        if (window.observer) {
            window.observer.observe(card);
        }
    });
}

// ============================================
// Load Stats from Database
// ============================================
function loadStats() {
    const stats = DB.getActiveStats();
    const statsGrid = document.querySelector('.stats-grid');

    if (!statsGrid || stats.length === 0) return;

    statsGrid.innerHTML = stats.map(stat => `
        <div class="stat-item fade-in">
            <div class="stat-icon">${stat.icon || '📊'}</div>
            <span class="stat-number" data-target="${stat.value}">0</span>
            <div class="stat-label">${stat.label}${stat.unit ? '<br>' + stat.unit : ''}</div>
        </div>
    `).join('');

    // Re-observe stats for counter animation
    const counters = document.querySelectorAll('.stat-number');
    let countersActivated = false;

    const animateCounters = () => {
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.floor(current).toLocaleString('fr-FR');
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target.toLocaleString('fr-FR');
                }
            };

            updateCounter();
        });
    };

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !countersActivated) {
                countersActivated = true;
                animateCounters();
            }
        });
    }, { threshold: 0.5 });

    const statsSection = document.querySelector('.stats');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }
}

// ============================================
// Contact Form with FormSubmit
// ============================================
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    // Update form action to use FormSubmit
    const email = DB.getSetting('contact_email') || 'maxime@co2m.net';
    contactForm.action = `https://formsubmit.co/${email}`;
    contactForm.method = 'POST';

    // Add hidden fields for FormSubmit configuration
    const hiddenFields = `
        <input type="hidden" name="_subject" value="Nouveau message depuis CO2M">
        <input type="hidden" name="_captcha" value="false">
        <input type="hidden" name="_template" value="table">
        <input type="text" name="_honey" style="display:none">
    `;

    contactForm.insertAdjacentHTML('afterbegin', hiddenFields);
}
