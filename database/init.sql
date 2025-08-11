-- สร้างฐานข้อมูล stock_analyzer (รันใน PostgreSQL admin tool หรือ psql)
-- CREATE DATABASE stock_analyzer;

-- ใช้ฐานข้อมูล stock_analyzer
-- \c stock_analyzer;

-- สร้างตาราง categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_medicine BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- สร้างตาราง suppliers
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- สร้างตาราง products
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    current_stock INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 0,
    max_stock INTEGER,
    unit VARCHAR(50),
    location VARCHAR(255),
    barcode VARCHAR(255),
    expiry_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- สร้างตาราง movements (การเคลื่อนไหวสินค้า)
CREATE TABLE IF NOT EXISTS movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('in', 'out')),
    quantity INTEGER NOT NULL,
    reason VARCHAR(255) NOT NULL,
    reference VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255)
);

-- สร้างตาราง account_codes
CREATE TABLE IF NOT EXISTS account_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL
);

-- สร้างตาราง budget_requests
CREATE TABLE IF NOT EXISTS budget_requests (
    id SERIAL PRIMARY KEY,
    request_no VARCHAR(50) UNIQUE NOT NULL,
    requester VARCHAR(255) NOT NULL,
    request_date DATE NOT NULL,
    account_code VARCHAR(50) NOT NULL,
    account_name VARCHAR(255),
    amount DECIMAL(15,2) NOT NULL,
    note TEXT,
    material_list JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- สร้างตาราง approvals
CREATE TABLE IF NOT EXISTS approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id INTEGER REFERENCES budget_requests(id) ON DELETE CASCADE,
    decision VARCHAR(20) NOT NULL,
    remark TEXT,
    approver_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- สร้าง indexes สำหรับการค้นหาที่เร็วขึ้น
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_movements_product ON movements(product_id);
CREATE INDEX IF NOT EXISTS idx_movements_created_at ON movements(created_at);
CREATE INDEX IF NOT EXISTS idx_budget_requests_status ON budget_requests(status);
CREATE INDEX IF NOT EXISTS idx_budget_requests_request_no ON budget_requests(request_no);

-- สร้าง trigger สำหรับการอัพเดท updated_at ใน products
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- เพิ่มข้อมูลตัวอย่าง account_codes
INSERT INTO account_codes (code, name) VALUES 
    ('ACC001', 'วัสดุสำนักงาน'),
    ('ACC002', 'วัสดุการแพทย์'),
    ('ACC003', 'อุปกรณ์ไฟฟ้า'),
    ('ACC004', 'วัสดุก่อสร้าง'),
    ('ACC005', 'วัสดุทำความสะอาด')
ON CONFLICT (code) DO NOTHING;

-- เพิ่มข้อมูลตัวอย่าง categories
INSERT INTO categories (name, description, is_medicine) VALUES 
    ('วัสดุการแพทย์', 'ยาและเวชภัณฑ์', true),
    ('วัสดุสำนักงาน', 'อุปกรณ์สำนักงานทั่วไป', false),
    ('อุปกรณ์ไฟฟ้า', 'อุปกรณ์และเครื่องใช้ไฟฟ้า', false),
    ('วัสดุทำความสะอาด', 'น้ำยาและอุปกรณ์ทำความสะอาด', false)
ON CONFLICT DO NOTHING;
