const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

(async () => {
  try {
    const db = await open({
      filename: path.join(__dirname, '../database.sqlite'),
      driver: sqlite3.Database
    });
    
    // Update username to 'admin' (lowercase)
    await db.run("UPDATE users SET username = 'admin' WHERE username = 'Admin'");
    console.log('Updated username to "admin"');
    
  } catch (error) {
    console.error('Error:', error);
  }
})();
