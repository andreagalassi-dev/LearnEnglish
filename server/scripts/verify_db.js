const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

(async () => {
  try {
    const dbPath = path.join(__dirname, '../database.sqlite');
    console.log('Opening database at:', dbPath);
    
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    console.log('Database opened successfully.');
    
    const users = await db.all("SELECT id, username, role FROM users");
    console.log('Total users:', users.length);
    
    const admin = users.find(u => u.username === 'admin');
    if (admin) {
      console.log('Admin user found:', admin);
    } else {
      console.log('Admin user NOT found (checking case sensitivity...)');
      const adminCap = users.find(u => u.username.toLowerCase() === 'admin');
      if (adminCap) {
        console.log('Admin user found with different casing:', adminCap);
      } else {
        console.error('CRITICAL: Admin user missing!');
      }
    }

  } catch (error) {
    console.error('Database Error:', error);
  }
})();
