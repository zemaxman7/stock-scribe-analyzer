import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'stock_analyzer',
  password: process.env.DB_PASSWORD || 'password',
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // อ่านไฟล์ SQL
    const sqlPath = path.join(process.cwd(), '..', 'database', 'init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // รันคำสั่ง SQL
    await pool.query(sql);
    
    console.log('✅ Database initialized successfully!');
    console.log('📊 Tables created:');
    console.log('  - categories');
    console.log('  - suppliers');
    console.log('  - products');
    console.log('  - movements');
    console.log('  - account_codes');
    console.log('  - budget_requests');
    console.log('  - approvals');
    console.log('🎯 Sample data inserted for account_codes and categories');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
  } finally {
    await pool.end();
  }
}

initializeDatabase();
