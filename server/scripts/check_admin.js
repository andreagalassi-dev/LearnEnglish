const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

(async () => {
  try {
    const db = await open({
      filename: path.join(__dirname, '../database.sqlite'),
      driver: sqlite3.Database
    });
    
    const user = await db.get("SELECT * FROM users WHERE username = 'Admin'");
    console.log('Admin User:', user);
  } catch (error) {
    console.error('Error checking user:', error);
  }
})();
