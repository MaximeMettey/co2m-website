// API Client pour communiquer avec le backend

const API_BASE_URL = window.location.origin + '/api';

class APIClient {
    constructor() {
        this.token = localStorage.getItem('admin_token');
    }

    // Helper pour les requêtes
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Add auth token if available
        if (this.token) {
            config.headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth
    async login(username, password, hcaptchaToken) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password, hcaptchaToken })
        });

        this.token = data.token;
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.user));

        return data;
    }

    async verifyToken() {
        try {
            return await this.request('/auth/verify');
        } catch (error) {
            this.logout();
            return { valid: false };
        }
    }

    async changePassword(currentPassword, newPassword) {
        return await this.request('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify({ currentPassword, newPassword })
        });
    }

    logout() {
        this.token = null;
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
    }

    // Services
    async getServices() {
        return await this.request('/services');
    }

    async getAllServices() {
        return await this.request('/services/all');
    }

    async getServiceBySlug(slug) {
        return await this.request(`/services/${slug}`);
    }

    async createService(data) {
        return await this.request('/services', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateService(id, data) {
        return await this.request(`/services/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteService(id) {
        return await this.request(`/services/${id}`, {
            method: 'DELETE'
        });
    }

    // Projects
    async getProjects() {
        return await this.request('/projects');
    }

    async getAllProjects() {
        return await this.request('/projects/all');
    }

    async getFeaturedProjects() {
        return await this.request('/projects/featured');
    }

    async getProjectBySlug(slug) {
        return await this.request(`/projects/${slug}`);
    }

    async createProject(data) {
        return await this.request('/projects', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateProject(id, data) {
        return await this.request(`/projects/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteProject(id) {
        return await this.request(`/projects/${id}`, {
            method: 'DELETE'
        });
    }

    // Stats
    async getStats() {
        return await this.request('/stats');
    }

    async getAllStats() {
        return await this.request('/stats/all');
    }

    async createStat(data) {
        return await this.request('/stats', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateStat(id, data) {
        return await this.request(`/stats/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteStat(id) {
        return await this.request(`/stats/${id}`, {
            method: 'DELETE'
        });
    }

    // Content
    async getContentSections() {
        return await this.request('/content');
    }

    async getContentSection(key) {
        return await this.request(`/content/${key}`);
    }

    async updateContentSection(key, data) {
        return await this.request(`/content/${key}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // Settings
    async getSettings(category = null) {
        const url = category ? `/settings?category=${category}` : '/settings';
        return await this.request(url);
    }

    async getSetting(key) {
        return await this.request(`/settings/${key}`);
    }

    async updateSetting(key, value) {
        return await this.request(`/settings/${key}`, {
            method: 'PUT',
            body: JSON.stringify({ value })
        });
    }

    async updateSettings(settings) {
        return await this.request('/settings/bulk', {
            method: 'POST',
            body: JSON.stringify({ settings })
        });
    }
}

// Global instance
const API = new APIClient();
