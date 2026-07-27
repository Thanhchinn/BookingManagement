const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  try {
    const res = await pool.query('SELECT id, email, password, "full_name" FROM users');
    console.log('Comparing DB passwords with "admin123":');
    for (const row of res.rows) {
      const isMatch = await bcrypt.compare('admin123', row.password);
      console.log(`- User: ${row.email} | Name: ${row.full_name} | Matches "admin123"?: ${isMatch} | Hash: ${row.password.substring(0, 10)}...`);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    pool.end();
  }
}

check();
