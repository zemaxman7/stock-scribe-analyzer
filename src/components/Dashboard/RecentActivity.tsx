import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStock } from '@/contexts/StockContext';
import { Link } from 'react-router-dom';
import { 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  ArrowRight,
  Activity
} from 'lucide-react';

interface Movement {
  id: string;
  product_id: string;
  type: 'in' | 'out';
  quantity: number;
  reason: string;
  created_at: string;
  created_by?: string;
}

interface RecentActivityProps {
  movements: Movement[];
}

export function RecentActivity({ movements }: RecentActivityProps) {
  const { products } = useStock();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'วันนี้';
    } else if (diffDays === 2) {
      return 'เมื่อวาน';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} วันที่แล้ว`;
    } else {
      return date.toLocaleDateString('th-TH', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('th-TH', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.name || 'สินค้าไม่ทราบ';
  };

  const getMovementIcon = (type: 'in' | 'out') => {
    if (type === 'in') {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
  };

  const getMovementColor = (type: 'in' | 'out') => {
    if (type === 'in') {
      return 'bg-green-100 text-green-800 border-green-200';
    } else {
      return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getMovementText = (type: 'in' | 'out') => {
    if (type === 'in') {
      return 'รับเข้า';
    } else {
      return 'จ่ายออก';
    }
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm shadow-card border border-white/40">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-primary" />
          กิจกรรมล่าสุด
        </CardTitle>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          {movements.length} รายการ
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {movements.length > 0 ? (
            movements.map((movement, index) => (
              <div key={movement.id} className="relative">
                {/* Timeline connector */}
                {index < movements.length - 1 && (
                  <div className="absolute left-6 top-8 w-0.5 h-12 bg-gray-200"></div>
                )}
                
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className={`p-2 rounded-full border ${getMovementColor(movement.type)}`}>
                      {getMovementIcon(movement.type)}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {getProductName(movement.product_id)}
                      </p>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getMovementColor(movement.type)}`}
                      >
                        {getMovementText(movement.type)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">
                        จำนวน: <span className="font-medium">{movement.quantity.toLocaleString('th-TH')}</span>
                      </p>
                      <p className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(movement.created_at)}
                      </p>
                    </div>
                    
                    {movement.reason && (
                      <p className="text-xs text-gray-500 mb-2">
                        เหตุผล: {movement.reason}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400">
                        {formatDate(movement.created_at)}
                      </p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 text-xs text-primary hover:text-primary/80"
                        asChild
                      >
                        <Link to={`/movements?id=${movement.id}`}>
                          ดูรายละเอียด
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-2">ยังไม่มีกิจกรรมล่าสุด</p>
              <p className="text-xs text-gray-400">การเคลื่อนไหวของสต็อกจะแสดงที่นี่</p>
            </div>
          )}
        </div>
        
        {/* View All Button */}
        {movements.length > 0 && (
          <div className="text-center pt-4 border-t border-gray-200">
            <Button variant="outline" size="sm" asChild>
              <Link to="/movements">
                ดูการเคลื่อนไหวทั้งหมด
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
