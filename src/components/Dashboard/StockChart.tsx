import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStock } from '@/contexts/StockContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

export function StockChart() {
  const { products, movements } = useStock();

  // Generate mock data for the last 7 days
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    return last7Days.map(date => {
      const dayMovements = movements.filter(m => {
        const movementDate = new Date(m.created_at || '');
        return movementDate.toDateString() === date.toDateString();
      });

      const stockIn = dayMovements
        .filter(m => m.type === 'in')
        .reduce((sum, m) => sum + m.quantity, 0);
      
      const stockOut = dayMovements
        .filter(m => m.type === 'out')
        .reduce((sum, m) => sum + m.quantity, 0);

      const totalValue = products.reduce((sum, p) => sum + (p.current_stock * p.unit_price), 0);

      return {
        date: date.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }),
        stockIn,
        stockOut,
        totalValue: Math.round(totalValue / 1000), // Convert to thousands
        netChange: stockIn - stockOut
      };
    });
  }, [products, movements]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value * 1000); // Convert back from thousands
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('th-TH').format(value);
  };

  // Calculate trends
  const trends = useMemo(() => {
    if (chartData.length < 2) return { stockIn: 0, stockOut: 0, value: 0 };
    
    const first = chartData[0];
    const last = chartData[chartData.length - 1];
    
    const stockInTrend = first.stockIn > 0 ? ((last.stockIn - first.stockIn) / first.stockIn) * 100 : 0;
    const stockOutTrend = first.stockOut > 0 ? ((last.stockOut - first.stockOut) / first.stockOut) * 100 : 0;
    const valueTrend = first.totalValue > 0 ? ((last.totalValue - first.totalValue) / first.totalValue) * 100 : 0;
    
    return {
      stockIn: stockInTrend,
      stockOut: stockOutTrend,
      value: valueTrend
    };
  }, [chartData]);

  return (
    <Card className="bg-white/70 backdrop-blur-sm shadow-card border border-white/40">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-primary" />
              ภาพรวมสต็อก 7 วันล่าสุด
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">ติดตามการเคลื่อนไหวของสต็อกและมูลค่า</p>
          </div>
          
          {/* Trend Indicators */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">สินค้าเข้า</p>
                <p className={`text-sm font-semibold ${trends.stockIn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trends.stockIn >= 0 ? '+' : ''}{trends.stockIn.toFixed(1)}%
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="h-4 w-4 text-red-600" />
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">สินค้าออก</p>
                <p className={`text-sm font-semibold ${trends.stockOut >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trends.stockOut >= 0 ? '+' : ''}{trends.stockOut.toFixed(1)}%
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">มูลค่า</p>
                <p className={`text-sm font-semibold ${trends.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trends.value >= 0 ? '+' : ''}{trends.value.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="stockInGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="stockOutGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                yAxisId="left"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatNumber(value)}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrency(value)}
              />
              
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: any, name: string) => {
                  if (name === 'totalValue') {
                    return [formatCurrency(value), 'มูลค่ารวม'];
                  } else if (name === 'stockIn') {
                    return [formatNumber(value), 'สินค้าเข้า'];
                  } else if (name === 'stockOut') {
                    return [formatNumber(value), 'สินค้าออก'];
                  }
                  return [value, name];
                }}
                labelStyle={{ color: '#374151', fontWeight: '600' }}
              />
              
              {/* Stock In Area */}
              <Area
                type="monotone"
                dataKey="stockIn"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#stockInGradient)"
                yAxisId="left"
                name="สินค้าเข้า"
              />
              
              {/* Stock Out Area */}
              <Area
                type="monotone"
                dataKey="stockOut"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#stockOutGradient)"
                yAxisId="left"
                name="สินค้าออก"
              />
              
              {/* Total Value Line */}
              <Line
                type="monotone"
                dataKey="totalValue"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                yAxisId="right"
                name="มูลค่ารวม"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Chart Legend */}
        <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">สินค้าเข้า</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-600">สินค้าออก</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">มูลค่ารวม</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
