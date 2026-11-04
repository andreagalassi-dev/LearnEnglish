const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

(async () => {
  try {
    const db = await open({
      filename: path.join(__dirname, '../database.sqlite'),
      driver: sqlite3.Database
    });
    
    // Add role column if it doesn't exist
    try {
      await db.exec('ALTER TABLE users ADD COLUMN role TEXT DEFAULT "user"');
      console.log('Added role column to users table.');
    } catch (error) {
      console.log('Role column likely already exists.');
    }

    // Promote Admin
    await db.run("UPDATE users SET role = 'admin' WHERE username = 'Admin'");
    console.log('Successfully promoted Admin user to admin role.');
  } catch (error) {
    console.error('Error promoting user:', error);
  }
})();
