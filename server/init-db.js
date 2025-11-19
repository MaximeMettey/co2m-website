const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const dbPath = path.join(__dirname, 'database', 'co2m.db');
const dbDir = path.dirname(dbPath);

// Create database directory if it doesn't exist
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

console.log('🗄️  Initializing database...');

// Create tables
db.exec(`
    -- Users table (admin)
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        email TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME
    );

    -- Services table
    CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        icon TEXT,
        short_description TEXT,
        full_description TEXT,
        features TEXT,
        order_index INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
        tags TEXT,
        technologies TEXT,
        project_url TEXT,
        github_url TEXT,
        gallery TEXT DEFAULT '[]',
        order_index INTEGER DEFAULT 0,
        is_featured BOOLEAN DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Stats table
    CREATE TABLE IF NOT EXISTS stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        icon TEXT,
        value INTEGER NOT NULL,
        label TEXT NOT NULL,
        unit TEXT,
        order_index INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Content sections table (for dynamic content like Hero, About, etc.)
    CREATE TABLE IF NOT EXISTS content_sections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        section_key TEXT UNIQUE NOT NULL,
        title TEXT,
        subtitle TEXT,
        content TEXT,
        metadata TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Settings table
    CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT,
        type TEXT DEFAULT 'text',
        category TEXT DEFAULT 'general',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Login attempts table (for brute force protection)
    CREATE TABLE IF NOT EXISTS login_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ip_address TEXT NOT NULL,
        username TEXT,
        success BOOLEAN DEFAULT 0,
        attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address);
    CREATE INDEX IF NOT EXISTS idx_login_attempts_time ON login_attempts(attempted_at);
`);

console.log('✅ Tables created');

// Insert admin user
const adminPassword = 'Admin@CO2M2024'; // Default password - MUST BE CHANGED
const passwordHash = bcrypt.hashSync(adminPassword, 10);

const insertAdmin = db.prepare('INSERT OR REPLACE INTO users (id, username, password_hash, email) VALUES (?, ?, ?, ?)');
insertAdmin.run(1, process.env.ADMIN_USERNAME || 'admin', passwordHash, 'maxime@co2m.net');

console.log('✅ Admin user created');
console.log(`   Username: ${process.env.ADMIN_USERNAME || 'admin'}`);
console.log(`   Password: ${adminPassword}`);
console.log('   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!');

// Insert services with complete data
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

const insertService = db.prepare(`
    INSERT INTO services (title, slug, icon, short_description, full_description, features, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?)
`);

services.forEach(service => {
    insertService.run(
        service.title,
        service.slug,
        service.icon,
        service.short_description,
        service.full_description,
        service.features,
        service.order_index
    );
});

console.log(`✅ ${services.length} services inserted`);

// Insert projects
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

const insertProject = db.prepare(`
    INSERT INTO projects (title, slug, icon, image, short_description, full_description, tags, technologies, gallery, order_index, is_featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

projects.forEach(project => {
    insertProject.run(
        project.title,
        project.slug,
        project.icon,
        project.image,
        project.short_description,
        project.full_description,
        project.tags,
        project.technologies,
        '[]', // gallery - empty by default
        project.order_index,
        project.is_featured
    );
});

console.log(`✅ ${projects.length} projects inserted`);

// Insert fun stats
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

const insertStat = db.prepare(`
    INSERT INTO stats (icon, value, label, unit, order_index)
    VALUES (?, ?, ?, ?, ?)
`);

stats.forEach(stat => {
    insertStat.run(stat.icon, stat.value, stat.label, stat.unit, stat.order_index);
});

console.log(`✅ ${stats.length} stats inserted`);

// Insert content sections (Hero, About, etc.)
const contentSections = [
    {
        section_key: 'hero',
        title: 'Des productions sur-mesure avec une haute expertise technique',
        subtitle: 'CO2M - WebDesign et Communication',
        content: 'Développeur Full-Stack basé à Belfort avec 14 ans d\'expérience. Je transforme vos idées en solutions digitales performantes et créatives.',
        metadata: JSON.stringify({
            cta_primary: 'Demander un devis gratuit',
            cta_secondary: 'Voir mes réalisations'
        })
    },
    {
        section_key: 'about',
        title: 'Maxime METTEY',
        subtitle: 'À propos',
        content: `Bonjour ! Je suis développeur full-stack freelance basé à Belfort (90, Franche-Comté), et j'accompagne mes clients depuis 14 ans dans la réalisation de leurs projets digitaux.

Mon approche ? Allier expertise technique pointue et créativité pour livrer des productions sur-mesure qui vous ressemblent vraiment. Pas de templates tout faits : chaque projet est une occasion de créer quelque chose d'unique.

Du développement d'applications complexes au design graphique, en passant par l'optimisation SEO/GEO, je maîtrise toute la chaîne de production digitale. Que vous soyez une startup, une PME ou une agence en recherche de compétences en marque blanche, je m'adapte à vos besoins.`,
        metadata: JSON.stringify({
            highlight: 'Ma philosophie : Donner une vraie identité humaine à vos projets, avec une dose d\'humour et de proximité. Parce que la tech, c\'est mieux quand c\'est accessible !',
            location: 'Belfort, Franche-Comté',
            location_detail: 'Interventions locales et nationales',
            experience: '14 ans dans le développement',
            experience_detail: 'Full-stack web & mobile',
            speciality: 'Du code à la création graphique',
            speciality_detail: 'Solutions complètes clés en main'
        })
    }
];

const insertSection = db.prepare(`
    INSERT INTO content_sections (section_key, title, subtitle, content, metadata)
    VALUES (?, ?, ?, ?, ?)
`);

contentSections.forEach(section => {
    insertSection.run(
        section.section_key,
        section.title,
        section.subtitle,
        section.content,
        section.metadata
    );
});

console.log(`✅ ${contentSections.length} content sections inserted`);

// Insert settings
const settings = [
    { key: 'site_title', value: 'CO2M - WebDesign et Communication', type: 'text', category: 'general' },
    { key: 'site_tagline', value: 'Développeur Full-Stack Belfort', type: 'text', category: 'general' },
    { key: 'site_description', value: 'CO2M - Maxime METTEY, expert développement web et mobile full-stack à Belfort. 14 ans d\'expérience en création de sites, applications, graphisme et solutions sur-mesure.', type: 'text', category: 'seo' },
    { key: 'contact_email', value: 'maxime@co2m.net', type: 'text', category: 'contact' },
    { key: 'contact_phone', value: '+33 (0)7.66.27.30.34', type: 'text', category: 'contact' },
    { key: 'contact_phone_raw', value: '+33766273034', type: 'text', category: 'contact' },
    { key: 'contact_location', value: 'Belfort (90), Franche-Comté', type: 'text', category: 'contact' },
    { key: 'contact_location_full', value: 'Belfort (90), Franche-Comté, France', type: 'text', category: 'contact' },
    { key: 'social_linkedin', value: '#', type: 'text', category: 'social' },
    { key: 'social_github', value: '#', type: 'text', category: 'social' },
    { key: 'social_twitter', value: '#', type: 'text', category: 'social' },
    { key: 'social_instagram', value: '#', type: 'text', category: 'social' },
    { key: 'footer_copyright', value: '© 2024 CO2M - Maxime METTEY. Tous droits réservés.', type: 'text', category: 'footer' },
    { key: 'footer_tagline', value: 'Développement web & mobile - Belfort, Franche-Comté', type: 'text', category: 'footer' }
];

const insertSetting = db.prepare(`
    INSERT INTO settings (key, value, type, category)
    VALUES (?, ?, ?, ?)
`);

settings.forEach(setting => {
    insertSetting.run(setting.key, setting.value, setting.type, setting.category);
});

console.log(`✅ ${settings.length} settings inserted`);

db.close();

console.log('\n🎉 Database initialization complete!');
console.log(`📁 Database file: ${dbPath}`);
console.log('\n⚠️  IMPORTANT: Change the admin password immediately!\n');
