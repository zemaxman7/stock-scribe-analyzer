# Supabase Data Saving Troubleshooting Guide

## ปัญหาที่เกิดขึ้น
ข้อผิดพลาด: "error ไม่สามารถบันทึกข้อมูลได้" (error cannot save data)

## ขั้นตอนการแก้ไขปัญหา

### 1. ตรวจสอบการเชื่อมต่อ Supabase
- เปิด Developer Console (F12)
- ไปที่หน้า Budget Request
- คลิกปุ่ม "ทดสอบการเชื่อมต่อฐานข้อมูล"
- ตรวจสอบผลลัพธ์ใน Console

### 2. ตรวจสอบข้อมูลที่ส่ง
- กรอกข้อมูลในฟอร์ม Budget Request
- กดส่งคำขอ
- ตรวจสอบ Console Logs สำหรับ:
  - Current request data
  - Filtered material list
  - Insert/Update data
  - Supabase errors

### 3. ปัญหาที่อาจเกิดขึ้น

#### A. การเชื่อมต่อฐานข้อมูล
```
Error: Network error
Error: Invalid API key
Error: Table not found
```
**วิธีแก้ไข:**
- ตรวจสอบ Supabase URL และ API Key ใน `src/lib/supabase.ts`
- ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต
- ตรวจสอบว่า Supabase Project ยังใช้งานได้

#### B. โครงสร้างตารางไม่ตรงกัน
```
Error: Column "field_name" does not exist
Error: Invalid data type
```
**วิธีแก้ไข:**
- ตรวจสอบ Database Schema ใน `database_setup.sql`
- ตรวจสอบ TypeScript types ใน `src/lib/supabase.ts`
- เปรียบเทียบ field names และ data types

#### C. ข้อมูลไม่ถูกต้อง
```
Error: Invalid input syntax
Error: Check constraint violation
```
**วิธีแก้ไข:**
- ตรวจสอบข้อมูลที่กรอกในฟอร์ม
- ตรวจสอบ validation rules
- ตรวจสอบ data types (string, number, date)

### 4. การตรวจสอบ Console Logs

#### ข้อมูลที่ควรปรากฏ:
```
Testing Supabase connection before proceeding...
Supabase connection test passed, proceeding with data save...
Current request data: {...}
Filtered material list: [...]
Creating new request with request number: BR-2024-XXX
Insert data: {...}
Successfully saved request: {...}
```

#### ข้อผิดพลาดที่อาจปรากฏ:
```
Supabase connection test failed: {...}
Supabase insert error: {...}
Error details: {...}
```

### 5. การตรวจสอบ Database Schema

#### ตาราง budget_requests:
```sql
CREATE TABLE budget_requests (
  id SERIAL PRIMARY KEY,
  request_no VARCHAR(100) NOT NULL UNIQUE,
  requester VARCHAR(255) NOT NULL,
  request_date DATE NOT NULL,
  account_code VARCHAR(50) NOT NULL,
  account_name VARCHAR(255),
  amount DECIMAL(12,2) NOT NULL,
  note TEXT,
  material_list JSONB DEFAULT '[]',
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6. การตรวจสอบ TypeScript Types

#### BudgetRequest Type:
```typescript
export type BudgetRequest = {
  id: number
  request_no: string
  requester: string
  request_date: string
  account_code: string
  account_name?: string
  amount: number
  note?: string
  material_list: Array<{
    item: string
    quantity: string
  }>
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  created_at: string
}
```

### 7. ขั้นตอนการทดสอบ

1. **ทดสอบการเชื่อมต่อ:**
   - คลิก "ทดสอบการเชื่อมต่อฐานข้อมูล"
   - ตรวจสอบ Console Logs

2. **ทดสอบการบันทึกข้อมูล:**
   - กรอกข้อมูลในฟอร์ม
   - กดส่งคำขอ
   - ตรวจสอบ Console Logs

3. **ตรวจสอบฐานข้อมูล:**
   - เปิด Supabase Dashboard
   - ไปที่ Table Editor
   - ตรวจสอบตาราง budget_requests

### 8. การรายงานปัญหา

หากยังไม่สามารถแก้ไขได้ กรุณาแจ้ง:
- ข้อความ error ที่ปรากฏใน Console
- ข้อมูลที่กรอกในฟอร์ม
- ผลลัพธ์จากการทดสอบการเชื่อมต่อ
- Screenshot ของ Console Logs

### 9. การแก้ไขปัญหาเบื้องต้น

1. **รีเฟรชหน้าเว็บ** - เพื่อรีเซ็ตการเชื่อมต่อ
2. **ตรวจสอบอินเทอร์เน็ต** - ตรวจสอบการเชื่อมต่อเครือข่าย
3. **ตรวจสอบ Supabase Status** - ตรวจสอบว่า Supabase ทำงานปกติ
4. **ตรวจสอบ Console Errors** - ดูรายละเอียดข้อผิดพลาด

### 10. การติดต่อผู้ดูแลระบบ

หากปัญหายังคงอยู่ กรุณาติดต่อ:
- แจ้งปัญหาใน GitHub Issues
- ส่งข้อมูล Console Logs
- ส่งข้อมูล Error Messages
- ส่ง Screenshot ของปัญหา
