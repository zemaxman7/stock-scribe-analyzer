import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'stock_analyzer',
  password: process.env.DB_PASSWORD || 'password',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'OK', 
      database: 'Connected',
      time: result.rows[0].now 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'Error', 
      message: error.message 
    });
  }
});

// Categories API
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { name, description, is_medicine } = req.body;
    const result = await pool.query(
      'INSERT INTO categories (name, description, is_medicine) VALUES ($1, $2, $3) RETURNING *',
      [name, description, is_medicine || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_medicine } = req.body;
    const result = await pool.query(
      'UPDATE categories SET name = COALESCE($2, name), description = COALESCE($3, description), is_medicine = COALESCE($4, is_medicine) WHERE id = $1 RETURNING *',
      [id, name, description, is_medicine]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Suppliers API
app.get('/api/suppliers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM suppliers ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/suppliers', async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const result = await pool.query(
      'INSERT INTO suppliers (name, email, phone, address) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, phone, address]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/suppliers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;
    const result = await pool.query(
      'UPDATE suppliers SET name = COALESCE($2, name), email = COALESCE($3, email), phone = COALESCE($4, phone), address = COALESCE($5, address) WHERE id = $1 RETURNING *',
      [id, name, email, phone, address]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/suppliers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM suppliers WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Products API
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, c.name as category_name, s.name as supplier_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      LEFT JOIN suppliers s ON p.supplier_id = s.id 
      ORDER BY p.name
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { 
      name, sku, description, category_id, supplier_id, unit_price, 
      current_stock, min_stock, max_stock, unit, location, barcode, expiry_date 
    } = req.body;
    
    const result = await pool.query(`
      INSERT INTO products (name, sku, description, category_id, supplier_id, unit_price, 
                          current_stock, min_stock, max_stock, unit, location, barcode, expiry_date) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [name, sku, description, category_id, supplier_id, unit_price,
       current_stock, min_stock, max_stock, unit, location, barcode, expiry_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, sku, description, category_id, supplier_id, unit_price, 
      current_stock, min_stock, max_stock, unit, location, barcode, expiry_date 
    } = req.body;
    
    const result = await pool.query(`
      UPDATE products SET 
        name = COALESCE($2, name),
        sku = COALESCE($3, sku),
        description = COALESCE($4, description),
        category_id = COALESCE($5, category_id),
        supplier_id = COALESCE($6, supplier_id),
        unit_price = COALESCE($7, unit_price),
        current_stock = COALESCE($8, current_stock),
        min_stock = COALESCE($9, min_stock),
        max_stock = COALESCE($10, max_stock),
        unit = COALESCE($11, unit),
        location = COALESCE($12, location),
        barcode = COALESCE($13, barcode),
        expiry_date = COALESCE($14, expiry_date)
      WHERE id = $1 RETURNING *`,
      [id, name, sku, description, category_id, supplier_id, unit_price,
       current_stock, min_stock, max_stock, unit, location, barcode, expiry_date]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Movements API
app.get('/api/movements', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, p.name as product_name, p.sku 
      FROM movements m 
      LEFT JOIN products p ON m.product_id = p.id 
      ORDER BY m.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/movements', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { product_id, type, quantity, reason, reference, notes, created_by } = req.body;

    // สร้างรายการเคลื่อนไหว
    const movementResult = await client.query(`
      INSERT INTO movements (product_id, type, quantity, reason, reference, notes, created_by) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [product_id, type, quantity, reason, reference, notes, created_by]
    );

    // อัพเดทสต็อกสินค้า
    const stockChange = type === 'in' ? quantity : -quantity;
    await client.query(
      'UPDATE products SET current_stock = current_stock + $1 WHERE id = $2',
      [stockChange, product_id]
    );

    await client.query('COMMIT');
    res.status(201).json(movementResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Account Codes API
app.get('/api/account-codes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM account_codes ORDER BY code');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Budget Requests API
app.get('/api/budget-requests', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM budget_requests ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/budget-requests', async (req, res) => {
  try {
    const { request_no, requester, request_date, account_code, account_name, amount, note, material_list, status } = req.body;
    const result = await pool.query(`
      INSERT INTO budget_requests (request_no, requester, request_date, account_code, account_name, 
                                  amount, note, material_list, status) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [request_no, requester, request_date, account_code, account_name, amount, note, 
       JSON.stringify(material_list), status || 'PENDING']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/budget-requests/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await pool.query(
      'UPDATE budget_requests SET status = $2 WHERE id = $1 RETURNING *',
      [id, status]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approvals API
app.get('/api/approvals', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, br.request_no 
      FROM approvals a 
      LEFT JOIN budget_requests br ON a.request_id = br.id 
      ORDER BY a.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/approvals', async (req, res) => {
  try {
    const { request_id, decision, remark, approver_name } = req.body;
    const result = await pool.query(`
      INSERT INTO approvals (request_id, decision, remark, approver_name) 
      VALUES ($1, $2, $3, $4) RETURNING *`,
      [request_id, decision, remark, approver_name]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Backend server running on http://localhost:${port}`);
  console.log(`📊 API endpoints available at http://localhost:${port}/api/`);
});
