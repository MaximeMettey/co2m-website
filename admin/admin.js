// Initialize database and admin panel
let currentEditingServiceId = null;
let currentEditingProjectId = null;
let currentEditingStatId = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing admin panel...');

    // Initialize database
    const initialized = await DB.init();
    if (!initialized) {
        alert('Erreur lors de l\'initialisation de la base de données !');
        return;
    }

    // Load all data
    loadDashboard();
    loadServices();
    loadProjects();
    loadStats();
    loadSettings();

    // Setup navigation
    setupNavigation();

    // Setup database import
    setupDatabaseImport();

    console.log('Admin panel initialized!');
});

// Navigation
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            showSection(section);

            // Update active state
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    const section = document.getElementById(sectionName);
    if (section) {
        section.classList.add('active');
    }

    // Update nav
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.classList.remove('active');
        if (nav.dataset.section === sectionName) {
            nav.classList.add('active');
        }
    });

    // Reload data if needed
    if (sectionName === 'dashboard') loadDashboard();
    if (sectionName === 'services') loadServices();
    if (sectionName === 'projects') loadProjects();
    if (sectionName === 'stats') loadStats();
    if (sectionName === 'settings') loadSettings();
}

// ============================================
// DASHBOARD
// ============================================
function loadDashboard() {
    const services = DB.getAll('services');
    const projects = DB.getAll('projects');
    const stats = DB.getAll('stats');

    document.getElementById('totalServices').textContent = services.length;
    document.getElementById('totalProjects').textContent = projects.length;
    document.getElementById('totalStats').textContent = stats.length;

    // Calculate database size
    const dbData = localStorage.getItem('co2m_database');
    const sizeKB = dbData ? (dbData.length / 1024).toFixed(2) : 0;
    document.getElementById('dbSize').textContent = `${sizeKB} KB`;
}

// ============================================
// SERVICES
// ============================================
function loadServices() {
    const services = DB.getAll('services');
    const tbody = document.getElementById('servicesTable');

    if (services.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">Aucun service</td></tr>';
        return;
    }

    tbody.innerHTML = services.map(service => `
        <tr>
            <td style="font-size: 2rem">${service.icon || '🌐'}</td>
            <td><strong>${service.title}</strong></td>
            <td><code>${service.slug}</code></td>
            <td>
                <span class="badge ${service.is_active ? 'badge-success' : 'badge-danger'}">
                    ${service.is_active ? '✓ Actif' : '✗ Inactif'}
                </span>
            </td>
            <td class="action-btns">
                <button class="btn btn-sm btn-primary" onclick="editService(${service.id})">✏️ Modifier</button>
                <button class="btn btn-sm btn-danger" onclick="deleteService(${service.id})">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function openServiceModal(id = null) {
    const modal = document.getElementById('serviceModal');
    const form = document.getElementById('serviceForm');
    form.reset();

    if (id) {
        const service = DB.getOne('services', 'id = ?', [id]);
        if (service) {
            document.getElementById('serviceModalTitle').textContent = 'Modifier le service';
            document.getElementById('service_id').value = service.id;
            document.getElementById('service_title').value = service.title;
            document.getElementById('service_slug').value = service.slug;
            document.getElementById('service_icon').value = service.icon || '';
            document.getElementById('service_short_description').value = service.short_description || '';
            document.getElementById('service_full_description').value = service.full_description || '';

            const features = service.features ? JSON.parse(service.features) : [];
            document.getElementById('service_features').value = features.join('\n');

            document.getElementById('service_order_index').value = service.order_index || 0;
            document.getElementById('service_is_active').checked = service.is_active == 1;
        }
    } else {
        document.getElementById('serviceModalTitle').textContent = 'Nouveau service';
        document.getElementById('service_id').value = '';
    }

    modal.classList.add('active');
}

function closeServiceModal() {
    document.getElementById('serviceModal').classList.remove('active');
}

function editService(id) {
    openServiceModal(id);
}

function saveService(event) {
    event.preventDefault();

    const id = document.getElementById('service_id').value;
    const data = {
        title: document.getElementById('service_title').value,
        slug: document.getElementById('service_slug').value,
        icon: document.getElementById('service_icon').value,
        short_description: document.getElementById('service_short_description').value,
        full_description: document.getElementById('service_full_description').value,
        features: JSON.stringify(
            document.getElementById('service_features').value
                .split('\n')
                .filter(f => f.trim())
        ),
        order_index: parseInt(document.getElementById('service_order_index').value),
        is_active: document.getElementById('service_is_active').checked ? 1 : 0
    };

    try {
        if (id) {
            DB.update('services', data, 'id = ?', [id]);
        } else {
            DB.insert('services', data);
        }

        closeServiceModal();
        loadServices();
        loadDashboard();
        alert('Service enregistré !');
    } catch (error) {
        alert('Erreur : ' + error.message);
    }
}

function deleteService(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) return;

    DB.delete('services', 'id = ?', [id]);
    loadServices();
    loadDashboard();
}

// ============================================
// PROJECTS
// ============================================
function loadProjects() {
    const projects = DB.getAll('projects');
    const tbody = document.getElementById('projectsTable');

    if (projects.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">Aucun projet</td></tr>';
        return;
    }

    tbody.innerHTML = projects.map(project => `
        <tr>
            <td style="font-size: 2rem">${project.icon || '🚀'}</td>
            <td><strong>${project.title}</strong></td>
            <td><code>${project.slug}</code></td>
            <td>
                <span class="badge ${project.is_featured ? 'badge-success' : 'badge-danger'}">
                    ${project.is_featured ? '⭐ Oui' : '✗ Non'}
                </span>
            </td>
            <td>
                <span class="badge ${project.is_active ? 'badge-success' : 'badge-danger'}">
                    ${project.is_active ? '✓ Actif' : '✗ Inactif'}
                </span>
            </td>
            <td class="action-btns">
                <button class="btn btn-sm btn-primary" onclick="editProject(${project.id})">✏️ Modifier</button>
                <button class="btn btn-sm btn-danger" onclick="deleteProject(${project.id})">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function openProjectModal(id = null) {
    const modal = document.getElementById('projectModal');
    const form = document.getElementById('projectForm');
    form.reset();

    if (id) {
        const project = DB.getOne('projects', 'id = ?', [id]);
        if (project) {
            document.getElementById('projectModalTitle').textContent = 'Modifier le projet';
            document.getElementById('project_id').value = project.id;
            document.getElementById('project_title').value = project.title;
            document.getElementById('project_slug').value = project.slug;
            document.getElementById('project_icon').value = project.icon || '';
            document.getElementById('project_image').value = project.image || '';
            document.getElementById('project_short_description').value = project.short_description || '';
            document.getElementById('project_full_description').value = project.full_description || '';

            const tags = project.tags ? JSON.parse(project.tags) : [];
            document.getElementById('project_tags').value = tags.join(', ');

            const technologies = project.technologies ? JSON.parse(project.technologies) : [];
            document.getElementById('project_technologies').value = technologies.join(', ');

            document.getElementById('project_project_url').value = project.project_url || '';
            document.getElementById('project_github_url').value = project.github_url || '';
            document.getElementById('project_order_index').value = project.order_index || 0;
            document.getElementById('project_is_featured').checked = project.is_featured == 1;
            document.getElementById('project_is_active').checked = project.is_active == 1;
        }
    } else {
        document.getElementById('projectModalTitle').textContent = 'Nouveau projet';
        document.getElementById('project_id').value = '';
    }

    modal.classList.add('active');
}

function closeProjectModal() {
    document.getElementById('projectModal').classList.remove('active');
}

function editProject(id) {
    openProjectModal(id);
}

function saveProject(event) {
    event.preventDefault();

    const id = document.getElementById('project_id').value;
    const data = {
        title: document.getElementById('project_title').value,
        slug: document.getElementById('project_slug').value,
        icon: document.getElementById('project_icon').value,
        image: document.getElementById('project_image').value,
        short_description: document.getElementById('project_short_description').value,
        full_description: document.getElementById('project_full_description').value,
        tags: JSON.stringify(
            document.getElementById('project_tags').value
                .split(',')
                .map(t => t.trim())
                .filter(t => t)
        ),
        technologies: JSON.stringify(
            document.getElementById('project_technologies').value
                .split(',')
                .map(t => t.trim())
                .filter(t => t)
        ),
        project_url: document.getElementById('project_project_url').value,
        github_url: document.getElementById('project_github_url').value,
        order_index: parseInt(document.getElementById('project_order_index').value),
        is_featured: document.getElementById('project_is_featured').checked ? 1 : 0,
        is_active: document.getElementById('project_is_active').checked ? 1 : 0
    };

    try {
        if (id) {
            DB.update('projects', data, 'id = ?', [id]);
        } else {
            DB.insert('projects', data);
        }

        closeProjectModal();
        loadProjects();
        loadDashboard();
        alert('Projet enregistré !');
    } catch (error) {
        alert('Erreur : ' + error.message);
    }
}

function deleteProject(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) return;

    DB.delete('projects', 'id = ?', [id]);
    loadProjects();
    loadDashboard();
}

// ============================================
// STATS
// ============================================
function loadStats() {
    const stats = DB.getAll('stats');
    const tbody = document.getElementById('statsTable');

    if (stats.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">Aucune statistique</td></tr>';
        return;
    }

    tbody.innerHTML = stats.map(stat => `
        <tr>
            <td style="font-size: 2rem">${stat.icon || '📊'}</td>
            <td><strong>${stat.value}${stat.unit || ''}</strong></td>
            <td>${stat.label}</td>
            <td>
                <span class="badge ${stat.is_active ? 'badge-success' : 'badge-danger'}">
                    ${stat.is_active ? '✓ Actif' : '✗ Inactif'}
                </span>
            </td>
            <td class="action-btns">
                <button class="btn btn-sm btn-primary" onclick="editStat(${stat.id})">✏️ Modifier</button>
                <button class="btn btn-sm btn-danger" onclick="deleteStat(${stat.id})">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function openStatModal(id = null) {
    const modal = document.getElementById('statModal');
    const form = document.getElementById('statForm');
    form.reset();

    if (id) {
        const stat = DB.getOne('stats', 'id = ?', [id]);
        if (stat) {
            document.getElementById('statModalTitle').textContent = 'Modifier la statistique';
            document.getElementById('stat_id').value = stat.id;
            document.getElementById('stat_icon').value = stat.icon || '';
            document.getElementById('stat_value').value = stat.value;
            document.getElementById('stat_label').value = stat.label;
            document.getElementById('stat_unit').value = stat.unit || '';
            document.getElementById('stat_order_index').value = stat.order_index || 0;
            document.getElementById('stat_is_active').checked = stat.is_active == 1;
        }
    } else {
        document.getElementById('statModalTitle').textContent = 'Nouvelle statistique';
        document.getElementById('stat_id').value = '';
    }

    modal.classList.add('active');
}

function closeStatModal() {
    document.getElementById('statModal').classList.remove('active');
}

function editStat(id) {
    openStatModal(id);
}

function saveStat(event) {
    event.preventDefault();

    const id = document.getElementById('stat_id').value;
    const data = {
        icon: document.getElementById('stat_icon').value,
        value: parseInt(document.getElementById('stat_value').value),
        label: document.getElementById('stat_label').value,
        unit: document.getElementById('stat_unit').value,
        order_index: parseInt(document.getElementById('stat_order_index').value),
        is_active: document.getElementById('stat_is_active').checked ? 1 : 0
    };

    try {
        if (id) {
            DB.update('stats', data, 'id = ?', [id]);
        } else {
            DB.insert('stats', data);
        }

        closeStatModal();
        loadStats();
        loadDashboard();
        alert('Statistique enregistrée !');
    } catch (error) {
        alert('Erreur : ' + error.message);
    }
}

function deleteStat(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette statistique ?')) return;

    DB.delete('stats', 'id = ?', [id]);
    loadStats();
    loadDashboard();
}

// ============================================
// SETTINGS
// ============================================
function loadSettings() {
    const settingKeys = [
        'site_title', 'site_tagline', 'contact_email', 'contact_phone',
        'contact_location', 'social_linkedin', 'social_github',
        'social_twitter', 'social_instagram'
    ];

    settingKeys.forEach(key => {
        const value = DB.getSetting(key);
        const input = document.getElementById(`setting_${key}`);
        if (input && value) {
            input.value = value;
        }
    });
}

function saveSettings() {
    const settingKeys = [
        'site_title', 'site_tagline', 'contact_email', 'contact_phone',
        'contact_location', 'social_linkedin', 'social_github',
        'social_twitter', 'social_instagram'
    ];

    try {
        settingKeys.forEach(key => {
            const input = document.getElementById(`setting_${key}`);
            if (input) {
                DB.updateSetting(key, input.value);
            }
        });

        alert('Paramètres enregistrés !');
    } catch (error) {
        alert('Erreur : ' + error.message);
    }
}

// ============================================
// DATABASE MANAGEMENT
// ============================================
function exportDatabase() {
    DB.exportToFile();
    alert('Base de données exportée !');
}

function setupDatabaseImport() {
    const fileInput = document.getElementById('dbFileInput');

    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!confirm('Attention : Cette action va remplacer toute votre base de données actuelle. Continuer ?')) {
            fileInput.value = '';
            return;
        }

        try {
            await DB.importFromFile(file);
            alert('Base de données importée avec succès ! La page va se recharger.');
            location.reload();
        } catch (error) {
            alert('Erreur lors de l\'import : ' + error.message);
        }

        fileInput.value = '';
    });
}

function resetDatabase() {
    if (!confirm('⚠️ ATTENTION : Cette action va supprimer toutes vos données et recréer la base avec les données d\'exemple. Cette action est IRRÉVERSIBLE. Continuer ?')) {
        return;
    }

    if (!confirm('Êtes-vous VRAIMENT sûr ? Toutes vos données seront perdues !')) {
        return;
    }

    try {
        // Clear localStorage
        localStorage.removeItem('co2m_database');

        // Reload page to reinitialize
        alert('Base de données réinitialisée ! La page va se recharger.');
        location.reload();
    } catch (error) {
        alert('Erreur lors de la réinitialisation : ' + error.message);
    }
}
