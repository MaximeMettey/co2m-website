// ============================================
// DATABASE MANAGER - SQLite with sql.js
// ============================================

class DatabaseManager {
    constructor() {
        this.db = null;
        this.SQL = null;
    }

    // Initialize sql.js and database
    async init() {
        try {
            // Load sql.js from CDN
            this.SQL = await initSqlJs({
                locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
            });

            // Try to load existing database from localStorage
            const savedDb = localStorage.getItem('co2m_database');

            if (savedDb) {
                // Load existing database
                const uint8Array = new Uint8Array(JSON.parse(savedDb));
                this.db = new this.SQL.Database(uint8Array);
                console.log('Database loaded from localStorage');
            } else {
                // Create new database
                this.db = new this.SQL.Database();
                await this.createSchema();
                await this.seedInitialData();
                this.save();
                console.log('New database created');
            }

            return true;
        } catch (error) {
            console.error('Failed to initialize database:', error);
            return false;
        }
    }

    // Create database schema
    async createSchema() {
        const schema = `
            -- Services table
            CREATE TABLE IF NOT EXISTS services (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                slug TEXT UNIQUE NOT NULL,
                icon TEXT,
                short_description TEXT,
                full_description TEXT,
                features TEXT, -- JSON array
                order_index INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            -- Projects table
            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                slug TEXT UNIQUE NOT NULL,
                icon TEXT,
                image TEXT,
                short_description TEXT,
                full_description TEXT,
                tags TEXT, -- JSON array
                technologies TEXT, -- JSON array
                project_url TEXT,
                github_url TEXT,
                order_index INTEGER DEFAULT 0,
                is_featured BOOLEAN DEFAULT 0,
                is_active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            -- Stats table
            CREATE TABLE IF NOT EXISTS stats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                icon TEXT,
                value INTEGER NOT NULL,
                label TEXT NOT NULL,
                unit TEXT,
                order_index INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT 1
            );

            -- Pages table
            CREATE TABLE IF NOT EXISTS pages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                page_key TEXT UNIQUE NOT NULL,
                title TEXT NOT NULL,
                content TEXT, -- JSON object with sections
                meta_description TEXT,
                meta_keywords TEXT,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            -- Settings table
            CREATE TABLE IF NOT EXISTS settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT UNIQUE NOT NULL,
                value TEXT,
                type TEXT DEFAULT 'text' -- text, json, number, boolean
            );
        `;

        this.db.run(schema);
    }

    // Seed initial data
    async seedInitialData() {
        // Insert services
        const services = [
            {
                title: 'Développement Web Full-Stack',
                slug: 'developpement-web',
                icon: '🌐',
                short_description: 'Création de sites et applications web performantes, modernes et sur-mesure.',
                full_description: `Développement web complet de A à Z, du design à la mise en production. Je maîtrise toute la stack moderne pour créer des applications web performantes, sécurisées et scalables.

Que vous ayez besoin d'un site vitrine élégant, d'une application métier complexe ou d'une plateforme e-commerce robuste, je transforme votre vision en réalité digitale.

Mon expertise couvre l'ensemble du cycle de développement : architecture, développement front-end et back-end, optimisation des performances, sécurité, déploiement et maintenance.`,
                features: JSON.stringify([
                    'Sites WordPress & PrestaShop personnalisés',
                    'Applications Symfony et Laravel (PHP)',
                    'Front-end React, Vue.js, Angular',
                    'Architecture REST & GraphQL APIs',
                    'Bases de données MySQL, PostgreSQL, MongoDB',
                    'Authentification OAuth, JWT, sessions sécurisées',
                    'Optimisation des performances (caching, CDN)',
                    'Responsive design et Progressive Web Apps',
                    'Hébergement et déploiement (Docker, CI/CD)',
                    'Maintenance, évolutions et support technique'
                ]),
                order_index: 1
            },
            {
                title: 'Applications Mobile Cross-Platform',
                slug: 'applications-mobile',
                icon: '📱',
                short_description: 'Développement d\'applications natives iOS et Android à partir d\'un seul code.',
                full_description: `Création d'applications mobiles performantes avec Flutter et React Native. Une seule codebase pour iOS et Android, ce qui permet un développement plus rapide et moins coûteux tout en conservant une expérience native.

Je conçois des applications fluides, intuitives et adaptées à votre métier, du prototype à la publication sur les stores.

Que ce soit une application e-commerce, un outil métier, un réseau social ou un service innovant, je vous accompagne sur toute la chaîne de valeur mobile.`,
                features: JSON.stringify([
                    'Développement Flutter (Dart) - iOS & Android',
                    'React Native pour applications hybrides',
                    'Progressive Web Apps (PWA)',
                    'Intégration APIs REST et WebSocket',
                    'Notifications push natives',
                    'Géolocalisation et services de localisation',
                    'Paiements in-app (Stripe, PayPal, Apple Pay)',
                    'Synchronisation offline et cache local',
                    'Publication App Store et Google Play',
                    'Maintenance et mises à jour continues'
                ]),
                order_index: 2
            },
            {
                title: 'Design UI/UX & Identité Visuelle',
                slug: 'design-graphisme',
                icon: '🎨',
                short_description: 'Création d\'identités visuelles percutantes et interfaces utilisateur intuitives.',
                full_description: `Design complet de votre identité visuelle et de vos interfaces numériques. Je crée des expériences visuelles qui captivent vos utilisateurs et renforcent votre image de marque.

Du logo à la charte graphique complète, en passant par le design de vos interfaces web et mobile, je donne vie à votre univers visuel avec créativité et cohérence.

Mon approche mêle esthétique moderne et ergonomie réfléchie pour des créations qui séduisent autant qu'elles sont fonctionnelles.`,
                features: JSON.stringify([
                    'Création de logos et identités visuelles',
                    'Chartes graphiques complètes (print & digital)',
                    'Maquettes web et mobile (Figma, Adobe XD)',
                    'Design UI moderne et responsive',
                    'UX Design et parcours utilisateur',
                    'Design systems et bibliothèques de composants',
                    'Supports de communication print (flyers, cartes)',
                    'Illustrations et iconographie custom',
                    'Animation et micro-interactions',
                    'Prototypes interactifs et tests utilisateurs'
                ]),
                order_index: 3
            },
            {
                title: 'SEO & Référencement IA (GEO)',
                slug: 'seo-referencement',
                icon: '🔍',
                short_description: 'Optimisation pour les moteurs de recherche classiques et les IA génératives.',
                full_description: `Référencement complet de votre site web pour les moteurs de recherche traditionnels (Google, Bing) et les nouvelles IA génératives (ChatGPT, Perplexity, etc.).

Le SEO évolue : en plus du référencement classique, je vous positionne sur le GEO (Generative Engine Optimization) pour être visible dans les réponses des IA.

Optimisation technique, sémantique et stratégique pour maximiser votre visibilité et générer du trafic qualifié.`,
                features: JSON.stringify([
                    'Audit SEO technique complet',
                    'Optimisation on-page (balises, structure, contenu)',
                    'Stratégie de contenu et cocon sémantique',
                    'Recherche et ciblage de mots-clés',
                    'Optimisation GEO pour IA génératives',
                    'Netlinking et backlinks de qualité',
                    'Core Web Vitals et performance',
                    'Données structurées (Schema.org)',
                    'Indexation et sitemap XML',
                    'Suivi et reporting mensuel (Google Analytics, Search Console)'
                ]),
                order_index: 4
            },
            {
                title: 'Développement en Marque Blanche',
                slug: 'marque-blanche',
                icon: '🤝',
                short_description: 'Partenaire technique discret pour agences web et professionnels.',
                full_description: `Service de développement en marque blanche pour les agences de communication, webdesigners freelances et structures qui souhaitent externaliser leur développement.

Je travaille en toute discrétion sous votre nom, avec professionnalisme et respect des délais. Vous gardez la relation client, je m'occupe de l'aspect technique.

Idéal pour étoffer votre offre sans recruter, absorber les pics d'activité ou déléguer des projets techniques complexes.`,
                features: JSON.stringify([
                    'Développement sous votre marque',
                    'Communication directe ou relais selon besoin',
                    'Respect strict des deadlines et budgets',
                    'Code propre, documenté et maintenable',
                    'Support technique réactif',
                    'Confidentialité totale garantie',
                    'Facturation adaptée (au projet ou forfait)',
                    'Process de validation transparent',
                    'Formation et transfert de compétences si besoin',
                    'Disponibilité pour maintenance continue'
                ]),
                order_index: 5
            },
            {
                title: 'Solutions Métier & Applications Sur-Mesure',
                slug: 'solutions-specifiques',
                icon: '⚙️',
                short_description: 'Développement d\'outils et logiciels personnalisés pour vos besoins spécifiques.',
                full_description: `Conception et développement d'applications métier sur-mesure adaptées à vos processus internes et vos besoins spécifiques.

Si aucun logiciel standard ne répond à vos besoins, je crée la solution qui vous ressemble : CRM personnalisé, ERP, outils de gestion, automatisation de tâches, tableaux de bord analytiques...

Du cahier des charges à la mise en production, je transforme vos contraintes métier en outils efficaces et évolutifs.`,
                features: JSON.stringify([
                    'Applications métier personnalisées',
                    'CRM et ERP sur-mesure',
                    'Outils de gestion et back-office',
                    'Automatisation de processus (RPA)',
                    'Tableaux de bord et business intelligence',
                    'APIs et connecteurs vers outils tiers',
                    'Solutions SaaS multi-tenant',
                    'Migration et modernisation de legacy',
                    'Intégration de systèmes complexes',
                    'Formation des équipes et documentation'
                ]),
                order_index: 6
            },
            {
                title: 'Debugging & Évolutions',
                slug: 'debug-evolutions',
                icon: '🔧',
                short_description: 'Résolution de bugs, optimisations et évolutions sur projets existants.',
                full_description: `Intervention sur projets web ou mobile existants pour corriger des bugs, améliorer les performances ou ajouter de nouvelles fonctionnalités.

Vous avez un projet qui dysfonctionne, qui est lent ou qui nécessite des évolutions ? Je diagnostique, je répare et j'améliore votre application existante, quel que soit le langage ou framework utilisé.

Service d'audit, de debugging et de maintenance évolutive pour prolonger la vie de vos applications.`,
                features: JSON.stringify([
                    'Audit de code et détection de bugs',
                    'Résolution de problèmes techniques complexes',
                    'Optimisation des performances (temps de chargement, requêtes)',
                    'Refactoring et amélioration de code legacy',
                    'Ajout de nouvelles fonctionnalités',
                    'Migration vers versions récentes (frameworks, PHP, etc.)',
                    'Correction de failles de sécurité',
                    'Mise à jour de dépendances et compatibilité',
                    'Tests et validation après corrections',
                    'Documentation technique du projet'
                ]),
                order_index: 7
            }
        ];

        services.forEach(service => {
            this.db.run(
                `INSERT INTO services (title, slug, icon, short_description, full_description, features, order_index)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [service.title, service.slug, service.icon, service.short_description,
                 service.full_description, service.features, service.order_index]
            );
        });

        // Insert projects (from existing projects.json)
        const projects = [
            {
                title: 'Application E-commerce Mobile',
                slug: 'app-ecommerce-mobile',
                icon: '🛒',
                image: '',
                short_description: 'Application cross-platform Flutter pour une boutique en ligne avec paiement intégré et gestion de stock en temps réel.',
                full_description: 'Application mobile complète développée avec Flutter permettant de gérer une boutique en ligne de A à Z. Intégration de paiements sécurisés, synchronisation temps réel avec le stock, notifications push pour les promotions.',
                tags: JSON.stringify(['Flutter', 'Firebase', 'API REST', 'iOS', 'Android']),
                technologies: JSON.stringify(['Flutter', 'Dart', 'Firebase', 'Stripe', 'REST API']),
                order_index: 1,
                is_featured: 1
            },
            {
                title: 'Plateforme Web Symfony',
                slug: 'plateforme-symfony',
                icon: '⚙️',
                image: '',
                short_description: 'Plateforme de gestion métier complexe avec authentification multi-niveaux et tableau de bord analytique avancé.',
                full_description: 'Application web professionnelle développée avec Symfony pour gérer les processus métiers d\'une entreprise. Authentification sécurisée avec rôles multiples, dashboards interactifs avec React, et architecture scalable.',
                tags: JSON.stringify(['Symfony', 'PHP', 'MySQL', 'React', 'Docker']),
                technologies: JSON.stringify(['Symfony 6', 'PHP 8', 'MySQL', 'React', 'Docker', 'Redis']),
                order_index: 2,
                is_featured: 1
            },
            {
                title: 'Site E-commerce PrestaShop',
                slug: 'ecommerce-prestashop',
                icon: '🏪',
                image: '',
                short_description: 'Boutique en ligne sur-mesure avec modules personnalisés, optimisation SEO et intégration de solutions de paiement multiples.',
                full_description: 'Site e-commerce complet sous PrestaShop avec thème custom, modules personnalisés pour la gestion des promotions, intégration multi-paiements et optimisation SEO poussée.',
                tags: JSON.stringify(['PrestaShop', 'PHP', 'SEO', 'Responsive', 'Optimisation']),
                technologies: JSON.stringify(['PrestaShop', 'PHP', 'MySQL', 'JavaScript', 'Stripe', 'PayPal']),
                order_index: 3
            },
            {
                title: 'Identité Visuelle Complète',
                slug: 'identite-visuelle-startup',
                icon: '🎨',
                image: '',
                short_description: 'Création de logo, charte graphique et supports de communication print et digital pour une startup tech.',
                full_description: 'Conception complète d\'une identité visuelle pour une startup dans la tech : logo, déclinaisons, charte graphique, templates de présentation, cartes de visite, et design du site web.',
                tags: JSON.stringify(['Logo', 'Branding', 'Print', 'Design', 'Charte graphique']),
                technologies: JSON.stringify(['Figma', 'Adobe Illustrator', 'Adobe Photoshop', 'Adobe InDesign']),
                order_index: 4
            },
            {
                title: 'Application SaaS React',
                slug: 'saas-react',
                icon: '💼',
                image: '',
                short_description: 'Application web SaaS moderne avec architecture microservices, dashboard temps réel et système d\'abonnements.',
                full_description: 'Plateforme SaaS complète avec abonnements mensuels, dashboards en temps réel, architecture microservices et intégration Stripe pour les paiements récurrents.',
                tags: JSON.stringify(['React', 'Node.js', 'MongoDB', 'Stripe', 'AWS']),
                technologies: JSON.stringify(['React', 'Node.js', 'Express', 'MongoDB', 'Stripe', 'AWS S3', 'Docker']),
                order_index: 5,
                is_featured: 1
            },
            {
                title: 'Site WordPress sur-mesure',
                slug: 'wordpress-custom',
                icon: '🌐',
                image: '',
                short_description: 'Site vitrine WordPress avec thème personnalisé, optimisations SEO/GEO et intégration d\'outils marketing.',
                full_description: 'Site WordPress entièrement personnalisé avec thème sur-mesure, optimisations SEO avancées et GEO pour le référencement dans les IA, intégration d\'outils marketing (newsletter, CRM).',
                tags: JSON.stringify(['WordPress', 'Custom Theme', 'SEO', 'GEO', 'Performance']),
                technologies: JSON.stringify(['WordPress', 'PHP', 'JavaScript', 'MySQL', 'Mailchimp']),
                order_index: 6
            }
        ];

        projects.forEach(project => {
            this.db.run(
                `INSERT INTO projects (title, slug, icon, image, short_description, full_description, tags, technologies, order_index, is_featured)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [project.title, project.slug, project.icon, project.image, project.short_description,
                 project.full_description, project.tags, project.technologies, project.order_index, project.is_featured]
            );
        });

        // Insert fun stats (only quirky ones!)
        const stats = [
            { icon: '☕', value: 4, label: 'Expressos / jour', unit: '', order_index: 1 },
            { icon: '👨‍💻', value: 14, label: 'Années d\'expérience', unit: '', order_index: 2 },
            { icon: '🌙', value: 1247, label: 'Nuits de debug', unit: '', order_index: 3 },
            { icon: '🎯', value: 99, label: '% de clients satisfaits', unit: '%', order_index: 4 },
            { icon: '🚀', value: 100, label: 'Projets déployés', unit: '+', order_index: 5 },
            { icon: '⌨️', value: 50000, label: 'Commits Git', unit: '+', order_index: 6 },
            { icon: '🐛', value: 9999, label: 'Bugs corrigés', unit: '', order_index: 7 },
            { icon: '📚', value: 42, label: 'Technologies maîtrisées', unit: '', order_index: 8 }
        ];

        stats.forEach(stat => {
            this.db.run(
                `INSERT INTO stats (icon, value, label, unit, order_index) VALUES (?, ?, ?, ?, ?)`,
                [stat.icon, stat.value, stat.label, stat.unit, stat.order_index]
            );
        });

        // Insert settings
        const settings = [
            { key: 'site_title', value: 'CO2M - WebDesign et Communication', type: 'text' },
            { key: 'site_tagline', value: 'Développeur Full-Stack Belfort', type: 'text' },
            { key: 'contact_email', value: 'maxime@co2m.net', type: 'text' },
            { key: 'contact_phone', value: '+33 (0)7.66.27.30.34', type: 'text' },
            { key: 'contact_location', value: 'Belfort (90), Franche-Comté, France', type: 'text' },
            { key: 'social_linkedin', value: '#', type: 'text' },
            { key: 'social_github', value: '#', type: 'text' },
            { key: 'social_twitter', value: '#', type: 'text' },
            { key: 'social_instagram', value: '#', type: 'text' }
        ];

        settings.forEach(setting => {
            this.db.run(
                `INSERT INTO settings (key, value, type) VALUES (?, ?, ?)`,
                [setting.key, setting.value, setting.type]
            );
        });
    }

    // Save database to localStorage
    save() {
        const data = this.db.export();
        const buffer = JSON.stringify(Array.from(data));
        localStorage.setItem('co2m_database', buffer);
        console.log('Database saved to localStorage');
    }

    // Export database as downloadable file
    exportToFile() {
        const data = this.db.export();
        const blob = new Blob([data], { type: 'application/x-sqlite3' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `co2m-content-${Date.now()}.sqlite`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Import database from file
    async importFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const uint8Array = new Uint8Array(e.target.result);
                    this.db = new this.SQL.Database(uint8Array);
                    this.save();
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    // Query helpers
    getAll(table, where = '', params = []) {
        let sql = `SELECT * FROM ${table}`;
        if (where) sql += ` WHERE ${where}`;
        sql += ` ORDER BY order_index ASC`;

        const stmt = this.db.prepare(sql);
        stmt.bind(params);

        const results = [];
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
    }

    getOne(table, where, params = []) {
        const sql = `SELECT * FROM ${table} WHERE ${where} LIMIT 1`;
        const stmt = this.db.prepare(sql);
        stmt.bind(params);

        let result = null;
        if (stmt.step()) {
            result = stmt.getAsObject();
        }
        stmt.free();
        return result;
    }

    insert(table, data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map(() => '?').join(', ');

        const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
        this.db.run(sql, values);
        this.save();
    }

    update(table, data, where, whereParams = []) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const sets = keys.map(key => `${key} = ?`).join(', ');

        const sql = `UPDATE ${table} SET ${sets} WHERE ${where}`;
        this.db.run(sql, [...values, ...whereParams]);
        this.save();
    }

    delete(table, where, params = []) {
        const sql = `DELETE FROM ${table} WHERE ${where}`;
        this.db.run(sql, params);
        this.save();
    }

    // Specific queries
    getActiveServices() {
        return this.getAll('services', 'is_active = 1');
    }

    getServiceBySlug(slug) {
        return this.getOne('services', 'slug = ?', [slug]);
    }

    getActiveProjects() {
        return this.getAll('projects', 'is_active = 1');
    }

    getFeaturedProjects() {
        return this.getAll('projects', 'is_featured = 1 AND is_active = 1');
    }

    getProjectBySlug(slug) {
        return this.getOne('projects', 'slug = ?', [slug]);
    }

    getActiveStats() {
        return this.getAll('stats', 'is_active = 1');
    }

    getSetting(key) {
        const result = this.getOne('settings', 'key = ?', [key]);
        return result ? result.value : null;
    }

    updateSetting(key, value) {
        this.update('settings', { value }, 'key = ?', [key]);
    }
}

// Global database instance
const DB = new DatabaseManager();
