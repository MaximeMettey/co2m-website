// Project Detail Page - loads project by slug from URL

document.addEventListener('DOMContentLoaded', async () => {
    // Get slug from URL - support both /projects/:slug and /project.html?slug=:slug
    let slug = null;

    // Try to get from path (e.g., /projects/my-app)
    const pathMatch = window.location.pathname.match(/\/projects\/([^\/]+)/);
    if (pathMatch) {
        slug = pathMatch[1];
    } else {
        // Fallback to query parameter (e.g., /project.html?slug=my-app)
        const urlParams = new URLSearchParams(window.location.search);
        slug = urlParams.get('slug');
    }

    if (!slug) {
        showError();
        return;
    }

    await loadProjectDetail(slug);
});

async function loadProjectDetail(slug) {
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const projectContent = document.getElementById('projectContent');

    try {
        console.log(`Loading project: ${slug}`);
        const project = await API.getProjectBySlug(slug);

        // Update page metadata
        document.title = `${project.title} - CO2M`;
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', project.short_description || project.title);
        }

        // Hide loading, show content
        loadingState.style.display = 'none';
        projectContent.style.display = 'block';

        // Populate content
        document.getElementById('breadcrumbTitle').textContent = project.title;
        document.getElementById('projectTitle').textContent = project.title;
        document.getElementById('projectShortDescription').textContent = project.short_description || '';

        // Project image or icon
        const imageContainer = document.getElementById('projectImageContainer');
        if (project.image) {
            imageContainer.innerHTML = `<img src="${project.image}" alt="${project.title}">`;
        } else {
            imageContainer.innerHTML = `<span class="project-icon-large">${project.icon || '🚀'}</span>`;
        }

        // Full description - insert HTML directly from WYSIWYG editor
        const fullDescDiv = document.getElementById('projectFullDescription');
        if (project.full_description) {
            fullDescDiv.innerHTML = project.full_description;
        } else {
            fullDescDiv.innerHTML = '<p>Aucune description disponible.</p>';
        }

        // Tags
        const tagsContainer = document.getElementById('projectTags');
        const tags = project.tags ? JSON.parse(project.tags) : [];
        if (tags.length > 0) {
            tagsContainer.innerHTML = tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        } else {
            tagsContainer.style.display = 'none';
        }

        // Technologies
        const techContainer = document.getElementById('projectTechnologies');
        const technologies = project.technologies ? JSON.parse(project.technologies) : [];
        if (technologies.length > 0) {
            techContainer.innerHTML = technologies.map(tech => `<span class="tech-badge">${tech}</span>`).join('');
        } else {
            techContainer.innerHTML = '<p style="color: var(--text-muted);">Non spécifié</p>';
        }

        // Project links
        const linksContainer = document.getElementById('projectLinks');
        const links = [];

        if (project.project_url) {
            links.push(`<a href="${project.project_url}" target="_blank" rel="noopener noreferrer" class="btn">🌐 Voir le site</a>`);
        }

        if (project.github_url) {
            links.push(`<a href="${project.github_url}" target="_blank" rel="noopener noreferrer" class="btn btn-outline">💻 Voir sur GitHub</a>`);
        }

        if (links.length > 0) {
            linksContainer.innerHTML = links.join('');
        } else {
            linksContainer.style.display = 'none';
        }

        // Observe new elements for fade-in animation
        document.querySelectorAll('.fade-in').forEach(el => {
            if (window.observer) {
                window.observer.observe(el);
            }
        });

        console.log('✅ Project loaded:', project.title);
    } catch (error) {
        console.error('Error loading project:', error);
        showError();
    }
}

function showError() {
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const projectContent = document.getElementById('projectContent');

    loadingState.style.display = 'none';
    errorState.style.display = 'block';
    projectContent.style.display = 'none';
}
