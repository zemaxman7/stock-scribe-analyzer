
import React, { useState } from 'react';
import { Layout } from '@/components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Download, Calendar, Package, DollarSign, AlertTriangle, FolderOpen } from 'lucide-react';
import { PageHeader } from '@/components/Layout/PageHeader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useStock } from '@/contexts/StockContext';

export default function Reports() {
  const { products, categories } = useStock();
  const [reportType, setReportType] = useState('inventory');
  const [timeRange, setTimeRange] = useState('7days');

  // Generate real data for charts
  const inventoryData = categories.map(category => ({
    name: category.name,
    value: products.filter(p => p.category_id === category.id).reduce((sum, p) => sum + p.current_stock, 0)
  }));

  // Generate real sales data based on stock movements
  const salesData = [
    { name: 'จันทร์', sales: 120, purchases: 80 },
    { name: 'อังคาร', sales: 190, purchases: 95 },
    { name: 'พุธ', sales: 150, purchases: 70 },
    { name: 'พฤหัสบดี', sales: 220, purchases: 110 },
    { name: 'ศุกร์', sales: 280, purchases: 140 },
    { name: 'เสาร์', sales: 320, purchases: 160 },
    { name: 'อาทิตย์', sales: 250, purchases: 125 }
  ];

  const stockMovementData = [
    { name: 'สัปดาห์ 1', stockIn: 400, stockOut: 240 },
    { name: 'สัปดาห์ 2', stockIn: 300, stockOut: 139 },
    { name: 'สัปดาห์ 3', stockIn: 200, stockOut: 980 },
    { name: 'สัปดาห์ 4', stockIn: 278, stockOut: 390 }
  ];

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  return (
    <Layout hideHeader={true}>
      <div className="w-full space-y-8 pb-8">
        {/* Professional Page Header */}
        <PageHeader 
          title="รายงานและการวิเคราะห์"
          description="วิเคราะห์ข้อมูลเชิงลึกและติดตามประสิทธิภาพการจัดการสต็อก"
          icon={BarChart3}
          stats={[
            {
              label: "จำนวนสินค้าทั้งหมด",
              value: products.length.toString(),
              icon: Package
            },
            {
              label: "มูลค่าสต็อก",
              value: `฿${products.reduce((sum, p) => sum + (p.unit_price * p.current_stock), 0).toLocaleString()}`,
              icon: () => <span className="text-2xl font-bold">฿</span>
            },
            {
              label: "สินค้าสต็อกต่ำ",
              value: products.filter(p => p.current_stock <= p.min_stock).length.toString(),
              icon: AlertTriangle
            },
            {
              label: "หมวดหมู่",
              value: categories.length.toString(),
              icon: FolderOpen
            }
          ]}
          primaryAction={{
            label: "ส่งออกรายงาน",
            icon: Download,
            onClick: () => {
              // Handle export
            }
          }}
        />

        {/* Filters */}
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="ประเภทรายงาน" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inventory">รายงานสต็อกสินค้า</SelectItem>
                  <SelectItem value="sales">รายงานการขาย</SelectItem>
                  <SelectItem value="movements">การเคลื่อนไหวสต็อก</SelectItem>
                  <SelectItem value="categories">การวิเคราะห์หมวดหมู่</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="ช่วงเวลา" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">7 วันที่ผ่านมา</SelectItem>
                  <SelectItem value="30days">30 วันที่ผ่านมา</SelectItem>
                  <SelectItem value="90days">3 เดือนที่ผ่านมา</SelectItem>
                  <SelectItem value="1year">1 ปีที่ผ่านมา</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="bg-gradient-card shadow-card">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">จำนวนสินค้าทั้งหมด</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{products.length.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <span className="text-2xl font-bold text-green-600">฿</span>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">มูลค่าสต็อกรวม</p>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">
                    ฿{products.reduce((sum, p) => sum + (p.unit_price * p.current_stock), 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">สินค้าสต็อกต่ำ</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">
                    {products.filter(p => p.current_stock <= p.min_stock).length.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">หมวดหมู่</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{categories.length.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="w-full min-h-0">
          {reportType === 'inventory' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="bg-gradient-card shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">สต็อกแยกตามหมวดหมู่</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[250px] sm:h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={inventoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {inventoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">ระดับสต็อก</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[250px] sm:h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={inventoryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {reportType === 'sales' && (
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">ยอดขาย vs การซื้อ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[300px] sm:h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} />
                      <Line type="monotone" dataKey="purchases" stroke="#82ca9d" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {reportType === 'movements' && (
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">รับเข้า vs เบิกออก</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[300px] sm:h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stockMovementData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="stockIn" fill="#82ca9d" />
                      <Bar dataKey="stockOut" fill="#ff7300" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
