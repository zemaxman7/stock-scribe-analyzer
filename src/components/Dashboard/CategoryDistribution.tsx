import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Package } from 'lucide-react';

interface CategoryData {
  id: string;
  name: string;
  productCount: number;
  totalValue: number;
}

interface CategoryDistributionProps {
  categories: CategoryData[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

export function CategoryDistribution({ categories }: CategoryDistributionProps) {
  const chartData = useMemo(() => {
    return categories.map((category, index) => ({
      name: category.name,
      value: category.totalValue,
      productCount: category.productCount,
      color: COLORS[index % COLORS.length]
    }));
  }, [categories]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('th-TH').format(value);
  };

  const totalValue = categories.reduce((sum, cat) => sum + cat.totalValue, 0);
  const totalProducts = categories.reduce((sum, cat) => sum + cat.productCount, 0);

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-purple-800 flex items-center">
          <Package className="h-5 w-5 mr-2" />
          การกระจายหมวดหมู่
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-white/70 rounded-lg border border-purple-200">
            <p className="text-2xl font-bold text-purple-800">{formatNumber(totalProducts)}</p>
            <p className="text-xs text-purple-600">รายการสินค้าทั้งหมด</p>
          </div>
          <div className="text-center p-3 bg-white/70 rounded-lg border border-purple-200">
            <p className="text-2xl font-bold text-purple-800">{formatCurrency(totalValue)}</p>
            <p className="text-xs text-purple-600">มูลค่ารวม</p>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => [formatCurrency(value), 'มูลค่า']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Category List */}
        <div className="space-y-2">
          {categories.map((category, index) => {
            const percentage = totalValue > 0 ? (category.totalValue / totalValue) * 100 : 0;
            return (
              <div key={category.id} className="flex items-center justify-between p-2 bg-white/70 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-sm font-medium text-purple-800">{category.name}</span>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                    {category.productCount} รายการ
                  </Badge>
                  <p className="text-xs text-purple-600 mt-1">
                    {percentage.toFixed(1)}% • {formatCurrency(category.totalValue)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {categories.length === 0 && (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-purple-300 mx-auto mb-3" />
            <p className="text-sm text-purple-600">ยังไม่มีข้อมูลหมวดหมู่</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
