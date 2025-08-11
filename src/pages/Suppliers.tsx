
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Search, Edit, Trash2, Phone, Mail, MapPin, User, CheckCircle } from 'lucide-react';
import { PageHeader } from '@/components/Layout/PageHeader';
import { supabase, type Supplier } from '@/lib/supabase';
import { AddSupplierDialog } from '@/components/Dialogs/AddSupplierDialog';
import { EditSupplierDialog } from '@/components/Dialogs/EditSupplierDialog';
import { useToast } from '@/hooks/use-toast';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchSuppliers = async () => {
    try {
      const { data: suppliersData, error: suppliersError } = await supabase
        .from('suppliers')
        .select('*')
        .order('created_at', { ascending: false });

      if (suppliersError) throw suppliersError;

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('supplier_id');

      if (productsError) throw productsError;

      // Count products per supplier
      const counts: Record<string, number> = {};
      productsData.forEach(product => {
        counts[product.supplier_id] = (counts[product.supplier_id] || 0) + 1;
      });

      setSuppliers(suppliersData || []);
      setProductCounts(counts);
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลผู้จัดหาได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setEditDialogOpen(true);
  };

  const handleDeleteSupplier = async (supplierId: string) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', supplierId);

      if (error) throw error;

      toast({
        title: "สำเร็จ",
        description: "ลบผู้จัดหาสำเร็จแล้ว",
      });

      fetchSuppliers();
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบผู้จัดหาได้",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  return (
    <Layout hideHeader={true}>
      <div className="w-full space-y-8 pb-8">
        {/* Professional Page Header */}
        <PageHeader 
          title="ผู้จัดหา"
          description="จัดการข้อมูลผู้จัดหาและซัพพลายเออร์อย่างครบถ้วน"
          icon={User}
          stats={[
            {
              label: "ผู้จัดหาทั้งหมด",
              value: suppliers.length.toString(),
              icon: User
            },
            {
              label: "ผู้จัดหาที่ใช้งาน",
              value: Object.values(productCounts).filter(count => count > 0).length.toString(),
              icon: CheckCircle
            }
          ]}
          primaryAction={{
            label: "เพิ่มผู้จัดหา",
            icon: Plus,
            onClick: () => {
              // Handle add supplier action
            }
          }}
        />

        {/* Search */}
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-4 sm:p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="ค้นหาผู้จัดหา..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Suppliers Grid */}
        <div className="w-full min-h-0">
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
          ) : filteredSuppliers.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {filteredSuppliers.map((supplier) => {
                const productCount = productCounts[supplier.id] || 0;
                const status = productCount > 0 ? 'active' : 'inactive';
              
                return (
                  <Card key={supplier.id} className="bg-gradient-card shadow-card hover:shadow-hover transition-all duration-200 h-fit">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base sm:text-lg font-semibold text-foreground flex-1 min-w-0">
                          <span className="break-words">{supplier.name}</span>
                        </CardTitle>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <Badge variant={status === 'active' ? 'default' : 'secondary'} 
                                 className={`text-xs ${status === 'active' ? 'bg-green-500/10 text-green-600' : ''}`}>
                            {status === 'active' ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                          </Badge>
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditSupplier(supplier)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-gradient-card shadow-glow border-white/10">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    คุณแน่ใจหรือไม่ที่จะลบผู้จัดหา "{supplier.name}"? การกระทำนี้ไม่สามารถยกเลิกได้
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteSupplier(supplier.id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    ลบ
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Mail className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span className="break-all flex-1">{supplier.email}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span className="break-all flex-1">{supplier.phone}</span>
                        </div>
                        {supplier.address && (
                          <div className="flex items-start text-sm text-muted-foreground">
                            <MapPin className="mr-2 h-4 w-4 flex-shrink-0 mt-0.5" />
                            <span className="break-words flex-1">{supplier.address}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between pt-2 border-t">
                        <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                          {productCount.toLocaleString()} สินค้า
                        </Badge>
                        <span className="text-xs text-muted-foreground truncate">
                          ID: {supplier.id.slice(0, 8)}...
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
                <p className="text-muted-foreground">ไม่พบผู้จัดหาที่ตรงกับการค้นหา</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Supplier Dialog */}
      <EditSupplierDialog
        supplier={editingSupplier}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSupplierUpdated={fetchSuppliers}
      />
    </Layout>
  );
}
