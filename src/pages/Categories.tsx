
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout/Layout';
import { PageHeader } from '@/components/Layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Search, Edit, Trash2, Pill, BarChart3, TrendingUp, Layers, Package } from 'lucide-react';
import { supabase, type Category } from '@/lib/supabase';
import { AddCategoryDialog } from '@/components/Dialogs/AddCategoryDialog';
import { EditCategoryDialog } from '@/components/Dialogs/EditCategoryDialog';
import { useToast } from '@/hooks/use-toast';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const fetchCategories = async () => {
    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (categoriesError) throw categoriesError;

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('category_id');

      if (productsError) throw productsError;

      // Count products per category
      const counts: Record<string, number> = {};
      productsData.forEach(product => {
        counts[product.category_id] = (counts[product.category_id] || 0) + 1;
      });

      setCategories(categoriesData || []);
      setProductCounts(counts);
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลหมวดหมู่ได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setEditDialogOpen(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      // Check if category has products
      const productCount = productCounts[categoryId] || 0;
      if (productCount > 0) {
        toast({
          title: "ไม่สามารถลบได้",
          description: `หมวดหมู่นี้มีสินค้า ${productCount} รายการ กรุณาย้ายสินค้าไปหมวดหมู่อื่นก่อน`,
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      toast({
        title: "สำเร็จ",
        description: "ลบหมวดหมู่สำเร็จแล้ว",
      });

      fetchCategories();
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบหมวดหมู่ได้",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const totalCategories = categories.length;
  const medicineCategories = categories.filter(c => c.is_medicine).length;
  const totalProducts = Object.values(productCounts).reduce((sum, count) => sum + count, 0);

  return (
    <Layout hideHeader={true}>
      <div className="w-full space-y-6 pb-8">
        {/* Professional Page Header */}
        <PageHeader 
          title="หมวดหมู่สินค้า"
          description="จัดการและจัดหมวดหมู่สินค้าอย่างเป็นระบบ"
          icon={Layers}
          stats={[
            {
              label: "หมวดหมู่ทั้งหมด",
              value: totalCategories.toString(),
              icon: BarChart3
            },
            {
              label: "หมวดหมู่ยา",
              value: medicineCategories.toString(),
              icon: Pill,
              color: medicineCategories > 0 ? 'bg-green-500' : 'bg-muted/50'
            },
            {
              label: "สินค้ารวม",
              value: totalProducts.toLocaleString(),
              icon: Package,
              trend: { value: "12%", isPositive: true }
            },
            {
              label: "ประสิทธิภาพ",
              value: "95%",
              icon: TrendingUp,
              color: 'bg-primary/80'
            }
          ]}
          primaryAction={{
            label: "เพิ่มหมวดหมู่",
            icon: Plus,
            onClick: () => {}
          }}
          secondaryActions={<AddCategoryDialog onCategoryAdded={fetchCategories} />}
        />

        {/* Enhanced Search */}
        <Card className="bg-gradient-card shadow-card border-white/20">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground">ค้นหาหมวดหมู่</h3>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="ค้นหาหมวดหมู่ ชื่อหรือคำอธิบาย..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 border-white/20"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories Grid */}
        <div className="w-full min-h-0">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-gradient-card shadow-card">
                  <CardContent className="p-4 sm:p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredCategories.map((category) => {
                const productCount = productCounts[category.id] || 0;
              
                return (
                  <Card key={category.id} className="bg-gradient-card shadow-card hover:shadow-hover transition-all duration-200 h-fit">
                     <CardHeader className="pb-3">
                       <div className="flex items-start justify-between gap-2">
                         <div className="flex-1 min-w-0">
                            <CardTitle className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
                              <span className="break-words">{category.name}</span>
                              {category.is_medicine && (
                                <div className="flex items-center" title="หมวดหมู่ยา">
                                  <Pill className="h-4 w-4 text-green-600 flex-shrink-0" />
                                </div>
                              )}
                            </CardTitle>
                         </div>
                         <div className="flex space-x-1 flex-shrink-0">
                           <Button 
                             variant="ghost" 
                             size="sm" 
                             className="h-7 w-7 p-0"
                             onClick={() => handleEditCategory(category)}
                           >
                             <Edit className="h-3 w-3" />
                           </Button>
                           <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-gradient-card shadow-glow border-white/10">
                              <AlertDialogHeader>
                                <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                                <AlertDialogDescription>
                                  คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่ "{category.name}"? 
                                  {productCount > 0 && (
                                    <span className="text-destructive font-medium">
                                      <br />หมวดหมู่นี้มีสินค้า {productCount} รายการ
                                    </span>
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteCategory(category.id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  ลบ
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-xs sm:text-sm text-muted-foreground break-words min-h-[2.5rem]">
                        {category.description || 'ไม่มีคำอธิบาย'}
                      </p>
                       <div className="flex items-center justify-between flex-wrap gap-2">
                         <div className="flex items-center gap-2">
                           <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                             {productCount.toLocaleString()} สินค้า
                           </Badge>
                           {category.is_medicine && (
                             <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200 text-xs">
                               ยา
                             </Badge>
                           )}
                         </div>
                        <span className="text-xs text-muted-foreground truncate">
                          ID: {category.id.slice(0, 8)}...
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="bg-gradient-card shadow-card">
              <CardContent className="p-8 sm:p-12 text-center">
                <p className="text-muted-foreground">ไม่พบหมวดหมู่ที่ตรงกับการค้นหา</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Category Dialog */}
      <EditCategoryDialog
        category={editingCategory}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onCategoryUpdated={fetchCategories}
      />
    </Layout>
  );
}
