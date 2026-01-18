const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '123456',
  database: 'shopping_db',
});

async function checkTables() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Get all table names
    const result = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('Tables in database:');
    result.rows.forEach(row => {
      console.log('  -', row.table_name);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkTables();
