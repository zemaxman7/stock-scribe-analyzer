import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout/Layout';
import { PageHeader } from '@/components/Layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter, Package, MapPin, DollarSign, Edit, Trash2, Loader2, Calendar, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase, Product, Category, Supplier } from '@/lib/supabase';
import { AddProductDialog } from '@/components/Dialogs/AddProductDialog';
import { EditProductDialog } from '@/components/Dialogs/EditProductDialog';

interface ProductWithDetails extends Product {
  category_name: string;
  supplier_name: string;
}

interface FilterState {
  searchTerm: string;
  category: string;
  supplier: string;
  stockLevel: string;
}

export default function Products() {
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  const [filter, setFilter] = useState<FilterState>({
    searchTerm: '',
    category: '',
    supplier: '',
    stockLevel: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsResult, categoriesResult, suppliersResult] = await Promise.all([
        supabase
          .from('products')
          .select(`
            *,
            categories!inner (name),
            suppliers!inner (name)
          `)
          .order('name'),
        supabase.from('categories').select('*').order('name'),
        supabase.from('suppliers').select('*').order('name')
      ]);

      if (productsResult.error) throw productsResult.error;
      if (categoriesResult.error) throw categoriesResult.error;
      if (suppliersResult.error) throw suppliersResult.error;

      const productsWithDetails = productsResult.data?.map(product => ({
        ...product,
        category_name: product.categories.name,
        supplier_name: product.suppliers.name
      })) || [];

      setProducts(productsWithDetails);
      setCategories(categoriesResult.data || []);
      setSuppliers(suppliersResult.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดึงข้อมูลได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStockLevel = (product: ProductWithDetails): string => {
    if (product.current_stock === 0) return 'out';
    if (product.current_stock <= product.min_stock) return 'low';
    if (product.max_stock && product.current_stock >= product.max_stock) return 'high';
    return 'medium';
  };

  const getFilteredProducts = () => {
    return products.filter(product => {
      const matchesSearch = filter.searchTerm === '' || 
        product.name.toLowerCase().includes(filter.searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(filter.searchTerm.toLowerCase());
      
      const matchesCategory = filter.category === '' || product.category_id === filter.category;
      const matchesSupplier = filter.supplier === '' || product.supplier_id === filter.supplier;
      
      const stockLevel = getStockLevel(product);
      const matchesStockLevel = filter.stockLevel === '' || stockLevel === filter.stockLevel;
      
      return matchesSearch && matchesCategory && matchesSupplier && matchesStockLevel;
    });
  };

  const handleSearchChange = (value: string) => {
    setFilter({ ...filter, searchTerm: value });
  };

  const handleEditProduct = (product: ProductWithDetails) => {
    setEditingProduct(product);
    setEditDialogOpen(true);
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`ต้องการลบสินค้า "${productName}" หรือไม่?`)) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "ลบสินค้าเรียบร้อย",
        description: `ลบสินค้า ${productName} เรียบร้อยแล้ว`,
      });

      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบสินค้าได้",
        variant: "destructive",
      });
    }
  };

  const getStockBadgeVariant = (level: string) => {
    switch (level) {
      case 'out': return 'destructive';
      case 'low': return 'secondary';
      case 'medium': return 'default';
      case 'high': return 'default';
      default: return 'default';
    }
  };

  const getStockBadgeColor = (level: string) => {
    switch (level) {
      case 'out': return 'bg-red-500 text-white';
      case 'low': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-blue-500 text-white';
      case 'high': return 'bg-green-500 text-white';
      default: return 'bg-muted';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(value);
  };

  const filteredProducts = getFilteredProducts();
  const totalProducts = products.length;
  const lowStockCount = products.filter(p => getStockLevel(p) === 'low' || getStockLevel(p) === 'out').length;
  const totalValue = products.reduce((sum, p) => sum + (p.unit_price * p.current_stock), 0);

  return (
    <Layout hideHeader={true}>
      <div className="w-full space-y-6 pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">กำลังโหลดข้อมูล...</span>
          </div>
        ) : (
          <>
            {/* Professional Page Header */}
            <PageHeader 
              title="จัดการสินค้า"
              description="จัดการข้อมูลสินค้าและสต็อกแบบครบวงจร"
              icon={Package}
              stats={[
                {
                  label: "สินค้าทั้งหมด",
                  value: totalProducts.toLocaleString(),
                  icon: Package
                },
                {
                  label: "มูลค่ารวม",
                  value: formatCurrency(totalValue),
                  icon: DollarSign,
                  trend: { value: "8%", isPositive: true }
                },
                {
                  label: "สต็อกต่ำ",
                  value: lowStockCount.toString(),
                  icon: AlertTriangle,
                  color: lowStockCount > 0 ? 'bg-warning/80' : 'bg-success/80'
                },
                {
                  label: "หมวดหมู่",
                  value: categories.length.toString(),
                  icon: BarChart3
                }
              ]}
              primaryAction={{
                label: "เพิ่มสินค้าใหม่",
                icon: Plus,
                onClick: () => {} // AddProductDialog handles this
              }}
              secondaryActions={<AddProductDialog onProductAdded={fetchData} />}
            />

            {/* Enhanced Search and Filters */}
            <Card className="bg-gradient-card shadow-card border-white/20">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Search className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold text-foreground">ค้นหาและกรองข้อมูล</h3>
                  </div>
                  
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="ค้นหาสินค้า ชื่อ, SKU หรือรายละเอียด..."
                      value={filter.searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-10 bg-white/50 border-white/20"
                    />
                  </div>
                  
                  {/* Filter Options */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Select value={filter.category} onValueChange={(value) => setFilter({ ...filter, category: value === 'all' ? '' : value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="หมวดหมู่" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">หมวดหมู่ทั้งหมด</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={filter.supplier} onValueChange={(value) => setFilter({ ...filter, supplier: value === 'all' ? '' : value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="ผู้จำหน่าย" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">ผู้จำหน่ายทั้งหมด</SelectItem>
                        {suppliers.map(supplier => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={filter.stockLevel} onValueChange={(value) => setFilter({ ...filter, stockLevel: value === 'all' ? '' : value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="ระดับสต็อก" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">ทุกระดับ</SelectItem>
                        <SelectItem value="high">สต็อกสูง</SelectItem>
                        <SelectItem value="medium">สต็อกปานกลาง</SelectItem>
                        <SelectItem value="low">สต็อกต่ำ</SelectItem>
                        <SelectItem value="out">สินค้าหมด</SelectItem>
                      </SelectContent>
                    </Select>

                    {(filter.category || filter.supplier || filter.stockLevel || filter.searchTerm) && (
                      <Button 
                        variant="outline" 
                        onClick={() => setFilter({ searchTerm: '', category: '', supplier: '', stockLevel: '' })}
                        className="w-full"
                      >
                        ล้างตัวกรอง
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Professional Products Grid */}
            <div className="w-full min-h-0">
              {filteredProducts.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">
                      สินค้าทั้งหมด ({filteredProducts.length.toLocaleString()} รายการ)
                    </h3>
                  </div>
                  
                  <div className="grid gap-6 sm:gap-8 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                    {filteredProducts.map(product => {
                      const stockLevel = getStockLevel(product);
                      
                      return (
                        <Card key={product.id} className="bg-gradient-card shadow-card hover:shadow-hover transition-all duration-300 border-white/20 hover:border-primary/20 h-fit group">
                          <CardHeader className="pb-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-2 flex-1 min-w-0">
                                <CardTitle className="text-lg font-bold break-words group-hover:text-primary transition-colors">
                                  {product.name}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs bg-muted/50">
                                    SKU: {product.sku}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Badge 
                                  variant={getStockBadgeVariant(stockLevel)}
                                  className={`${getStockBadgeColor(stockLevel)} text-xs font-semibold`}
                                >
                                  {stockLevel === 'out' ? 'หมด' : `${product.current_stock.toLocaleString()}`}
                                </Badge>
                                <div className="flex space-x-1">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleEditProduct(product)}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleDeleteProduct(product.id, product.name)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {product.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2 break-words">
                                {product.description}
                              </p>
                            )}
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  <span className="text-sm text-muted-foreground">หมวดหมู่</span>
                                </div>
                                <p className="text-sm font-semibold break-words">{product.category_name}</p>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  <span className="text-sm text-muted-foreground">ราคา</span>
                                </div>
                                <p className="text-sm font-semibold text-primary">{formatCurrency(product.unit_price)}</p>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-sm text-muted-foreground">ที่ตั้ง</span>
                              </div>
                              <p className="text-sm font-medium break-words">{product.location || 'ไม่ได้ระบุ'}</p>
                            </div>
                            
                            {/* Expiry Date for Medicine */}
                            {product.expiry_date && (
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  <span className="text-sm text-muted-foreground">วันหมดอายุ</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <p className="text-sm font-medium">
                                    {new Date(product.expiry_date).toLocaleDateString('th-TH')}
                                  </p>
                                  {new Date(product.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                                    <Badge variant="destructive" className="text-xs">
                                      {new Date(product.expiry_date) <= new Date() ? 'หมดอายุแล้ว' : 'ใกล้หมดอายุ'}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between pt-3 border-t border-border">
                              <div className="text-sm">
                                <span className="text-muted-foreground">ผู้จำหน่าย: </span>
                                <span className="font-semibold break-words">{product.supplier_name}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-muted-foreground">ขั้นต่ำ: </span>
                                <span className="font-semibold">{product.min_stock.toLocaleString()}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <Card className="bg-gradient-card shadow-card border-white/20">
                  <CardContent className="text-center py-12">
                    <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">ไม่พบสินค้า</h3>
                    <p className="text-muted-foreground mb-6">
                      {filter.searchTerm || filter.category || filter.supplier || filter.stockLevel
                        ? 'ลองปรับตัวกรองเพื่อดูผลลัพธ์เพิ่มเติม'
                        : 'เริ่มต้นโดยการเพิ่มสินค้าแรกเข้าสู่ระบบ'}
                    </p>
                    <AddProductDialog onProductAdded={fetchData} />
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </div>

      {/* Edit Product Dialog */}
      <EditProductDialog
        product={editingProduct}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onProductUpdated={fetchData}
      />
    </Layout>
  );
}