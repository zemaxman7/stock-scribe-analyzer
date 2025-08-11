import pool from '../lib/database';
import {
  AccountCode,
  Category,
  Supplier,
  Product,
  Movement,
  BudgetRequest,
  Approval
} from '../lib/database';

// Categories Service
export const categoriesService = {
  async getAll(): Promise<Category[]> {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    return result.rows;
  },

  async create(category: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
    const result = await pool.query(
      'INSERT INTO categories (name, description, is_medicine) VALUES ($1, $2, $3) RETURNING *',
      [category.name, category.description, category.is_medicine || false]
    );
    return result.rows[0];
  },

  async update(id: string, category: Partial<Category>): Promise<Category> {
    const result = await pool.query(
      'UPDATE categories SET name = COALESCE($2, name), description = COALESCE($3, description), is_medicine = COALESCE($4, is_medicine) WHERE id = $1 RETURNING *',
      [id, category.name, category.description, category.is_medicine]
    );
    return result.rows[0];
  },

  async delete(id: string): Promise<void> {
    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
  }
};

// Suppliers Service
export const suppliersService = {
  async getAll(): Promise<Supplier[]> {
    const result = await pool.query('SELECT * FROM suppliers ORDER BY name');
    return result.rows;
  },

  async create(supplier: Omit<Supplier, 'id' | 'created_at'>): Promise<Supplier> {
    const result = await pool.query(
      'INSERT INTO suppliers (name, email, phone, address) VALUES ($1, $2, $3, $4) RETURNING *',
      [supplier.name, supplier.email, supplier.phone, supplier.address]
    );
    return result.rows[0];
  },

  async update(id: string, supplier: Partial<Supplier>): Promise<Supplier> {
    const result = await pool.query(
      'UPDATE suppliers SET name = COALESCE($2, name), email = COALESCE($3, email), phone = COALESCE($4, phone), address = COALESCE($5, address) WHERE id = $1 RETURNING *',
      [id, supplier.name, supplier.email, supplier.phone, supplier.address]
    );
    return result.rows[0];
  },

  async delete(id: string): Promise<void> {
    await pool.query('DELETE FROM suppliers WHERE id = $1', [id]);
  }
};

// Products Service
export const productsService = {
  async getAll(): Promise<Product[]> {
    const result = await pool.query(`
      SELECT p.*, c.name as category_name, s.name as supplier_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      LEFT JOIN suppliers s ON p.supplier_id = s.id 
      ORDER BY p.name
    `);
    return result.rows;
  },

  async getById(id: string): Promise<Product | null> {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async getBySku(sku: string): Promise<Product | null> {
    const result = await pool.query('SELECT * FROM products WHERE sku = $1', [sku]);
    return result.rows[0] || null;
  },

  async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const result = await pool.query(`
      INSERT INTO products (name, sku, description, category_id, supplier_id, unit_price, 
                          current_stock, min_stock, max_stock, unit, location, barcode, expiry_date) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [product.name, product.sku, product.description, product.category_id, product.supplier_id,
       product.unit_price, product.current_stock, product.min_stock, product.max_stock,
       product.unit, product.location, product.barcode, product.expiry_date]
    );
    return result.rows[0];
  },

  async update(id: string, product: Partial<Product>): Promise<Product> {
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
      [id, product.name, product.sku, product.description, product.category_id, product.supplier_id,
       product.unit_price, product.current_stock, product.min_stock, product.max_stock,
       product.unit, product.location, product.barcode, product.expiry_date]
    );
    return result.rows[0];
  },

  async delete(id: string): Promise<void> {
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
  }
};

// Movements Service
export const movementsService = {
  async getAll(): Promise<Movement[]> {
    const result = await pool.query(`
      SELECT m.*, p.name as product_name, p.sku 
      FROM movements m 
      LEFT JOIN products p ON m.product_id = p.id 
      ORDER BY m.created_at DESC
    `);
    return result.rows;
  },

  async create(movement: Omit<Movement, 'id' | 'created_at'>): Promise<Movement> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // สร้างรายการเคลื่อนไหว
      const movementResult = await client.query(`
        INSERT INTO movements (product_id, type, quantity, reason, reference, notes, created_by) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [movement.product_id, movement.type, movement.quantity, movement.reason, 
         movement.reference, movement.notes, movement.created_by]
      );

      // อัพเดทสต็อกสินค้า
      const stockChange = movement.type === 'in' ? movement.quantity : -movement.quantity;
      await client.query(
        'UPDATE products SET current_stock = current_stock + $1 WHERE id = $2',
        [stockChange, movement.product_id]
      );

      await client.query('COMMIT');
      return movementResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
};

// Account Codes Service
export const accountCodesService = {
  async getAll(): Promise<AccountCode[]> {
    const result = await pool.query('SELECT * FROM account_codes ORDER BY code');
    return result.rows;
  }
};

// Budget Requests Service
export const budgetRequestsService = {
  async getAll(): Promise<BudgetRequest[]> {
    const result = await pool.query('SELECT * FROM budget_requests ORDER BY created_at DESC');
    return result.rows;
  },

  async create(request: Omit<BudgetRequest, 'id' | 'created_at'>): Promise<BudgetRequest> {
    const result = await pool.query(`
      INSERT INTO budget_requests (request_no, requester, request_date, account_code, account_name, 
                                  amount, note, material_list, status) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [request.request_no, request.requester, request.request_date, request.account_code,
       request.account_name, request.amount, request.note, JSON.stringify(request.material_list),
       request.status || 'PENDING']
    );
    return result.rows[0];
  },

  async updateStatus(id: number, status: string): Promise<BudgetRequest> {
    const result = await pool.query(
      'UPDATE budget_requests SET status = $2 WHERE id = $1 RETURNING *',
      [id, status]
    );
    return result.rows[0];
  }
};

// Approvals Service
export const approvalsService = {
  async getAll(): Promise<Approval[]> {
    const result = await pool.query(`
      SELECT a.*, br.request_no 
      FROM approvals a 
      LEFT JOIN budget_requests br ON a.request_id = br.id 
      ORDER BY a.created_at DESC
    `);
    return result.rows;
  },

  async create(approval: Omit<Approval, 'id' | 'created_at'>): Promise<Approval> {
    const result = await pool.query(`
      INSERT INTO approvals (request_id, decision, remark, approver_name) 
      VALUES ($1, $2, $3, $4) RETURNING *`,
      [approval.request_id, approval.decision, approval.remark, approval.approver_name]
    );
    return result.rows[0];
  }
};
