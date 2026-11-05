const { Pool } = require('pg');

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('Thiếu biến môi trường DATABASE_URL để kết nối PostgreSQL.');
  }
  const pool = new Pool({
    connectionString: dbUrl
  });
  try {
    const res = await pool.query('SELECT a.id, a.name, a.status, ap.provider_name FROM apis a JOIN api_providers ap ON ap.id = a.provider_id ORDER BY a.id LIMIT 10');
    console.log('APIS_IN_DB:', res.rows);
    const cols = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'api_plans'`);
    console.log('API_PLANS_COLS:', cols.rows);
    const plans = await pool.query('SELECT * FROM api_plans LIMIT 5');
    console.log('PLANS_IN_DB:', plans.rows);
  } catch (err) {
    console.log('POSTGRES_ERROR:', err.message);
  } finally {
    await pool.end();
  }
}

main();
