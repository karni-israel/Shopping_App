const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '123456',
  database: 'shopping_db',
});

async function fixDuplicates() {
  try {
    await client.connect();
    console.log('Connected to database');

    // First, find the duplicate user IDs
    const dupQuery = await client.query(`
      SELECT id FROM "users" a WHERE a.id NOT IN (
        SELECT MIN(id) FROM "users" GROUP BY email
      )
    `);

    const duplicateIds = dupQuery.rows.map(row => row.id);
    console.log('Found duplicate IDs to remove:', duplicateIds);

    if (duplicateIds.length === 0) {
      console.log('No duplicates found');
      return;
    }

    // Delete related records in order_items and orders
    for (const id of duplicateIds) {
      await client.query(`
        DELETE FROM "order_items" WHERE "orderId" IN (
          SELECT id FROM "orders" WHERE "userId" = $1
        )
      `, [id]);

      await client.query(`
        DELETE FROM "orders" WHERE "userId" = $1
      `, [id]);

      await client.query(`
        DELETE FROM "cart_items" WHERE "cartId" IN (
          SELECT id FROM "carts" WHERE "userId" = $1
        )
      `, [id]);

      await client.query(`
        DELETE FROM "carts" WHERE "userId" = $1
      `, [id]);
    }

    // Now delete the duplicate users
    const result = await client.query(`
      DELETE FROM "users" WHERE id = ANY($1)
    `, [duplicateIds]);

    console.log(`Deleted ${result.rowCount} duplicate user records`);
    
    // Verify the fix
    const verify = await client.query(`
      SELECT COUNT(*) FROM "users";
    `);
    console.log(`Total users after cleanup: ${verify.rows[0].count}`);

    // Check for any remaining duplicates
    const dupCheck = await client.query(`
      SELECT email, COUNT(*) FROM "users" GROUP BY email HAVING COUNT(*) > 1;
    `);
    
    if (dupCheck.rows.length === 0) {
      console.log('✓ No more duplicate emails found!');
    } else {
      console.log('⚠ Still found duplicates:', dupCheck.rows);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

fixDuplicates();
