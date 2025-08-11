// Database Connection Test Script
// This script tests the connection to the Supabase database

import { createClient } from '@supabase/supabase-js'

// Database configuration
const supabaseUrl = 'https://zubrflyhzsmqngfbjkpg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1YnJmbHloenNtcW5nZmJqa3BnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MjA4NjAsImV4cCI6MjA2ODQ5Njg2MH0.SIDLeNDWphs1LxPLO5Mg37oCUB_8eAvfRIz5lCfle8g'

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testDatabaseConnection() {
  console.log('🔍 กำลังตรวจสอบการเชื่อมต่อฐานข้อมูล...')
  console.log('📍 Supabase URL:', supabaseUrl)
  console.log('🔑 API Key:', supabaseAnonKey.substring(0, 20) + '...')
  console.log('━'.repeat(50))

  try {
    // Test 1: Basic connection test
    console.log('1️⃣  ทดสอบการเชื่อมต่อพื้นฐาน...')
    const { data, error } = await supabase.from('categories').select('*').limit(1)
    
    if (error) {
      console.log('❌ การเชื่อมต่อล้มเหลว:', error.message)
      return false
    }
    console.log('✅ การเชื่อมต่อสำเร็จ!')

    // Test 2: Check tables exist
    console.log('\n2️⃣  ตรวจสอบตารางในฐานข้อมูล...')
    
    const tables = [
      { name: 'categories', description: 'หมวดหมู่สินค้า' },
      { name: 'suppliers', description: 'ผู้จัดหา' },
      { name: 'products', description: 'สินค้า' },
      { name: 'movements', description: 'การเคลื่อนไหวสต็อก' },
      { name: 'account_codes', description: 'รหัสบัญชี' },
      { name: 'budget_requests', description: 'คำขออนุมัติงบประมาณ' },
      { name: 'approvals', description: 'การอนุมัติ' }
    ]

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table.name)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`   ❌ ${table.name} (${table.description}): ${error.message}`)
        } else {
          console.log(`   ✅ ${table.name} (${table.description}): พบตาราง`)
        }
      } catch (err) {
        console.log(`   ❌ ${table.name} (${table.description}): ${err.message}`)
      }
    }

    // Test 3: Get data counts
    console.log('\n3️⃣  นับจำนวนข้อมูลในแต่ละตาราง...')
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table.name)
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          console.log(`   ${table.name}: ไม่สามารถนับได้ (${error.message})`)
        } else {
          console.log(`   ${table.name}: ${count} รายการ`)
        }
      } catch (err) {
        console.log(`   ${table.name}: ข้อผิดพลาด (${err.message})`)
      }
    }

    // Test 4: Test sample queries
    console.log('\n4️⃣  ทดสอบคำสั่ง SQL ตัวอย่าง...')
    
    try {
      const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .limit(3)
      
      console.log('   ✅ ดึงข้อมูลหมวดหมู่สินค้า:', categories?.length || 0, 'รายการ')
      
      if (categories && categories.length > 0) {
        console.log('   📋 ตัวอย่างหมวดหมู่:')
        categories.forEach((cat, index) => {
          console.log(`      ${index + 1}. ${cat.name} - ${cat.description}`)
        })
      }
    } catch (err) {
      console.log('   ❌ ไม่สามารถดึงข้อมูลหมวดหมู่ได้:', err.message)
    }

    console.log('\n━'.repeat(50))
    console.log('🎉 การตรวจสอบเสร็จสมบูรณ์!')
    console.log('💡 ข้อแนะนำ:')
    console.log('   - หากพบข้อผิดพลาด ให้ตรวจสอบ Supabase URL และ API Key')
    console.log('   - ตรวจสอบว่าตารางถูกสร้างแล้วใน Supabase Dashboard')
    console.log('   - ตรวจสอบ RLS (Row Level Security) policies')
    
    return true

  } catch (error) {
    console.log('\n❌ เกิดข้อผิดพลาดในการทดสอบ:')
    console.log('   ', error.message)
    console.log('\n💡 วิธีแก้ไข:')
    console.log('   1. ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต')
    console.log('   2. ตรวจสอบ Supabase URL และ API Key')
    console.log('   3. ตรวจสอบสถานะ Supabase project ใน dashboard')
    
    return false
  }
}

// Run the test
testDatabaseConnection()
  .then((success) => {
    if (success) {
      console.log('\n✨ การเชื่อมต่อฐานข้อมูลพร้อมใช้งาน!')
      process.exit(0)
    } else {
      console.log('\n⚠️  พบปัญหาในการเชื่อมต่อฐานข้อมูล')
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error('\n💥 เกิดข้อผิดพลาดที่ไม่คาดคิด:', error)
    process.exit(1)
  })
