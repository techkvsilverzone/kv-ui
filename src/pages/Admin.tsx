import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Settings,
  TrendingUp,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Loader2,
  CreditCard,
  Tag,
  RotateCcw,
  BarChart3,
  Plus,
  X,
  Check,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { adminService } from '@/services/admin';
import { productService } from '@/services/product';
import { savingsService } from '@/services/savings';
import { couponService, type CreateCouponPayload } from '@/services/coupon';
import { returnsService } from '@/services/returns';
import { silverRateService, type UpdateSilverRatePayload } from '@/services/silverRate';

const Admin = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [showUpdateRate, setShowUpdateRate] = useState(false);
  const queryClient = useQueryClient();

  // Product form state
  const [productForm, setProductForm] = useState({
    name: '', price: '', originalPrice: '', image: '', category: 'Necklaces',
    weight: '', purity: '925', description: '', inStock: true,
  });

  // Coupon form state
  const [couponForm, setCouponForm] = useState<CreateCouponPayload>({
    code: '', description: '', discountType: 'percentage', discountValue: 0,
    minOrderAmount: 0, maxDiscount: 0, validFrom: '', validTo: '', usageLimit: 100,
  });

  // Silver rate form state
  const [rateForm, setRateForm] = useState<UpdateSilverRatePayload>({
    ratePerGram: 0, purity: '999',
  });

  /* ── Queries ── */
  const { data: adminStats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminService.getStats,
    enabled: !!user?.isAdmin,
    meta: { errorMessage: 'Failed to load dashboard stats' },
  });

  const { data: allProducts = [], isLoading: productsLoading, isError: productsError } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => productService.getProducts(),
    enabled: !!user?.isAdmin,
    meta: { errorMessage: 'Failed to load products' },
  });

  const { data: allOrders = [], isLoading: ordersLoading, isError: ordersError } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: adminService.getAllOrders,
    enabled: !!user?.isAdmin,
    meta: { errorMessage: 'Failed to load orders' },
  });

  const { data: allUsers = [], isLoading: usersLoading, isError: usersError } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminService.getAllUsers,
    enabled: !!user?.isAdmin,
    meta: { errorMessage: 'Failed to load customers' },
  });

  const { data: allSavings = [], isLoading: savingsLoading, isError: savingsError } = useQuery({
    queryKey: ['admin-savings'],
    queryFn: adminService.getAllSavingsSchemes,
    enabled: !!user?.isAdmin,
    meta: { errorMessage: 'Failed to load savings schemes' },
  });

  const { data: allCoupons = [], isLoading: couponsLoading, isError: couponsError } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: couponService.getAllCoupons,
    enabled: !!user?.isAdmin,
    meta: { errorMessage: 'Failed to load coupons' },
  });

  const { data: allReturns = [], isLoading: returnsLoading, isError: returnsError } = useQuery({
    queryKey: ['admin-returns'],
    queryFn: returnsService.getAllReturns,
    enabled: !!user?.isAdmin,
    meta: { errorMessage: 'Failed to load return requests' },
  });

  const { data: silverRates = [], isLoading: ratesLoading, isError: ratesError } = useQuery({
    queryKey: ['admin-silver-rates'],
    queryFn: silverRateService.getAllRates,
    enabled: !!user?.isAdmin,
    meta: { errorMessage: 'Failed to load silver rates' },
  });

  /* ── Mutations ── */
  const deleteProductMutation = useMutation({
    mutationFn: adminService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({ title: 'Product Deleted' });
    },
  });

  const createProductMutation = useMutation({
    mutationFn: adminService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setShowAddProduct(false);
      setProductForm({ name: '', price: '', originalPrice: '', image: '', category: 'Necklaces', weight: '', purity: '925', description: '', inStock: true });
      toast({ title: 'Product Created' });
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminService.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast({ title: 'Order Status Updated' });
    },
  });

  const createCouponMutation = useMutation({
    mutationFn: couponService.createCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      setShowAddCoupon(false);
      toast({ title: 'Coupon Created' });
    },
  });

  const deleteCouponMutation = useMutation({
    mutationFn: couponService.deleteCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast({ title: 'Coupon Deleted' });
    },
  });

  const toggleCouponMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      couponService.toggleCoupon(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
  });

  const updateReturnMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      returnsService.updateReturnStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-returns'] });
      toast({ title: 'Return Status Updated' });
    },
  });

  const updateRateMutation = useMutation({
    mutationFn: silverRateService.updateRate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-silver-rates'] });
      setShowUpdateRate(false);
      toast({ title: 'Silver Rate Updated' });
    },
  });

  if (!isAuthenticated || !user?.isAdmin) {
    return <Navigate to="/login" />;
  }

  const ApiErrorState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center py-12 text-destructive gap-2">
      <XCircle className="h-8 w-8" />
      <p className="text-sm font-medium">{message}</p>
      <p className="text-xs text-muted-foreground">Check that the backend API is running and your VITE_API_URL is correct.</p>
    </div>
  );

  const stats = [
    { title: 'Total Revenue', value: adminStats?.totalRevenue != null ? `₹${adminStats.totalRevenue.toLocaleString('en-IN')}` : '₹0', icon: DollarSign, change: adminStats?.changes?.revenue ?? null },
    { title: 'Total Orders', value: adminStats?.totalOrders?.toString() ?? '0', icon: ShoppingCart, change: adminStats?.changes?.orders ?? null },
    { title: 'Total Products', value: adminStats?.totalProducts?.toString() ?? '0', icon: Package, change: adminStats?.changes?.products ?? null },
    { title: 'Total Customers', value: adminStats?.totalCustomers?.toString() ?? '0', icon: Users, change: adminStats?.changes?.customers ?? null },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const filteredProducts = allProducts.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = orderStatusFilter === 'all'
    ? allOrders
    : allOrders.filter((o) => o.status === orderStatusFilter);

  const selectedOrderDetails = allOrders.find((o) => o.id === selectedOrder);

  const handleCreateProduct = () => {
    createProductMutation.mutate({
      name: productForm.name,
      price: Number(productForm.price),
      originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
      image: productForm.image,
      category: productForm.category,
      weight: productForm.weight,
      purity: productForm.purity,
      description: productForm.description,
      inStock: productForm.inStock,
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-4xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name}</p>
          </div>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="customers" className="gap-2">
              <Users className="h-4 w-4" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="savings" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Savings
            </TabsTrigger>
            <TabsTrigger value="coupons" className="gap-2">
              <Tag className="h-4 w-4" />
              Coupons
            </TabsTrigger>
            <TabsTrigger value="returns" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Returns
            </TabsTrigger>
            <TabsTrigger value="silver-rates" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Silver Rates
            </TabsTrigger>
          </TabsList>

          {/* ═══════ DASHBOARD ═══════ */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statsLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <Card key={i} className="p-6 animate-pulse">
                    <div className="h-20 bg-muted rounded"></div>
                  </Card>
                ))
              ) : (
                stats.map((stat, index) => (
                  <Card key={index} className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                        {stat.change && <p className="text-sm text-green-600 mt-1">{stat.change}</p>}
                      </div>
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                        <stat.icon className="h-6 w-6 text-accent" />
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            <Card className="p-6">
              <h2 className="font-serif text-xl font-semibold mb-4">Recent Orders</h2>
              {ordersLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(adminStats?.recentOrders?.length ? adminStats.recentOrders : allOrders.slice(0, 5)).map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id.slice(-6)}</TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              order.status === 'Delivered'
                                ? 'bg-green-100 text-green-700'
                                : order.status === 'Shipped'
                                ? 'bg-blue-100 text-blue-700'
                                : order.status === 'Cancelled'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {order.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatPrice(order.totalAmount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </TabsContent>

          {/* ═══════ PRODUCTS ═══════ */}
          <TabsContent value="products">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-xl font-semibold">Products</h2>
                <div className="flex gap-4">
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                  />
                  <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
                    <DialogTrigger asChild>
                      <Button><Plus className="h-4 w-4 mr-2" />Add Product</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="font-serif">Add New Product</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div>
                          <Label htmlFor="prod-name">Product Name</Label>
                          <Input id="prod-name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="mt-1" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="prod-price">Price (₹)</Label>
                            <Input id="prod-price" type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className="mt-1" />
                          </div>
                          <div>
                            <Label htmlFor="prod-original">Original Price (₹)</Label>
                            <Input id="prod-original" type="number" value={productForm.originalPrice} onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })} className="mt-1" placeholder="Optional" />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="prod-image">Image URL</Label>
                          <Input id="prod-image" value={productForm.image} onChange={(e) => setProductForm({ ...productForm, image: e.target.value })} className="mt-1" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Category</Label>
                            <Select value={productForm.category} onValueChange={(v) => setProductForm({ ...productForm, category: v })}>
                              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {['Necklaces', 'Bangles', 'Earrings', 'Rings', 'Anklets', 'Coins', 'Puja Items'].map((c) => (
                                  <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Purity</Label>
                            <Select value={productForm.purity} onValueChange={(v) => setProductForm({ ...productForm, purity: v })}>
                              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="999">999 Fine Silver</SelectItem>
                                <SelectItem value="925">925 Sterling</SelectItem>
                                <SelectItem value="916">916 Silver</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="prod-weight">Weight (e.g. 45g)</Label>
                          <Input id="prod-weight" value={productForm.weight} onChange={(e) => setProductForm({ ...productForm, weight: e.target.value })} className="mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="prod-desc">Description</Label>
                          <Textarea id="prod-desc" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className="mt-1" rows={3} />
                        </div>
                        <Button onClick={handleCreateProduct} disabled={createProductMutation.isPending || !productForm.name || !productForm.price}>
                          {createProductMutation.isPending ? 'Creating...' : 'Create Product'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              {productsLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                </div>
              ) : productsError ? (
                <ApiErrorState message="Failed to load products from API" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{formatPrice(product.price)}</TableCell>
                        <TableCell>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              product.inStock
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive h-8 w-8"
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this product?')) {
                                  deleteProductMutation.mutate(product.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </TabsContent>

          {/* ═══════ ORDERS ═══════ */}
          <TabsContent value="orders">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-xl font-semibold">All Orders</h2>
                <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Filter status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Shipped">Shipped</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {ordersLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                </div>
              ) : ordersError ? (
                <ApiErrorState message="Failed to load orders from API" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id.slice(-6)}</TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{order.items.length} item(s)</TableCell>
                        <TableCell>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              order.status === 'Delivered'
                                ? 'bg-green-100 text-green-700'
                                : order.status === 'Shipped'
                                ? 'bg-blue-100 text-blue-700'
                                : order.status === 'Cancelled'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {order.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatPrice(order.totalAmount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order.id)}>
                                  View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-lg">
                                <DialogHeader>
                                  <DialogTitle className="font-serif">Order #{order.id.slice(-6)}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground">Shipping Address</p>
                                    <p className="text-sm">
                                      {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
                                      {order.shippingAddress.address}<br />
                                      {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}<br />
                                      Phone: {order.shippingAddress.phone}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-2">Items</p>
                                    {order.items.map((item, idx) => (
                                      <div key={idx} className="flex justify-between text-sm py-1">
                                        <span>{item.name} × {item.quantity}</span>
                                        <span>{formatPrice(item.price * item.quantity)}</span>
                                      </div>
                                    ))}
                                    <div className="flex justify-between font-semibold mt-2 pt-2 border-t">
                                      <span>Total</span>
                                      <span>{formatPrice(order.totalAmount)}</span>
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Update Status</Label>
                                    <Select
                                      value={order.status}
                                      onValueChange={(status) => updateOrderStatusMutation.mutate({ id: order.id, status })}
                                    >
                                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="Shipped">Shipped</SelectItem>
                                        <SelectItem value="Delivered">Delivered</SelectItem>
                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </TabsContent>

          {/* ═══════ CUSTOMERS ═══════ */}
          <TabsContent value="customers">
            <Card className="p-6">
              <h2 className="font-serif text-xl font-semibold mb-6">Customers</h2>
              {usersLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                </div>
              ) : usersError ? (
                <ApiErrorState message="Failed to load customers from API" />
              ) : allUsers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>{u.phone || '—'}</TableCell>
                        <TableCell>{u.city || '—'}</TableCell>
                        <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-1 rounded-full ${u.isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                            {u.isAdmin ? 'Admin' : 'Customer'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-8">No customers found.</p>
              )}
            </Card>
          </TabsContent>

          {/* ═══════ SAVINGS SCHEMES ═══════ */}
          <TabsContent value="savings">
            <Card className="p-6">
              <h2 className="font-serif text-xl font-semibold mb-6">Savings Scheme Enrollments</h2>
              {savingsLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                </div>
              ) : savingsError ? (
                <ApiErrorState message="Failed to load savings schemes from API" />
              ) : allSavings.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Monthly Amount</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Total Paid</TableHead>
                      <TableHead>Bonus</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Start Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allSavings.map((s) => (
                      <TableRow key={s._id}>
                        <TableCell className="font-medium">{s.user}</TableCell>
                        <TableCell>{formatPrice(s.monthlyAmount)}</TableCell>
                        <TableCell>{s.duration} months</TableCell>
                        <TableCell>{formatPrice(s.totalPaid)}</TableCell>
                        <TableCell>{formatPrice(s.bonusAmount)}</TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            s.status === 'Active' ? 'bg-green-100 text-green-700'
                              : s.status === 'Completed' ? 'bg-blue-100 text-blue-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {s.status}
                          </span>
                        </TableCell>
                        <TableCell>{new Date(s.startDate).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-8">No savings enrollments yet.</p>
              )}
            </Card>
          </TabsContent>

          {/* ═══════ COUPONS ═══════ */}
          <TabsContent value="coupons">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-xl font-semibold">Coupons & Offers</h2>
                <Dialog open={showAddCoupon} onOpenChange={setShowAddCoupon}>
                  <DialogTrigger asChild>
                    <Button><Plus className="h-4 w-4 mr-2" />Create Coupon</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="font-serif">Create Coupon</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="coupon-code">Code</Label>
                          <Input id="coupon-code" value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} className="mt-1" placeholder="SILVER20" />
                        </div>
                        <div>
                          <Label>Discount Type</Label>
                          <Select value={couponForm.discountType} onValueChange={(v: 'percentage' | 'fixed') => setCouponForm({ ...couponForm, discountType: v })}>
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">Percentage</SelectItem>
                              <SelectItem value="fixed">Fixed Amount</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="coupon-desc">Description</Label>
                        <Input id="coupon-desc" value={couponForm.description} onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })} className="mt-1" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="coupon-value">Discount Value</Label>
                          <Input id="coupon-value" type="number" value={couponForm.discountValue || ''} onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })} className="mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="coupon-min">Min Order (₹)</Label>
                          <Input id="coupon-min" type="number" value={couponForm.minOrderAmount || ''} onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: Number(e.target.value) })} className="mt-1" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="coupon-from">Valid From</Label>
                          <Input id="coupon-from" type="date" value={couponForm.validFrom} onChange={(e) => setCouponForm({ ...couponForm, validFrom: e.target.value })} className="mt-1" />
                        </div>
                        <div>
                          <Label htmlFor="coupon-to">Valid To</Label>
                          <Input id="coupon-to" type="date" value={couponForm.validTo} onChange={(e) => setCouponForm({ ...couponForm, validTo: e.target.value })} className="mt-1" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="coupon-limit">Usage Limit</Label>
                        <Input id="coupon-limit" type="number" value={couponForm.usageLimit} onChange={(e) => setCouponForm({ ...couponForm, usageLimit: Number(e.target.value) })} className="mt-1" />
                      </div>
                      <Button onClick={() => createCouponMutation.mutate(couponForm)} disabled={createCouponMutation.isPending || !couponForm.code}>
                        {createCouponMutation.isPending ? 'Creating...' : 'Create Coupon'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              {couponsLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                </div>
              ) : couponsError ? (
                <ApiErrorState message="Failed to load coupons from API" />
              ) : allCoupons.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Min Order</TableHead>
                      <TableHead>Valid Until</TableHead>
                      <TableHead>Used</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allCoupons.map((coupon) => (
                      <TableRow key={coupon.id}>
                        <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
                        <TableCell>
                          {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : formatPrice(coupon.discountValue)}
                        </TableCell>
                        <TableCell>{formatPrice(coupon.minOrderAmount)}</TableCell>
                        <TableCell>{new Date(coupon.validTo).toLocaleDateString()}</TableCell>
                        <TableCell>{coupon.usedCount} / {coupon.usageLimit}</TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-1 rounded-full ${coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {coupon.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleCouponMutation.mutate({ id: coupon.id, isActive: !coupon.isActive })}
                            >
                              {coupon.isActive ? <XCircle className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => {
                                if (window.confirm('Delete this coupon?')) deleteCouponMutation.mutate(coupon.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-8">No coupons created yet.</p>
              )}
            </Card>
          </TabsContent>

          {/* ═══════ RETURNS ═══════ */}
          <TabsContent value="returns">
            <Card className="p-6">
              <h2 className="font-serif text-xl font-semibold mb-6">Return Requests</h2>
              {returnsLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                </div>
              ) : returnsError ? (
                <ApiErrorState message="Failed to load return requests from API" />
              ) : allReturns.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Return ID</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allReturns.map((ret) => (
                      <TableRow key={ret.id}>
                        <TableCell className="font-medium">#{ret.id.slice(-6)}</TableCell>
                        <TableCell>#{ret.orderId.slice(-6)}</TableCell>
                        <TableCell>{ret.userName || ret.userId}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{ret.reason}</TableCell>
                        <TableCell>{formatPrice(ret.refundAmount)}</TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            ret.status === 'Approved' ? 'bg-green-100 text-green-700'
                              : ret.status === 'Rejected' ? 'bg-red-100 text-red-700'
                              : ret.status === 'Completed' ? 'bg-blue-100 text-blue-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {ret.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {ret.status === 'Pending' && (
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600"
                                onClick={() => updateReturnMutation.mutate({ id: ret.id, status: 'Approved' })}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() => updateReturnMutation.mutate({ id: ret.id, status: 'Rejected' })}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-8">No return requests.</p>
              )}
            </Card>
          </TabsContent>

          {/* ═══════ SILVER RATES ═══════ */}
          <TabsContent value="silver-rates">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-xl font-semibold">Silver Rate Management</h2>
                <Dialog open={showUpdateRate} onOpenChange={setShowUpdateRate}>
                  <DialogTrigger asChild>
                    <Button><Plus className="h-4 w-4 mr-2" />Update Today's Rate</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-serif">Update Silver Rate</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label>Purity</Label>
                        <Select value={rateForm.purity} onValueChange={(v) => setRateForm({ ...rateForm, purity: v })}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="999">999 Fine Silver</SelectItem>
                            <SelectItem value="925">925 Sterling</SelectItem>
                            <SelectItem value="916">916 Silver</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="rate-gram">Rate per Gram (₹)</Label>
                        <Input id="rate-gram" type="number" value={rateForm.ratePerGram || ''} onChange={(e) => setRateForm({ ...rateForm, ratePerGram: Number(e.target.value) })} className="mt-1" />
                      </div>
                      <Button onClick={() => updateRateMutation.mutate(rateForm)} disabled={updateRateMutation.isPending || !rateForm.ratePerGram}>
                        {updateRateMutation.isPending ? 'Updating...' : 'Update Rate'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              {ratesLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                </div>
              ) : ratesError ? (
                <ApiErrorState message="Failed to load silver rates from API" />
              ) : silverRates.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Purity</TableHead>
                      <TableHead>Rate/Gram</TableHead>
                      <TableHead>Rate/Kg</TableHead>
                      <TableHead>Updated By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {silverRates.map((rate) => (
                      <TableRow key={rate.id}>
                        <TableCell>{new Date(rate.date).toLocaleDateString()}</TableCell>
                        <TableCell>{rate.purity}</TableCell>
                        <TableCell className="font-medium">{formatPrice(rate.ratePerGram)}</TableCell>
                        <TableCell>{formatPrice(rate.ratePerKg)}</TableCell>
                        <TableCell>{rate.updatedBy || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-8">No silver rates recorded yet.</p>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
