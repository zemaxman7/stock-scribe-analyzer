import React, { useMemo } from 'react';
import { Layout } from '@/components/Layout/Layout';
import { PageHeader } from '@/components/Layout/PageHeader';
import { StockOverview } from '@/components/Dashboard/StockOverview';
import { RecentActivity } from '@/components/Dashboard/RecentActivity';
import { StockChart } from '@/components/Dashboard/StockChart';
import { CategoryDistribution } from '@/components/Dashboard/CategoryDistribution';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStock } from '@/contexts/StockContext';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  ArrowUpDown,
  BarChart3,
  Activity,
  Users,
  Building2
} from 'lucide-react';

export default function Dashboard() {
  const { stats, products, categories, suppliers, movements, refreshData } = useStock();

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

  // Calculate additional statistics
  const enhancedStats = useMemo(() => {
    const totalCategories = categories.length;
    const totalSuppliers = suppliers.length;
    const averageStockValue = stats.totalProducts > 0 ? stats.totalValue / stats.totalProducts : 0;
    const stockUtilization = stats.totalProducts > 0 ? ((stats.totalProducts - stats.outOfStockItems) / stats.totalProducts) * 100 : 0;
    
    // Calculate monthly trends (mock data for now)
    const monthlyGrowth = 8.5;
    const monthlyRevenue = stats.totalValue * 0.12; // Mock: 12% of stock value as monthly revenue
    
    return {
      totalCategories,
      totalSuppliers,
      averageStockValue,
      stockUtilization,
      monthlyGrowth,
      monthlyRevenue
    };
  }, [stats, categories, suppliers]);

  // Get top performing categories
  const topCategories = useMemo(() => {
    return categories.slice(0, 3).map(category => {
      const categoryProducts = products.filter(p => p.category_id === category.id);
      const totalValue = categoryProducts.reduce((sum, p) => sum + (p.current_stock * p.unit_price), 0);
      return {
        ...category,
        productCount: categoryProducts.length,
        totalValue
      };
    }).sort((a, b) => b.totalValue - a.totalValue);
  }, [categories, products]);

  // Get recent movements for activity feed
  const recentMovements = useMemo(() => {
    return movements
      .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
      .slice(0, 5);
  }, [movements]);


  return (
    <Layout hideHeader={true}>
      <div className="w-full space-y-8 pb-8">
        {/* Enhanced Page Header with better stats */}
        <PageHeader 
          title="แดชบอร์ด"
          description="ภาพรวมระบบจัดการสต็อกสินค้าแบบครบวงจร"
          icon={BarChart3}
          stats={[
            {
              label: "รายการสินค้าทั้งหมด",
              value: formatNumber(stats.totalProducts),
              trend: { value: "12%", isPositive: true },
              icon: Package
            },
            {
              label: "มูลค่ารวมสต็อก",
              value: formatCurrency(stats.totalValue),
              trend: { value: "8%", isPositive: true },
              icon: () => <span className="text-2xl font-bold">฿</span>
            },
            {
              label: "สินค้าใกล้หมด",
              value: stats.lowStockItems.toString(),
              trend: { value: "3%", isPositive: false },
              icon: AlertTriangle,
              color: stats.lowStockItems > 0 ? 'bg-warning/80' : 'bg-success/80'
            },
            {
              label: "เคลื่อนไหว 7 วัน",
              value: stats.recentMovements.toString(),
              trend: { value: "15%", isPositive: true },
              icon: ArrowUpDown
            }
          ]}
        />

        {/* Stock Overview - moved up to top area */}
        <div className="grid gap-6">
          <StockOverview />
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-1">
          <RecentActivity movements={recentMovements} />
        </div>

        {/* Enhanced Analytics Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Chart Area */}
          <div className="md:col-span-2">
            <StockChart />
          </div>
          
          {/* Enhanced Quick Insights */}
          <div className="space-y-6 md:sticky md:top-6">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-blue-800 flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  สถิติสำคัญ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Building2 className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-800">หมวดหมู่</p>
                        <p className="text-xs text-blue-600">{enhancedStats.totalCategories} หมวด</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-800">ซัพพลายเออร์</p>
                        <p className="text-xs text-blue-600">{enhancedStats.totalSuppliers} ราย</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-800">การเติบโต</p>
                        <p className="text-xs text-blue-600">+{enhancedStats.monthlyGrowth}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <CategoryDistribution categories={topCategories} />
          </div>
        </div>


      </div>
    </Layout>
  );
}