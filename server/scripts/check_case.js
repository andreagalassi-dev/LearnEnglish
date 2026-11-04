const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

(async () => {
  try {
    const db = await open({
      filename: path.join(__dirname, '../database.sqlite'),
      driver: sqlite3.Database
    });
    
    console.log('Checking "Admin"...');
    const userCapital = await db.get("SELECT * FROM users WHERE username = ?", ['Admin']);
    console.log('Found with "Admin":', !!userCapital);

    console.log('Checking "admin"...');
    const userLower = await db.get("SELECT * FROM users WHERE username = ?", ['admin']);
    console.log('Found with "admin":', !!userLower);

  } catch (error) {
    console.error('Error:', error);
  }
})();
