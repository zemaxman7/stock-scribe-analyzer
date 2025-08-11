import { Pool } from 'pg';

// การตั้งค่าการเชื่อมต่อ PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'stock_analyzer',
  password: process.env.DB_PASSWORD || 'password',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Test การเชื่อมต่อ
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database error:', err);
});

export default pool;

// Types
export type AccountCode = {
  id: number;
  code: string;
  name: string;
};

export type Category = {
  id: string;
  name: string;
  description: string;
  is_medicine?: boolean;
  created_at?: string;
};

export type Supplier = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at?: string;
};

export type Product = {
  id: string;
  name: string;
  sku: string;
  description?: string;
  category_id: string;
  supplier_id: string;
  unit_price: number;
  current_stock: number;
  min_stock: number;
  max_stock?: number;
  unit?: string;
  location?: string;
  barcode?: string;
  expiry_date?: string;
  created_at?: string;
  updated_at?: string;
};

export type Movement = {
  id: string;
  product_id: string;
  type: 'in' | 'out';
  quantity: number;
  reason: string;
  reference?: string;
  notes?: string;
  created_at: string;
  created_by?: string;
};

export type BudgetRequest = {
  id: number;
  request_no: string;
  requester: string;
  request_date: string;
  account_code: string;
  account_name?: string;
  amount: number;
  note?: string;
  material_list: Array<{
    item: string;
    quantity: string;
  }>;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
};

export type Approval = {
  id: string;
  request_id: string;
  decision: string;
  remark?: string;
  approver_name: string;
  created_at: string;
};
