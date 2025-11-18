// Projects Page - loads all projects with tag filtering

let allProjects = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Loading projects page...');
    await loadAllProjects();
});

async function loadAllProjects() {
    const loadingState = document.getElementById('loadingState');
    const projectsContent = document.getElementById('projectsContent');

    try {
        // Fetch all active projects
        allProjects = await API.getProjects();
        console.log(`✅ ${allProjects.length} projects loaded`);

        // Hide loading, show content
        loadingState.style.display = 'none';
        projectsContent.style.display = 'block';

        // Extract all unique tags
        const allTags = extractAllTags(allProjects);

        // Build tag filters
        buildTagFilters(allTags);

        // Display all projects initially
        displayProjects(allProjects);

        // Observe elements for fade-in animation
        document.querySelectorAll('.fade-in').forEach(el => {
            if (window.observer) {
                window.observer.observe(el);
            }
        });

    } catch (error) {
        console.error('Error loading projects:', error);
        loadingState.innerHTML = `
            <p style="color: var(--danger);">Erreur lors du chargement des projets.</p>
            <a href="/" class="btn" style="margin-top: 1rem;">Retour à l'accueil</a>
        `;
    }
}

// Extract all unique tags from projects
function extractAllTags(projects) {
    const tagsSet = new Set();

    projects.forEach(project => {
        if (project.tags) {
            const tags = JSON.parse(project.tags);
            tags.forEach(tag => tagsSet.add(tag));
        }
    });

    return Array.from(tagsSet).sort();
}

// Build tag filter buttons
function buildTagFilters(tags) {
    const tagsFilter = document.getElementById('tagsFilter');

    // Keep the "All" button, add individual tag buttons
    tags.forEach(tag => {
        const button = document.createElement('button');
        button.className = 'tag-filter-btn';
        button.dataset.tag = tag;
        button.textContent = tag;
        button.onclick = () => filterByTag(tag);
        tagsFilter.appendChild(button);
    });
}

// Filter projects by tag
function filterByTag(tag) {
    currentFilter = tag;

    // Update active button
    document.querySelectorAll('.tag-filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tag === tag) {
            btn.classList.add('active');
        }
    });

    // Filter and display projects
    if (tag === 'all') {
        displayProjects(allProjects);
    } else {
        const filtered = allProjects.filter(project => {
            if (!project.tags) return false;
            const tags = JSON.parse(project.tags);
            return tags.includes(tag);
        });
        displayProjects(filtered);
    }
}

// Display projects in grid
function displayProjects(projects) {
    const projectsGrid = document.getElementById('projectsGrid');
    const projectsCount = document.getElementById('projectsCount');
    const noProjects = document.getElementById('noProjects');

    if (projects.length === 0) {
        projectsGrid.style.display = 'none';
        noProjects.style.display = 'block';
        projectsCount.textContent = '';
        return;
    }

    projectsGrid.style.display = 'grid';
    noProjects.style.display = 'none';

    // Update count
    const filterText = currentFilter === 'all' ? '' : ` avec "${currentFilter}"`;
    projectsCount.textContent = `${projects.length} projet${projects.length > 1 ? 's' : ''}${filterText}`;

    // Build project cards
    projectsGrid.innerHTML = projects.map(project => {
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
                    <a href="/projects/${project.slug}" class="card-link-btn">En savoir plus →</a>
                </div>
            </div>
        `;
    }).join('');

    // Re-observe new cards for fade-in animation
    document.querySelectorAll('.portfolio-card').forEach(card => {
        if (window.observer) {
            window.observer.observe(card);
        }
    });
}
