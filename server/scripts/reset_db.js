const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function resetDb() {
  try {
    const db = await open({
      filename: path.join(__dirname, '../database.sqlite'),
      driver: sqlite3.Database
    });

    console.log('Clearing user_data...');
    await db.run('DELETE FROM user_data');
    
    console.log('Clearing users...');
    await db.run('DELETE FROM users');

    console.log('Database reset successfully.');
  } catch (error) {
    console.error('Error resetting database:', error);
  }
}

resetDb();
