const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

let db;

async function initDb() {
  if (db) return db;

  db = await open({
    filename: path.join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_data (
      user_id INTEGER PRIMARY KEY,
      data TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Check if role column exists (for existing databases)
  try {
    await db.exec('ALTER TABLE users ADD COLUMN role TEXT DEFAULT "user"');
    console.log('Added role column to users table');
  } catch (error) {
    // Column likely already exists, ignore error
  }

  // Seed Admin user
  const adminUser = await db.get('SELECT * FROM users WHERE username = ?', ['Admin']);
  if (!adminUser) {
    const bcrypt = require('bcrypt');
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('Admin', salt);
    await db.run('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)', ['Admin', hash, 'admin']);
    console.log('Created default Admin user');
  }

  console.log('Database initialized');
  return db;
}

function getDb() {
  if (!db) throw new Error('Database not initialized');
  return db;
}

module.exports = { initDb, getDb };
