const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../database/co2m.db');
const db = new Database(dbPath);

try {
    console.log('Adding gallery column to projects table...');

    // Add gallery column (JSON array of image URLs)
    db.prepare(`
        ALTER TABLE projects
        ADD COLUMN gallery TEXT DEFAULT '[]'
    `).run();

    console.log('✅ Gallery column added successfully!');

} catch (error) {
    console.error('Error adding gallery column:', error.message);
    process.exit(1);
} finally {
    db.close();
}
