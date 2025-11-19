// CO2M Admin Panel - REST API Version
let currentEditingServiceId = null;
let currentEditingProjectId = null;
let currentEditingStatId = null;

// Quill editors instances
let serviceDescriptionEditor = null;
let projectDescriptionEditor = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing admin panel...');

    // Initialize Quill editors
    initQuillEditors();

    // Check authentication
    const token = localStorage.getItem('admin_token');
    if (!token) {
        console.log('No token found, redirecting to login...');
        window.location.href = '/admin/login.html';
        return;
    }

    // Verify token is still valid
    try {
        const result = await API.verifyToken();
        if (!result.valid) {
            console.log('Token invalid, redirecting to login...');
            window.location.href = '/admin/login.html';
            return;
        }
    } catch (error) {
        console.error('Token verification failed:', error);
        window.location.href = '/admin/login.html';
        return;
    }

    // Load all data
    try {
        await loadDashboard();
        await loadServices();
        await loadProjects();
        await loadStats();
        await loadSettings();

        // Setup navigation
        setupNavigation();

        // Setup logout button
        setupLogout();

        console.log('Admin panel initialized!');
    } catch (error) {
        console.error('Error initializing admin panel:', error);
        showError('Erreur lors du chargement des données');
    }
});

// Setup logout functionality
function setupLogout() {
    // Add logout button if not exists
    const sidebarFooter = document.querySelector('.sidebar-footer');
    if (sidebarFooter && !document.getElementById('logoutBtn')) {
        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'logoutBtn';
        logoutBtn.className = 'btn btn-danger';
        logoutBtn.textContent = '🚪 Déconnexion';
        logoutBtn.style.width = '100%';
        logoutBtn.style.marginTop = '1rem';
        logoutBtn.onclick = logout;
        sidebarFooter.appendChild(logoutBtn);
    }
}

function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        API.logout();
        window.location.href = '/admin/login.html';
    }
}

// Initialize Quill WYSIWYG editors
function initQuillEditors() {
    // Quill toolbar configuration (no image for services)
    const serviceToolbarOptions = [
        [{ 'header': [2, 3, false] }],
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['clean']
    ];

    // Quill toolbar configuration for projects (with image support)
    const projectToolbarOptions = [
        [{ 'header': [2, 3, false] }],
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['image'],
        ['clean']
    ];

    // Service description editor
    if (document.getElementById('service_full_description')) {
        serviceDescriptionEditor = new Quill('#service_full_description', {
            theme: 'snow',
            modules: {
                toolbar: serviceToolbarOptions
            },
            placeholder: 'Décrivez votre service en détail...'
        });
    }

    // Project description editor (with image upload handler)
    if (document.getElementById('project_full_description')) {
        projectDescriptionEditor = new Quill('#project_full_description', {
            theme: 'snow',
            modules: {
                toolbar: {
                    container: projectToolbarOptions,
                    handlers: {
                        image: imageHandler
                    }
                }
            },
            placeholder: 'Décrivez votre projet en détail...'
        });
    }

    console.log('✅ Quill editors initialized');
}

// Custom image handler for Quill - uploads image to server
function imageHandler() {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
        const file = input.files[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert('Type de fichier non supporté. Utilisez JPG, PNG, GIF ou WebP.');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Le fichier est trop volumineux. Taille maximale : 5MB');
            return;
        }

        // Show loading indicator in editor
        const range = projectDescriptionEditor.getSelection(true);
        projectDescriptionEditor.insertText(range.index, 'Uploading image...');

        try {
            // Upload to server
            const formData = new FormData();
            formData.append('image', file);

            const token = localStorage.getItem('admin_token');
            const response = await fetch('/api/upload/content-image', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erreur lors de l\'upload');
            }

            const result = await response.json();

            // Remove loading text
            projectDescriptionEditor.deleteText(range.index, 'Uploading image...'.length);

            // Insert image at cursor position
            projectDescriptionEditor.insertEmbed(range.index, 'image', result.url);
            projectDescriptionEditor.setSelection(range.index + 1);

            console.log('✅ Image inserted in content:', result.url);

        } catch (error) {
            console.error('Upload error:', error);
            alert('Erreur lors de l\'upload : ' + error.message);

            // Remove loading text on error
            const range = projectDescriptionEditor.getSelection();
            if (range) {
                projectDescriptionEditor.deleteText(range.index - 'Uploading image...'.length, 'Uploading image...'.length);
            }
        }
    };
}

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

// Error handling
function showError(message) {
    alert('Erreur : ' + message);
}

// ============================================
// DASHBOARD
// ============================================
async function loadDashboard() {
    try {
        const [services, projects, stats] = await Promise.all([
            API.getAllServices(),
            API.getAllProjects(),
            API.getAllStats()
        ]);

        document.getElementById('totalServices').textContent = services.length;
        document.getElementById('totalProjects').textContent = projects.length;
        document.getElementById('totalStats').textContent = stats.length;

        // Database size is server-side now, show N/A
        document.getElementById('dbSize').textContent = 'N/A';
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showError('Erreur lors du chargement du dashboard');
    }
}

// ============================================
// SERVICES
// ============================================
async function loadServices() {
    try {
        const services = await API.getAllServices();
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
    } catch (error) {
        console.error('Error loading services:', error);
        showError('Erreur lors du chargement des services');
    }
}

function openServiceModal(id = null) {
    const modal = document.getElementById('serviceModal');
    const form = document.getElementById('serviceForm');
    form.reset();

    if (id) {
        // Load service data
        API.getAllServices().then(services => {
            const service = services.find(s => s.id === id);
            if (service) {
                document.getElementById('serviceModalTitle').textContent = 'Modifier le service';
                document.getElementById('service_id').value = service.id;
                document.getElementById('service_title').value = service.title;
                document.getElementById('service_slug').value = service.slug;
                document.getElementById('service_icon').value = service.icon || '';
                document.getElementById('service_short_description').value = service.short_description || '';

                // Set Quill editor content
                if (serviceDescriptionEditor) {
                    const delta = serviceDescriptionEditor.clipboard.convert(service.full_description || '');
                    serviceDescriptionEditor.setContents(delta);
                }

                const features = service.features ? JSON.parse(service.features) : [];
                document.getElementById('service_features').value = features.join('\n');

                document.getElementById('service_order_index').value = service.order_index || 0;
                document.getElementById('service_is_active').checked = service.is_active == 1;
            }
        });
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

async function saveService(event) {
    event.preventDefault();

    const id = document.getElementById('service_id').value;
    const data = {
        title: document.getElementById('service_title').value,
        slug: document.getElementById('service_slug').value,
        icon: document.getElementById('service_icon').value,
        short_description: document.getElementById('service_short_description').value,
        full_description: serviceDescriptionEditor ? serviceDescriptionEditor.root.innerHTML : '',
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
            await API.updateService(id, data);
        } else {
            await API.createService(data);
        }

        closeServiceModal();
        await loadServices();
        await loadDashboard();
        alert('Service enregistré !');
    } catch (error) {
        console.error('Error saving service:', error);
        showError(error.message || 'Erreur lors de l\'enregistrement du service');
    }
}

async function deleteService(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) return;

    try {
        await API.deleteService(id);
        await loadServices();
        await loadDashboard();
        alert('Service supprimé !');
    } catch (error) {
        console.error('Error deleting service:', error);
        showError(error.message || 'Erreur lors de la suppression du service');
    }
}

// ============================================
// PROJECTS
// ============================================
async function loadProjects() {
    try {
        const projects = await API.getAllProjects();
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
    } catch (error) {
        console.error('Error loading projects:', error);
        showError('Erreur lors du chargement des projets');
    }
}

function openProjectModal(id = null) {
    const modal = document.getElementById('projectModal');
    const form = document.getElementById('projectForm');
    form.reset();

    if (id) {
        API.getAllProjects().then(projects => {
            const project = projects.find(p => p.id === id);
            if (project) {
                document.getElementById('projectModalTitle').textContent = 'Modifier le projet';
                document.getElementById('project_id').value = project.id;
                document.getElementById('project_title').value = project.title;
                document.getElementById('project_slug').value = project.slug;
                document.getElementById('project_icon').value = project.icon || '';
                document.getElementById('project_image').value = project.image || '';
                document.getElementById('project_short_description').value = project.short_description || '';

                // Show image preview if exists
                showProjectImagePreview(project.image);

                // Load gallery
                loadProjectGallery(project.gallery);

                // Set Quill editor content
                if (projectDescriptionEditor) {
                    const delta = projectDescriptionEditor.clipboard.convert(project.full_description || '');
                    projectDescriptionEditor.setContents(delta);
                }

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
        });
    } else {
        document.getElementById('projectModalTitle').textContent = 'Nouveau projet';
        document.getElementById('project_id').value = '';
        resetGallery();
    }

    modal.classList.add('active');
}

function closeProjectModal() {
    document.getElementById('projectModal').classList.remove('active');
}

function editProject(id) {
    openProjectModal(id);
}

async function saveProject(event) {
    event.preventDefault();

    const id = document.getElementById('project_id').value;
    const data = {
        title: document.getElementById('project_title').value,
        slug: document.getElementById('project_slug').value,
        icon: document.getElementById('project_icon').value,
        image: document.getElementById('project_image').value,
        short_description: document.getElementById('project_short_description').value,
        full_description: projectDescriptionEditor ? projectDescriptionEditor.root.innerHTML : '',
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
        gallery: document.getElementById('project_gallery').value || '[]',
        order_index: parseInt(document.getElementById('project_order_index').value),
        is_featured: document.getElementById('project_is_featured').checked ? 1 : 0,
        is_active: document.getElementById('project_is_active').checked ? 1 : 0
    };

    try {
        if (id) {
            await API.updateProject(id, data);
        } else {
            await API.createProject(data);
        }

        closeProjectModal();
        await loadProjects();
        await loadDashboard();
        alert('Projet enregistré !');
    } catch (error) {
        console.error('Error saving project:', error);
        showError(error.message || 'Erreur lors de l\'enregistrement du projet');
    }
}

async function deleteProject(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) return;

    try {
        await API.deleteProject(id);
        await loadProjects();
        await loadDashboard();
        alert('Projet supprimé !');
    } catch (error) {
        console.error('Error deleting project:', error);
        showError(error.message || 'Erreur lors de la suppression du projet');
    }
}

// ============================================
// STATS
// ============================================
async function loadStats() {
    try {
        const stats = await API.getAllStats();
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
    } catch (error) {
        console.error('Error loading stats:', error);
        showError('Erreur lors du chargement des statistiques');
    }
}

function openStatModal(id = null) {
    const modal = document.getElementById('statModal');
    const form = document.getElementById('statForm');
    form.reset();

    if (id) {
        API.getAllStats().then(stats => {
            const stat = stats.find(s => s.id === id);
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
        });
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

async function saveStat(event) {
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
            await API.updateStat(id, data);
        } else {
            await API.createStat(data);
        }

        closeStatModal();
        await loadStats();
        await loadDashboard();
        alert('Statistique enregistrée !');
    } catch (error) {
        console.error('Error saving stat:', error);
        showError(error.message || 'Erreur lors de l\'enregistrement de la statistique');
    }
}

async function deleteStat(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette statistique ?')) return;

    try {
        await API.deleteStat(id);
        await loadStats();
        await loadDashboard();
        alert('Statistique supprimée !');
    } catch (error) {
        console.error('Error deleting stat:', error);
        showError(error.message || 'Erreur lors de la suppression de la statistique');
    }
}

// ============================================
// SETTINGS
// ============================================
async function loadSettings() {
    try {
        const settings = await API.getSettings();

        // Convert array to object for easier access
        const settingsObj = {};
        settings.forEach(setting => {
            settingsObj[setting.key] = setting.value;
        });

        const settingKeys = [
            'site_title', 'site_tagline', 'contact_email', 'contact_phone',
            'contact_location', 'social_linkedin', 'social_github',
            'social_twitter', 'social_instagram'
        ];

        settingKeys.forEach(key => {
            const input = document.getElementById(`setting_${key}`);
            if (input && settingsObj[key]) {
                input.value = settingsObj[key];
            }
        });
    } catch (error) {
        console.error('Error loading settings:', error);
        showError('Erreur lors du chargement des paramètres');
    }
}

async function saveSettings() {
    const settingKeys = [
        'site_title', 'site_tagline', 'contact_email', 'contact_phone',
        'contact_location', 'social_linkedin', 'social_github',
        'social_twitter', 'social_instagram'
    ];

    try {
        const updates = {};
        settingKeys.forEach(key => {
            const input = document.getElementById(`setting_${key}`);
            if (input) {
                updates[key] = input.value;
            }
        });

        await API.updateSettings(updates);
        alert('Paramètres enregistrés !');
    } catch (error) {
        console.error('Error saving settings:', error);
        showError(error.message || 'Erreur lors de l\'enregistrement des paramètres');
    }
}

async function changePassword() {
    const currentPassword = document.getElementById('current_password').value;
    const newPassword = document.getElementById('new_password').value;
    const confirmPassword = document.getElementById('confirm_password').value;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
        alert('Veuillez remplir tous les champs');
        return;
    }

    if (newPassword !== confirmPassword) {
        alert('Les nouveaux mots de passe ne correspondent pas');
        return;
    }

    if (newPassword.length < 8) {
        alert('Le nouveau mot de passe doit contenir au moins 8 caractères');
        return;
    }

    try {
        await API.changePassword(currentPassword, newPassword);

        // Clear fields
        document.getElementById('current_password').value = '';
        document.getElementById('new_password').value = '';
        document.getElementById('confirm_password').value = '';

        alert('Mot de passe changé avec succès !');
    } catch (error) {
        console.error('Error changing password:', error);
        showError(error.message || 'Erreur lors du changement de mot de passe');
    }
}

// ============================================
// DATABASE MANAGEMENT
// ============================================
function exportDatabase() {
    alert('L\'export de la base de données n\'est pas disponible pour une base serveur.\nVeuillez utiliser les commandes serveur pour faire un backup (voir DEPLOY.md).');
}

function setupDatabaseImport() {
    // Not applicable for server-side database
    const fileInput = document.getElementById('dbFileInput');
    if (fileInput) {
        fileInput.style.display = 'none';
    }
}

function resetDatabase() {
    alert('La réinitialisation de la base de données doit être effectuée côté serveur.\nVeuillez exécuter: npm run init-db');
}

// ============================================
// IMAGE UPLOAD FOR PROJECTS
// ============================================

// Handle file selection and upload
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('project_image_file');
    if (fileInput) {
        fileInput.addEventListener('change', handleProjectImageUpload);
    }
});

async function handleProjectImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        alert('Type de fichier non supporté. Utilisez JPG, PNG, GIF ou WebP.');
        event.target.value = '';
        return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Le fichier est trop volumineux. Taille maximale : 5MB');
        event.target.value = '';
        return;
    }

    // Show loading state
    const preview = document.getElementById('project_image_preview');
    const previewImg = document.getElementById('project_image_preview_img');
    previewImg.src = '';
    preview.style.display = 'block';
    previewImg.alt = 'Upload en cours...';

    try {
        // Create FormData
        const formData = new FormData();
        formData.append('image', file);

        // Upload to server
        const token = localStorage.getItem('admin_token');
        const response = await fetch('/api/upload/project-image', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erreur lors de l\'upload');
        }

        const result = await response.json();

        // Update hidden input with image URL
        document.getElementById('project_image').value = result.url;

        // Show preview
        previewImg.src = result.url;
        previewImg.alt = 'Preview';

        console.log('✅ Image uploaded:', result.url);

    } catch (error) {
        console.error('Upload error:', error);
        alert('Erreur lors de l\'upload : ' + error.message);
        event.target.value = '';
        preview.style.display = 'none';
    }
}

function removeProjectImage() {
    if (!confirm('Supprimer cette image ?')) return;

    // Clear inputs and hide preview
    document.getElementById('project_image_file').value = '';
    document.getElementById('project_image').value = '';
    document.getElementById('project_image_preview').style.display = 'none';
    document.getElementById('project_image_preview_img').src = '';
}

// Show existing image when editing
function showProjectImagePreview(imageUrl) {
    if (imageUrl) {
        const preview = document.getElementById('project_image_preview');
        const previewImg = document.getElementById('project_image_preview_img');
        previewImg.src = imageUrl;
        preview.style.display = 'block';
    } else {
        document.getElementById('project_image_preview').style.display = 'none';
    }
}

// ============================================
// GALLERY UPLOAD FOR PROJECTS
// ============================================

// Track current gallery images
let currentGallery = [];

// Handle gallery file selection and upload
document.addEventListener('DOMContentLoaded', () => {
    const galleryInput = document.getElementById('project_gallery_files');
    if (galleryInput) {
        galleryInput.addEventListener('change', handleGalleryUpload);
    }
});

async function handleGalleryUpload(event) {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // Validate each file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
        if (!allowedTypes.includes(file.type)) {
            alert(`Type de fichier non supporté pour ${file.name}. Utilisez JPG, PNG, GIF ou WebP.`);
            event.target.value = '';
            return;
        }
        if (file.size > maxSize) {
            alert(`Le fichier ${file.name} est trop volumineux. Taille maximale : 5MB`);
            event.target.value = '';
            return;
        }
    }

    try {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            alert('Non authentifié');
            return;
        }

        // Upload all files
        const formData = new FormData();
        files.forEach(file => formData.append('images', file));

        const response = await fetch('/api/upload/gallery-images', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Erreur lors de l\'upload');
        }

        const result = await response.json();

        // Add new images to current gallery
        result.images.forEach(img => {
            currentGallery.push(img.url);
        });

        // Update hidden input and display
        updateGalleryDisplay();

        console.log(`✅ ${result.images.length} image(s) added to gallery`);

        // Clear file input
        event.target.value = '';

    } catch (error) {
        console.error('Gallery upload error:', error);
        alert('Erreur lors de l\'upload : ' + error.message);
        event.target.value = '';
    }
}

function updateGalleryDisplay() {
    const previewContainer = document.getElementById('project_gallery_preview');
    const hiddenInput = document.getElementById('project_gallery');

    // Update hidden input with JSON array
    hiddenInput.value = JSON.stringify(currentGallery);

    // Clear and rebuild preview
    previewContainer.innerHTML = '';

    if (currentGallery.length === 0) {
        return; // CSS will show "Aucune image" message
    }

    currentGallery.forEach((imageUrl, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-preview-item';
        item.innerHTML = `
            <img src="${imageUrl}" alt="Gallery ${index + 1}">
            <button type="button" class="remove-btn" onclick="removeGalleryImage(${index})" title="Supprimer">×</button>
        `;
        previewContainer.appendChild(item);
    });
}

function removeGalleryImage(index) {
    if (!confirm('Supprimer cette image de la galerie ?')) return;

    currentGallery.splice(index, 1);
    updateGalleryDisplay();
}

// Load existing gallery when editing
function loadProjectGallery(galleryJson) {
    try {
        currentGallery = galleryJson ? JSON.parse(galleryJson) : [];
        updateGalleryDisplay();
    } catch (error) {
        console.error('Error loading gallery:', error);
        currentGallery = [];
        updateGalleryDisplay();
    }
}

// Reset gallery when creating new project
function resetGallery() {
    currentGallery = [];
    updateGalleryDisplay();
    document.getElementById('project_gallery_files').value = '';
}
