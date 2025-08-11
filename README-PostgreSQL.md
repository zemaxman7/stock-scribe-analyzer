# การเปลี่ยนไปใช้ PostgreSQL

โปรเจคนี้ได้อัพเดทให้ใช้ PostgreSQL ในเครื่อง แทนการใช้ Supabase

## การติดตั้งและตั้งค่า

### 1. ติดตั้ง PostgreSQL

#### Windows:
1. ดาวน์โหลด PostgreSQL จาก https://www.postgresql.org/download/windows/
2. ติดตั้งและตั้งรหัสผ่านสำหรับผู้ใช้ `postgres`
3. จดจำรหัสผ่านที่ตั้งไว้

#### macOS (ใช้ Homebrew):
```bash
brew install postgresql
brew services start postgresql
```

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

### 2. สร้างฐานข้อมูล

เชื่อมต่อ PostgreSQL และสร้างฐานข้อมูล:

```sql
-- เข้าใช้งาน psql
psql -U postgres

-- สร้างฐานข้อมูล
CREATE DATABASE stock_analyzer;

-- ออกจาก psql
\q
```

### 3. ตั้งค่าสภาพแวดล้อม

#### สำหรับ Backend:
1. ไปที่โฟลเดอร์ backend:
   ```bash
   cd backend
   ```

2. แก้ไขไฟล์ `.env` ให้ตรงกับการตั้งค่าฐานข้อมูลของคุณ:
   ```env
   DB_USER=postgres
   DB_PASSWORD=your_password_here
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=stock_analyzer
   PORT=3001
   ```

3. ติดตั้ง dependencies:
   ```bash
   npm install
   ```

4. เริ่มต้นฐานข้อมูล (สร้างตารางและข้อมูลตัวอย่าง):
   ```bash
   npm run init-db
   ```

5. รัน backend server:
   ```bash
   npm run dev
   ```

#### สำหรับ Frontend:
1. กลับไปยังโฟลเดอร์หลัก:
   ```bash
   cd ..
   ```

2. สร้างไฟล์ `.env` (ถ้ายังไม่มี) และเพิ่ม:
   ```env
   VITE_API_URL=http://localhost:3001/api
   ```

3. รัน frontend:
   ```bash
   npm run dev
   ```

### 4. ทดสอบการเชื่อมต่อ

1. เปิดเว็บเบราว์เซอร์ไปที่ http://localhost:8080
2. ตรวจสอบ backend API ที่ http://localhost:3001/api/health

## โครงสร้างโปรเจค

```
stock-scribe-analyzer/
├── backend/                 # Backend API Server
│   ├── server.js           # Express.js server
│   ├── init-db.js          # Database initialization script
│   ├── package.json        # Backend dependencies
│   └── .env               # Backend environment variables
├── database/
│   └── init.sql           # Database schema and initial data
├── src/
│   ├── lib/
│   │   ├── api.ts         # API client for frontend
│   │   └── database.ts    # Type definitions
│   └── contexts/
│       └── StockContext.tsx # Updated to use API instead of Supabase
└── README-PostgreSQL.md   # This file
```

## API Endpoints

Backend API มี endpoints ต่อไปนี้:

- `GET /api/health` - ตรวจสอบสถานะ
- `GET /api/categories` - ดึงหมวดหมู่ทั้งหมด
- `POST /api/categories` - สร้างหมวดหมู่ใหม่
- `GET /api/suppliers` - ดึงผู้จัดจำหน่ายทั้งหมด
- `POST /api/suppliers` - สร้างผู้จัดจำหน่ายใหม่
- `GET /api/products` - ดึงสินค้าทั้งหมด
- `POST /api/products` - สร้างสินค้าใหม่
- `GET /api/movements` - ดึงการเคลื่อนไหวสินค้า
- `POST /api/movements` - สร้างการเคลื่อนไหวใหม่
- `GET /api/budget-requests` - ดึงคำขอจัดซื้อ
- `POST /api/budget-requests` - สร้างคำขอจัดซื้อใหม่

## การแก้ไขปัญหา

### ไม่สามารถเชื่อมต่อฐานข้อมูลได้:
1. ตรวจสอบว่า PostgreSQL service รันอยู่
2. ตรวจสอบการตั้งค่าใน `.env`
3. ตรวจสอบว่าฐานข้อมูล `stock_analyzer` ถูกสร้างแล้ว

### Port ที่ใช้ถูกใช้งานแล้ว:
1. เปลี่ยน PORT ใน `backend/.env`
2. อัพเดท `VITE_API_URL` ใน frontend `.env`

### ข้อมูลไม่แสดงใน frontend:
1. ตรวจสอบว่า backend รันอยู่ที่ http://localhost:3001
2. เช็ค Network tab ใน Developer Tools เพื่อดู API calls
3. ตรวจสอบ console logs สำหรับข้อผิดพลาด

## การ Migration จาก Supabase

ไฟล์ที่มีการเปลี่ยนแปลงสำคัญ:
- `src/contexts/StockContext.tsx` - เปลี่ยนจากใช้ Supabase เป็น API calls
- `src/lib/api.ts` - API client ใหม่
- เพิ่มโฟลเดอร์ `backend/` สำหรับ API server
- เพิ่มโฟลเดอร์ `database/` สำหรับ SQL schema

หากต้องการใช้ Supabase ต่อ สามารถเปลี่ยนกลับไปใช้ `src/lib/supabase.ts` แทน `src/lib/api.ts` ใน StockContext ได้
