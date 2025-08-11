# คู่มือแก้ไขปัญหา EmailJS - การส่งอีเมลขอใช้งบประมาณ

## ปัญหาที่พบบ่อย

### 1. ข้อผิดพลาด "ไม่สามารถส่งอีเมลได้"

**สาเหตุที่เป็นไปได้:**
- EmailJS ไม่ได้ถูกเริ่มต้น (initialization failed)
- Service ID, Template ID, หรือ Public Key ไม่ถูกต้อง
- EmailJS service ถูกระงับการใช้งาน
- ปัญหาการเชื่อมต่ออินเทอร์เน็ต

**วิธีแก้ไข:**
1. เปิด Developer Console (F12) และดู error messages
2. ใช้ปุ่ม "ทดสอบการเชื่อมต่อ EmailJS" ในหน้าเพิ่มคำขอ
3. ตรวจสอบสถานะ EmailJS (สีเขียว = พร้อมใช้งาน, สีแดง = ไม่พร้อมใช้งาน)

### 2. การตั้งค่า EmailJS

**ข้อมูลที่จำเป็น:**
- **Public Key**: `MK2OUomFmzWPrHpMW`
- **Service ID**: `service_f2t090t`
- **Template ID**: `template_7xibgbq`

**ขั้นตอนการตรวจสอบ:**
1. เข้าสู่ [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. ตรวจสอบว่า Service และ Template ยังใช้งานได้
3. ตรวจสอบ Public Key ว่าถูกต้อง

### 3. การสร้างไฟล์ .env (แนะนำ)

สร้างไฟล์ `.env` ในโฟลเดอร์หลักของโปรเจค:

```env
VITE_EMAILJS_PUBLIC_KEY=MK2OUomFmzWPrHpMW
VITE_EMAILJS_SERVICE_ID=service_f2t090t
VITE_EMAILJS_TEMPLATE_ID=template_7xibgbq
```

### 4. การทดสอบการเชื่อมต่อ

1. เปิดหน้า "ขอใช้งบประมาณ"
2. คลิก "เพิ่มคำขออนุมัติ"
3. กรอกข้อมูลพื้นฐาน
4. คลิก "ส่งคำขออนุมัติ"
5. ในหน้าตัวอย่างอีเมล ให้คลิก "ทดสอบการเชื่อมต่อ EmailJS"

### 5. ข้อความ Error ที่พบบ่อย

| Error Code | ความหมาย | วิธีแก้ไข |
|------------|----------|-----------|
| 404 | Service ID หรือ Template ID ไม่ถูกต้อง | ตรวจสอบการตั้งค่าใน EmailJS Dashboard |
| 401 | ไม่มีสิทธิ์ในการส่งอีเมล | ตรวจสอบ Public Key |
| 400 | ข้อมูลที่ส่งไม่ถูกต้อง | ตรวจสอบ template variables |
| 500 | ข้อผิดพลาดที่เซิร์ฟเวอร์ EmailJS | ลองใหม่ภายหลัง |
| 0 | ปัญหาการเชื่อมต่อ | ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต |

### 6. การตรวจสอบ Console Logs

เปิด Developer Console (F12) และดู:
- `EmailJS initialized successfully` = เริ่มต้นสำเร็จ
- `EmailJS Config:` = แสดงการตั้งค่า
- `EmailJS Template Parameters:` = แสดงข้อมูลที่จะส่ง
- `EmailJS response:` = การตอบกลับจาก EmailJS

### 7. การติดต่อผู้ดูแลระบบ

หากยังไม่สามารถแก้ไขได้:
1. บันทึก error messages จาก console
2. บันทึก screenshot ของหน้าจอ
3. ติดต่อผู้ดูแลระบบพร้อมข้อมูลข้างต้น

## หมายเหตุ

- EmailJS เป็นบริการภายนอกที่ต้องมีการเชื่อมต่ออินเทอร์เน็ต
- การส่งอีเมลอาจใช้เวลาสักครู่
- หากมีปัญหา ให้ลองรีเฟรชหน้าเว็บก่อน
