// Homepage - loads data from API

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Loading homepage content from API...');

    // Load all content
    await Promise.all([
        loadServices(),
        loadProjects(),
        loadStats()
    ]);

    setupContactForm();
});

// ============================================
// Load Services from API
// ============================================
async function loadServices() {
    try {
        const services = await API.getServices();
        const servicesGrid = document.getElementById('servicesGrid');

        if (!servicesGrid) return;

        if (services.length === 0) {
            servicesGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Aucun service disponible.</p>';
            return;
        }

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

        console.log(`✅ ${services.length} services loaded`);
    } catch (error) {
        console.error('Error loading services:', error);
        const servicesGrid = document.getElementById('servicesGrid');
        if (servicesGrid) {
            servicesGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Erreur lors du chargement des services.</p>';
        }
    }
}

// ============================================
// Load Projects from API
// ============================================
async function loadProjects() {
    try {
        const projects = await API.getProjects();
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

        console.log(`✅ ${projects.length} projects loaded`);
    } catch (error) {
        console.error('Error loading projects:', error);
        const portfolioGrid = document.getElementById('portfolioGrid');
        if (portfolioGrid) {
            portfolioGrid.innerHTML = '<div class="portfolio-empty">Erreur lors du chargement des projets.</div>';
        }
    }
}

// ============================================
// Load Stats from API
// ============================================
async function loadStats() {
    try {
        const stats = await API.getStats();
        const statsGrid = document.querySelector('.stats-grid');

        if (!statsGrid) return;

        if (stats.length === 0) {
            statsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Aucune statistique disponible.</p>';
            return;
        }

        statsGrid.innerHTML = stats.map(stat => `
            <div class="stat-item fade-in">
                <div class="stat-icon">${stat.icon || '📊'}</div>
                <span class="stat-number" data-target="${stat.value}">0</span>
                <div class="stat-label">${stat.label}${stat.unit ? '<br>' + stat.unit : ''}</div>
            </div>
        `).join('');

        // Observe stat items for fade-in animation
        document.querySelectorAll('.stat-item').forEach(item => {
            if (window.observer) {
                window.observer.observe(item);
            }
        });

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

        console.log(`✅ ${stats.length} stats loaded`);
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// ============================================
// Contact Form with FormSubmit
// ============================================
async function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    // Load email setting from API
    try {
        const setting = await API.getSetting('contact_email');
        const email = setting.value || 'maxime@co2m.net';
        contactForm.action = `https://formsubmit.co/${email}`;
    } catch (error) {
        contactForm.action = 'https://formsubmit.co/maxime@co2m.net';
    }

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
