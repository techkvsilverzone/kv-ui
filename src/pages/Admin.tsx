import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Settings,
  TrendingUp,
  TrendingDown,
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
  KeyRound,
  X,
  Check,
  XCircle,
  Palette,
  Sun,
  Moon,
  SlidersHorizontal,
  ClipboardList,
  AlertCircle,
  Scale,
  History,
  ChevronsUpDown,
  Search as SearchIcon,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAuth, getUserRole } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { adminService } from '@/services/admin';
import { authService } from '@/services/auth';
import { productService } from '@/services/product';
import { savingsService } from '@/services/savings';
import { couponService, type CreateCouponPayload } from '@/services/coupon';
import { returnsService } from '@/services/returns';
import { silverRateService, type UpdateSilverRatePayload } from '@/services/silverRate';
import { ApiError } from '@/lib/api';

const Admin = () => {
  const { user, isAuthenticated } = useAuth();
  const role = user ? getUserRole(user) : 'customer';
  const isStaffOnly = role === 'staff';
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [showUpdateRate, setShowUpdateRate] = useState(false);

  // Edit product modal state
  const [productModalMode, setProductModalMode] = useState<'view' | 'edit' | null>(null);
  const [editingProduct, setEditingProduct] = useState<{ id: string; name: string; price: number; originalPrice?: number; image?: string; category: string; weight?: string; purity?: string; description?: string; inStock: boolean } | null>(null);
  const [editProductForm, setEditProductForm] = useState({ name: '', price: '', originalPrice: '', image: '', category: '', weight: '', purity: '', description: '', inStock: true });

  // Edit user modal state
  const [editingUser, setEditingUser] = useState<{ id: string; name: string; email: string; phone?: string; city?: string; isAdmin?: boolean } | null>(null);
  const [editUserForm, setEditUserForm] = useState({ name: '', phone: '', city: '' });
  const [passwordTargetUser, setPasswordTargetUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [newUserPassword, setNewUserPassword] = useState('');

  // Add Category state
  const [newCategory, setNewCategory] = useState('');
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
    ratePerGram: 0, purity: 'Silver',
  });

  // Shipping config state
  interface PinCodeRate { pincode: string; label: string; rate: number }
  const [pincodeRates, setPincodeRates] = useState<PinCodeRate[]>([
    { pincode: '600001', label: 'Chennai Central', rate: 50 },
    { pincode: '600006', label: 'Mylapore', rate: 50 },
  ]);
  const [newPincode, setNewPincode] = useState({ pincode: '', label: '', rate: '' });

  // Inventory state
  const [showInwardModal, setShowInwardModal] = useState(false);
  const [showOutwardModal, setShowOutwardModal] = useState(false);
  const [showReconcileModal, setShowReconcileModal] = useState(false);
  const [inventoryForm, setInventoryForm] = useState({ productId: '', quantity: '', reason: '' });
  const [reconcileForm, setReconcileForm] = useState({ productId: '', physicalCount: '' });
  const [mockInventoryTransactions, setMockInventoryTransactions] = useState([
    { id: '1', type: 'IN', productId: 'p1', productName: 'Silver Ring 925', quantity: 50, date: '2023-11-20T10:00:00Z', reason: 'New Stock Restock' },
    { id: '2', type: 'OUT', productId: 'p1', productName: 'Silver Ring 925', quantity: 2, date: '2023-11-21T14:30:00Z', reason: 'Order #12093' },
    { id: '3', type: 'RECONCILE', productId: 'p2', productName: 'Polished Chain', quantity: -2, date: '2023-11-22T09:15:00Z', reason: 'Monthly Audit Adjustment' },
  ]);

  const handleStockInward = () => {
    // TODO: Wire API (POST /admin/inventory/inward)
    toast({ title: 'Stock Inward Recorded', description: 'API not wired yet.' });
    setShowInwardModal(false);
    setInventoryForm({ productId: '', quantity: '', reason: '' });
  };

  const handleStockOutward = () => {
    // TODO: Wire API (POST /admin/inventory/outward)
    toast({ title: 'Stock Outward Recorded', description: 'API not wired yet.' });
    setShowOutwardModal(false);
    setInventoryForm({ productId: '', quantity: '', reason: '' });
  };

  const handleReconcile = () => {
    // TODO: Wire API (POST /admin/inventory/reconcile)
    toast({ title: 'Inventory Reconciled', description: 'Stock levels updated based on physical count.' });
    setShowReconcileModal(false);
    setReconcileForm({ productId: '', physicalCount: '' });
  };

  const addPincodeRate = () => {
    const rate = Number(newPincode.rate);
    if (!newPincode.pincode || !newPincode.label || !Number.isFinite(rate) || rate < 0) return;
    if (pincodeRates.some(r => r.pincode === newPincode.pincode)) {
      toast({ title: 'Duplicate pincode', description: 'This pincode already exists.', variant: 'destructive' });
      return;
    }
    setPincodeRates(prev => [...prev, { pincode: newPincode.pincode, label: newPincode.label, rate }]);
    setNewPincode({ pincode: '', label: '', rate: '' });
    toast({ title: 'Pincode Rate Added' });
  };

  const deletePincodeRate = (pincode: string) => {
    setPincodeRates(prev => prev.filter(r => r.pincode !== pincode));
    toast({ title: 'Pincode Rate Removed' });
  };

  // Offline stall toggle (persisted in localStorage so Signup page can read it)
  const [offlineStallActive, setOfflineStallActive] = useState(() => localStorage.getItem('kv-offline-stall') === 'true');

  // Shop filter config (persisted in localStorage so Shop page can read it)
  interface FilterPriceRange { label: string; value: string }
  interface FilterConfig {
    hiddenCategories: string[];
    metals: string[];
    priceRanges: FilterPriceRange[];
  }
  const DEFAULT_FILTER_CONFIG: FilterConfig = {
    hiddenCategories: [],
    metals: ['Silver', 'Gold 22K'],
    priceRanges: [
      { label: 'Under ₹500', value: '0-500' },
      { label: '₹500 - ₹1,000', value: '500-1000' },
      { label: '₹1,000 - ₹2,000', value: '1000-2000' },
      { label: 'Above ₹5,000', value: '5000+' },
    ],
  };
  const [filterConfig, setFilterConfig] = useState<FilterConfig>(() => {
    try {
      const stored = localStorage.getItem('kv-filter-config');
      return stored ? { ...DEFAULT_FILTER_CONFIG, ...JSON.parse(stored) } : DEFAULT_FILTER_CONFIG;
    } catch {
      return DEFAULT_FILTER_CONFIG;
    }
  });
  const saveFilterConfig = (updated: FilterConfig) => {
    setFilterConfig(updated);
    localStorage.setItem('kv-filter-config', JSON.stringify(updated));
    toast({ title: 'Filter settings saved' });
  };
  const [newMetal, setNewMetal] = useState('');
  const [newPriceRange, setNewPriceRange] = useState({ label: '', value: '' });

  // Theme customization state
  const [activeTheme, setActiveTheme] = useState('ocean-teal');
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  const colorThemes: Record<string, { label: string; swatch: string; primary: string; ring: string }> = {
    'ocean-teal': { label: 'Ocean Teal', swatch: 'hsl(195 50% 45%)', primary: '195 50% 45%', ring: '195 50% 45%' },
    'rose-gold': { label: 'Warm Rose Gold', swatch: 'hsl(350 40% 50%)', primary: '350 40% 50%', ring: '350 40% 50%' },
    'icy-silver': { label: 'Icy Silver', swatch: 'hsl(210 25% 45%)', primary: '210 25% 45%', ring: '210 25% 45%' },
    'deep-amethyst': { label: 'Deep Amethyst', swatch: 'hsl(270 40% 45%)', primary: '270 40% 45%', ring: '270 40% 45%' },
  };

  const applyColorTheme = (key: string) => {
    setActiveTheme(key);
    const t = colorThemes[key];
    document.documentElement.style.setProperty('--primary', t.primary);
    document.documentElement.style.setProperty('--ring', t.ring);
  };

  const toggleDarkMode = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
  };

  /* ── Queries ── */
  const { data: allCategories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: productService.getCategories,
    enabled: role === 'admin' || role === 'staff',
  });

  const { data: adminStoreConfig } = useQuery({
    queryKey: ['admin-store-config'],
    queryFn: adminService.getStoreConfig,
    enabled: role === 'admin',
    meta: { errorMessage: 'Failed to load store theme config' },
  });

  const { data: adminStats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminService.getStats,
    enabled: role === 'admin' || role === 'staff',
    meta: { errorMessage: 'Failed to load dashboard stats' },
  });

  const { data: allProducts = [], isLoading: productsLoading, isError: productsError } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => productService.getProducts(),
    enabled: role === 'admin' || role === 'staff',
    meta: { errorMessage: 'Failed to load products' },
  });

  const { data: allOrders = [], isLoading: ordersLoading, isError: ordersError } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: adminService.getAllOrders,
    enabled: role === 'admin' || role === 'staff',
    meta: { errorMessage: 'Failed to load orders' },
  });

  const { data: allUsers = [], isLoading: usersLoading, isError: usersError } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminService.getAllUsers,
    enabled: role === 'admin' || role === 'staff',
    meta: { errorMessage: 'Failed to load customers' },
  });

  const { data: allSavings = [], isLoading: savingsLoading, isError: savingsError } = useQuery({
    queryKey: ['admin-savings'],
    queryFn: adminService.getAllSavingsSchemes,
    enabled: role === 'admin' || role === 'staff',
    meta: { errorMessage: 'Failed to load savings schemes' },
  });

  const { data: allCoupons = [], isLoading: couponsLoading, isError: couponsError } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: couponService.getAllCoupons,
    enabled: role === 'admin' || role === 'staff',
    meta: { errorMessage: 'Failed to load coupons' },
  });

  const { data: allReturns = [], isLoading: returnsLoading, isError: returnsError } = useQuery({
    queryKey: ['admin-returns'],
    queryFn: returnsService.getAllReturns,
    enabled: role === 'admin' || role === 'staff',
    meta: { errorMessage: 'Failed to load return requests' },
  });

  const { data: silverRates = [], isLoading: ratesLoading, isError: ratesError } = useQuery({
    queryKey: ['admin-silver-rates'],
    queryFn: silverRateService.getAllRates,
    enabled: role === 'admin' || role === 'staff',
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

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof adminService.updateProduct>[1] }) =>
      adminService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setProductModalMode(null);
      setEditingProduct(null);
      toast({ title: 'Product Updated' });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: adminService.deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast({ title: 'Order Deleted' });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: adminService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Customer Deleted' });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; phone: string; city: string } }) =>
      adminService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setEditingUser(null);
      toast({ title: 'Customer Updated' });
    },
  });

  const updateStoreConfigMutation = useMutation({
    mutationFn: adminService.updateStoreConfig,
    onSuccess: () => {
      toast({ title: 'Theme Saved', description: 'Global theme preferences have been saved.' });
    },
    onError: () => {
      toast({ title: 'Save failed', description: 'Unable to save theme settings.', variant: 'destructive' });
    },
  });

  const changeUserPasswordMutation = useMutation({
    mutationFn: ({ userId, newPassword }: { userId: string; newPassword: string }) =>
      authService.changePassword(userId, newPassword),
    onSuccess: () => {
      setPasswordTargetUser(null);
      setNewUserPassword('');
      toast({
        title: 'Password Updated',
        description: 'Customer password changed successfully.',
      });
    },
    onError: (error: unknown) => {
      let description = 'Failed to change password.';

      if (error instanceof ApiError) {
        if (error.statusCode === 400) {
          description = 'Password is weak or invalid.';
        } else if (error.statusCode === 403) {
          description = 'You are not allowed to change this user password.';
        } else if (error.statusCode === 404) {
          description = 'Target user was not found.';
        } else if (error.message) {
          description = error.message;
        }
      }

      toast({
        title: 'Change password failed',
        description,
        variant: 'destructive',
      });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: productService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setNewCategory('');
      toast({ title: 'Category Added' });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: productService.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: 'Category Removed' });
    },
  });

  useEffect(() => {
    if (!adminStoreConfig) return;
    if (!colorThemes[adminStoreConfig.theme]) return;

    setActiveTheme(adminStoreConfig.theme);
    const selected = colorThemes[adminStoreConfig.theme];
    document.documentElement.style.setProperty('--primary', selected.primary);
    document.documentElement.style.setProperty('--ring', selected.ring);
    setIsDark(!!adminStoreConfig.isDark);
    document.documentElement.classList.toggle('dark', !!adminStoreConfig.isDark);
    localStorage.setItem('kv-theme-config', JSON.stringify(adminStoreConfig));
  }, [adminStoreConfig]);

  // Searchable Product Dropdown Component
  const ProductSearchSelect = ({ 
    value, 
    onValueChange, 
    products 
  }: { 
    value: string; 
    onValueChange: (val: string) => void; 
    products: any[] 
  }) => {
    const [open, setOpen] = useState(false);
    const selectedProduct = products.find((p) => p.id === value);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between mt-1 font-normal"
          >
            {selectedProduct ? (
              <span className="truncate">{selectedProduct.name}</span>
            ) : (
              <span className="text-muted-foreground">Select product...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search product name..." />
            <CommandList>
              <CommandEmpty>No product found.</CommandEmpty>
              <CommandGroup>
                {products.map((product) => (
                  <CommandItem
                    key={product.id}
                    value={product.name}
                    onSelect={() => {
                      onValueChange(product.id === value ? "" : product.id);
                      setOpen(false);
                    }}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{product.name}</span>
                      <span className="text-[10px] text-muted-foreground uppercase">{product.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                      {value === product.id && <Check className="h-4 w-4 text-primary" />}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

  if (!isAuthenticated || (role !== 'admin' && role !== 'staff')) {
    return <Navigate to="/login" />;
  }

  const ApiErrorState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center py-12 text-destructive gap-2">
      <XCircle className="h-8 w-8" />
      <p className="text-sm font-medium">{message}</p>
      <p className="text-xs text-muted-foreground">Check that the backend API is running and your VITE_API_URL is correct.</p>
    </div>
  );

  const stats = isStaffOnly
    ? [
        { title: 'Total Orders', value: adminStats?.totalOrders?.toString() ?? '0', icon: ShoppingCart, change: adminStats?.changes?.orders ?? null },
        { title: 'Total Products', value: adminStats?.totalProducts?.toString() ?? '0', icon: Package, change: adminStats?.changes?.products ?? null },
        { title: 'Total Customers', value: adminStats?.totalCustomers?.toString() ?? '0', icon: Users, change: adminStats?.changes?.customers ?? null },
      ]
    : [
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

  const handleUpdateProduct = () => {
    if (!editingProduct) return;
    updateProductMutation.mutate({
      id: editingProduct.id,
      data: {
        name: editProductForm.name,
        price: Number(editProductForm.price),
        originalPrice: editProductForm.originalPrice ? Number(editProductForm.originalPrice) : undefined,
        image: editProductForm.image,
        category: editProductForm.category,
        weight: editProductForm.weight,
        purity: editProductForm.purity,
        description: editProductForm.description,
        inStock: editProductForm.inStock,
      },
    });
  };

  const openProductModal = (product: typeof allProducts[0], mode: 'view' | 'edit') => {
    setEditingProduct(product);
    setProductModalMode(mode);
    setEditProductForm({
      name: product.name,
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : '',
      image: product.image || '',
      category: product.category || '',
      weight: product.weight || '',
      purity: product.purity || '',
      description: product.description || '',
      inStock: product.inStock,
    });
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>, setter: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setter(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-4xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground">
              Welcome back, {user?.name}
              <span className={`ml-2 inline-block text-xs px-2 py-0.5 rounded-full font-medium ${isStaffOnly ? 'bg-blue-100 text-blue-700' : 'bg-accent/20 text-primary'}`}>
                {role}
              </span>
            </p>
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
            {/* Shipping config — staff can manage delivery fees */}
            <TabsTrigger value="shipping" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Shipping
            </TabsTrigger>
            {/* Filter config — admin and staff can customize shop filters */}
            <TabsTrigger value="filters" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </TabsTrigger>
            <TabsTrigger value="inventory" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              Inventory
            </TabsTrigger>
            {/* Theme editor — admin only (financial/branding control) */}
            {!isStaffOnly && (
              <TabsTrigger value="theme" className="gap-2">
                <Palette className="h-4 w-4" />
                Theme
              </TabsTrigger>
            )}
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
                        <stat.icon className="h-6 w-6 text-primary" />
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
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                          <Label htmlFor="prod-image">Product Image</Label>
                          <input
                            id="prod-image"
                            type="file"
                            accept="image/*"
                            className="mt-1 block w-full text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-muted file:text-foreground cursor-pointer"
                            onChange={(e) => handleImageFile(e, (base64) => setProductForm({ ...productForm, image: base64 }))}
                          />
                          {productForm.image && (
                            <img src={productForm.image} alt="preview" className="mt-2 h-20 w-20 object-cover rounded border" />
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Category</Label>
                            <Select value={productForm.category} onValueChange={(v) => setProductForm({ ...productForm, category: v })}>
                              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {(allCategories.length > 0 ? allCategories : ['Necklaces', 'Bangles', 'Earrings', 'Rings', 'Anklets', 'Coins', 'Puja Items']).map((c) => (
                                  <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Type</Label>
                            <Select value={productForm.purity} onValueChange={(v) => setProductForm({ ...productForm, purity: v })}>
                              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Silver">Silver</SelectItem>
                                <SelectItem value="22K Gold">22K Gold</SelectItem>
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
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                            <Button variant="ghost" size="icon" onClick={() => openProductModal(product, 'view')}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openProductModal(product, 'edit')}>
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

          {/* Edit / View Product modal */}
          <Dialog open={productModalMode !== null} onOpenChange={(open) => { if (!open) { setProductModalMode(null); setEditingProduct(null); } }}>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-serif">{productModalMode === 'edit' ? 'Edit Product' : 'View Product'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label>Product Name</Label>
                  <Input value={editProductForm.name} disabled={productModalMode === 'view'} onChange={(e) => setEditProductForm({ ...editProductForm, name: e.target.value })} className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Price (₹)</Label>
                    <Input type="number" value={editProductForm.price} disabled={productModalMode === 'view'} onChange={(e) => setEditProductForm({ ...editProductForm, price: e.target.value })} className="mt-1" />
                  </div>
                  <div>
                    <Label>Original Price (₹)</Label>
                    <Input type="number" value={editProductForm.originalPrice} disabled={productModalMode === 'view'} onChange={(e) => setEditProductForm({ ...editProductForm, originalPrice: e.target.value })} className="mt-1" placeholder="Optional" />
                  </div>
                </div>
                <div>
                  <Label>Product Image</Label>
                  {editProductForm.image && (
                    <img src={editProductForm.image} alt="current" className="mt-1 h-20 w-20 object-cover rounded border mb-2" />
                  )}
                  {productModalMode === 'edit' && (
                    <input
                      type="file"
                      accept="image/*"
                      className="block w-full text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-muted file:text-foreground cursor-pointer"
                      onChange={(e) => handleImageFile(e, (base64) => setEditProductForm({ ...editProductForm, image: base64 }))}
                    />
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    {productModalMode === 'edit' ? (
                      <Select value={editProductForm.category} onValueChange={(v) => setEditProductForm({ ...editProductForm, category: v })}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(allCategories.length > 0 ? allCategories : ['Necklaces', 'Bangles', 'Earrings', 'Rings', 'Anklets', 'Coins', 'Puja Items']).map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input value={editProductForm.category} disabled className="mt-1" />
                    )}
                  </div>
                  <div>
                    <Label>Type</Label>
                    {productModalMode === 'edit' ? (
                      <Select value={editProductForm.purity} onValueChange={(v) => setEditProductForm({ ...editProductForm, purity: v })}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Silver">Silver</SelectItem>
                          <SelectItem value="22K Gold">22K Gold</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input value={editProductForm.purity} disabled className="mt-1" />
                    )}
                  </div>
                </div>
                <div>
                  <Label>Weight</Label>
                  <Input value={editProductForm.weight} disabled={productModalMode === 'view'} onChange={(e) => setEditProductForm({ ...editProductForm, weight: e.target.value })} className="mt-1" placeholder="e.g. 45g" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea value={editProductForm.description} disabled={productModalMode === 'view'} onChange={(e) => setEditProductForm({ ...editProductForm, description: e.target.value })} className="mt-1" rows={3} />
                </div>
                {productModalMode === 'edit' && (
                  <Button onClick={handleUpdateProduct} disabled={updateProductMutation.isPending || !editProductForm.name || !editProductForm.price}>
                    {updateProductMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>

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
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => {
                                if (window.confirm('Delete this order? This cannot be undone.')) {
                                  deleteOrderMutation.mutate(order.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                      <TableHead className="text-right">Actions</TableHead>
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
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {role === 'admin' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setPasswordTargetUser({ id: u.id, name: u.name, email: u.email });
                                  setNewUserPassword('');
                                }}
                                title="Change Password"
                              >
                                <KeyRound className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingUser({ id: u.id, name: u.name, email: u.email, phone: u.phone, city: u.city, isAdmin: u.isAdmin });
                                setEditUserForm({ name: u.name, phone: u.phone || '', city: u.city || '' });
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => {
                                if (window.confirm(`Delete customer "${u.name}"? This cannot be undone.`)) {
                                  deleteUserMutation.mutate(u.id);
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
              ) : (
                <p className="text-muted-foreground text-center py-8">No customers found.</p>
              )}
            </Card>
          </TabsContent>

          {/* Edit Customer modal */}
          <Dialog open={editingUser !== null} onOpenChange={(open) => { if (!open) setEditingUser(null); }}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle className="font-serif">Edit Customer</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label>Email</Label>
                  <Input value={editingUser?.email ?? ''} disabled className="mt-1 text-muted-foreground" />
                </div>
                <div>
                  <Label>Name</Label>
                  <Input value={editUserForm.name} onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={editUserForm.phone} onChange={(e) => setEditUserForm({ ...editUserForm, phone: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label>City</Label>
                  <Input value={editUserForm.city} onChange={(e) => setEditUserForm({ ...editUserForm, city: e.target.value })} className="mt-1" />
                </div>
                <Button
                  onClick={() => {
                    if (!editingUser) return;
                    updateUserMutation.mutate({ id: editingUser.id, data: editUserForm });
                  }}
                  disabled={updateUserMutation.isPending || !editUserForm.name}
                >
                  {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {role === 'admin' && (
            <Dialog
              open={passwordTargetUser !== null}
              onOpenChange={(open) => {
                if (!open) {
                  setPasswordTargetUser(null);
                  setNewUserPassword('');
                }
              }}
            >
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle className="font-serif">Change Customer Password</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                  <div>
                    <Label>User</Label>
                    <Input
                      value={passwordTargetUser ? `${passwordTargetUser.name} (${passwordTargetUser.email})` : ''}
                      disabled
                      className="mt-1 text-muted-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="admin-new-password">New Password</Label>
                    <Input
                      id="admin-new-password"
                      type="password"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      className="mt-1"
                      placeholder="Enter new password"
                    />
                  </div>
                  <Button
                    onClick={() => {
                      if (!passwordTargetUser || !newUserPassword.trim()) return;
                      changeUserPasswordMutation.mutate({
                        userId: passwordTargetUser.id,
                        newPassword: newUserPassword,
                      });
                    }}
                    disabled={changeUserPasswordMutation.isPending || !newUserPassword.trim()}
                  >
                    {changeUserPasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* ═══════ SAVINGS SCHEMES ═══════ */}
          <TabsContent value="savings">
            <Card className="p-6">
              <h2 className="font-serif text-xl font-semibold mb-6">Savings Scheme Enrollments</h2>
              {savingsLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                      <TableRow key={ret.id || ret._id}>
                        <TableCell className="font-medium">#{String(ret.id || ret._id || '').slice(-6)}</TableCell>
                        <TableCell>#{String(ret.orderId || '').slice(-6)}</TableCell>
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
                            <SelectItem value="Silver">Silver</SelectItem>
                            <SelectItem value="22K Gold">22K Gold</SelectItem>
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
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

          {/* ═══════ SHIPPING CONFIG ═══════ */}
          <TabsContent value="shipping">
            <div className="space-y-6">
              {/* Offline Stall Toggle */}
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-xl font-semibold">Offline Stall Event</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      When active, new registrations at physical stalls will be flagged and auto-credited a promotional coupon.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const next = !offlineStallActive;
                      setOfflineStallActive(next);
                      localStorage.setItem('kv-offline-stall', String(next));
                      toast({ title: `Offline Stall ${next ? 'Activated' : 'Deactivated'}` });
                    }}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${offlineStallActive ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${offlineStallActive ? 'translate-x-8' : 'translate-x-1'}`} />
                  </button>
                </div>
                <p className={`mt-3 text-xs font-medium ${offlineStallActive ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {offlineStallActive ? '● Offline stall mode is ACTIVE' : '○ Offline stall mode is inactive'}
                </p>
              </Card>

              {/* Pincode Rate Matrix */}
              <Card className="p-6">
                <h2 className="font-serif text-xl font-semibold mb-1">Delivery Fee Matrix</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Map pincodes to delivery charges. Checkout will cross-reference the customer's destination pin.
                </p>

                {/* Add New */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
                  <Input
                    placeholder="Pincode (e.g. 600001)"
                    value={newPincode.pincode}
                    onChange={e => setNewPincode(p => ({ ...p, pincode: e.target.value }))}
                    maxLength={6}
                  />
                  <Input
                    placeholder="Area label"
                    value={newPincode.label}
                    onChange={e => setNewPincode(p => ({ ...p, label: e.target.value }))}
                  />
                  <Input
                    placeholder="Rate (₹)"
                    type="number"
                    min={0}
                    value={newPincode.rate}
                    onChange={e => setNewPincode(p => ({ ...p, rate: e.target.value }))}
                  />
                  <Button onClick={addPincodeRate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>

                {pincodeRates.length === 0 ? (
                  <p className="text-muted-foreground text-center py-6 text-sm">No pincode rates configured.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pincode</TableHead>
                        <TableHead>Area</TableHead>
                        <TableHead>Delivery Fee</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pincodeRates.map(r => (
                        <TableRow key={r.pincode}>
                          <TableCell className="font-mono font-medium">{r.pincode}</TableCell>
                          <TableCell>{r.label}</TableCell>
                          <TableCell>{formatPrice(r.rate)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => deletePincodeRate(r.pincode)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* ═══════ SHOP FILTER CONFIGURATION ═══════ */}
          <TabsContent value="filters">
            <div className="space-y-6">

              {/* Manage Categories */}
              <Card className="p-6">
                <h2 className="font-serif text-xl font-semibold mb-1">Manage Categories</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Add or remove product categories. Changes update the global category list used by the shop and product forms.
                </p>
                <div className="flex gap-3 mb-4">
                  <Input
                    placeholder="New category name (e.g. Pendants)"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const trimmed = newCategory.trim();
                        if (trimmed && !allCategories.includes(trimmed)) createCategoryMutation.mutate(trimmed);
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => {
                      const trimmed = newCategory.trim();
                      if (trimmed && !allCategories.includes(trimmed)) createCategoryMutation.mutate(trimmed);
                    }}
                    disabled={createCategoryMutation.isPending || !newCategory.trim()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                {allCategories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No categories yet. Add one above.</p>
                ) : (
                  <div className="space-y-2">
                    {allCategories.map((cat) => (
                      <div key={cat} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/40">
                        <span className="text-sm font-medium">{cat}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (window.confirm(`Remove category "${cat}"? Products in this category will be unaffected.`)) {
                              deleteCategoryMutation.mutate(cat);
                            }
                          }}
                          disabled={deleteCategoryMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Category Visibility */}
              <Card className="p-6">
                <h2 className="font-serif text-xl font-semibold mb-1">Category Visibility</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Toggle which product categories appear in the Shop filter sidebar. Hidden categories are still browseable via search.
                </p>
                {allCategories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No categories found. Add products first.</p>
                ) : (
                  <div className="divide-y divide-border">
                    {allCategories.map((cat) => {
                      const isHidden = filterConfig.hiddenCategories.includes(cat);
                      return (
                        <div key={cat} className="flex items-center justify-between py-3">
                          <span className={`text-sm font-medium ${isHidden ? 'text-muted-foreground line-through' : ''}`}>{cat}</span>
                          <button
                            onClick={() => {
                              const updated = isHidden
                                ? { ...filterConfig, hiddenCategories: filterConfig.hiddenCategories.filter(c => c !== cat) }
                                : { ...filterConfig, hiddenCategories: [...filterConfig.hiddenCategories, cat] };
                              saveFilterConfig(updated);
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${!isHidden ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${!isHidden ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>

              {/* Metal Filters */}
              <Card className="p-6">
                <h2 className="font-serif text-xl font-semibold mb-1">Metal Filter Options</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Define which metal types appear as filter options in the Shop sidebar.
                </p>
                <div className="flex gap-3 mb-4">
                  <Input
                    placeholder="e.g. Platinum"
                    value={newMetal}
                    onChange={e => setNewMetal(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') e.currentTarget.blur();
                    }}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => {
                      const trimmed = newMetal.trim();
                      if (!trimmed || filterConfig.metals.includes(trimmed)) return;
                      saveFilterConfig({ ...filterConfig, metals: [...filterConfig.metals, trimmed] });
                      setNewMetal('');
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {filterConfig.metals.map((metal) => (
                    <div key={metal} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/40">
                      <span className="text-sm font-medium">{metal}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => saveFilterConfig({ ...filterConfig, metals: filterConfig.metals.filter(m => m !== metal) })}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Price Range Filters */}
              <Card className="p-6">
                <h2 className="font-serif text-xl font-semibold mb-1">Price Range Options</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Define price range bands shown in the Shop filter. Use format <span className="font-mono text-xs bg-muted px-1 rounded">min-max</span> (e.g. <span className="font-mono text-xs bg-muted px-1 rounded">500-1000</span>) or <span className="font-mono text-xs bg-muted px-1 rounded">min+</span> for open-ended (e.g. <span className="font-mono text-xs bg-muted px-1 rounded">5000+</span>).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <Input
                    placeholder="Label (e.g. Under ₹500)"
                    value={newPriceRange.label}
                    onChange={e => setNewPriceRange(p => ({ ...p, label: e.target.value }))}
                  />
                  <Input
                    placeholder="Value (e.g. 0-500)"
                    value={newPriceRange.value}
                    onChange={e => setNewPriceRange(p => ({ ...p, value: e.target.value }))}
                  />
                  <Button
                    onClick={() => {
                      const label = newPriceRange.label.trim();
                      const value = newPriceRange.value.trim();
                      if (!label || !value) return;
                      if (filterConfig.priceRanges.some(r => r.value === value)) {
                        toast({ title: 'Duplicate value', description: 'A range with this value already exists.', variant: 'destructive' });
                        return;
                      }
                      saveFilterConfig({ ...filterConfig, priceRanges: [...filterConfig.priceRanges, { label, value }] });
                      setNewPriceRange({ label: '', value: '' });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Label</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterConfig.priceRanges.map((range) => (
                      <TableRow key={range.value}>
                        <TableCell className="font-medium">{range.label}</TableCell>
                        <TableCell className="font-mono text-sm">{range.value}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => saveFilterConfig({ ...filterConfig, priceRanges: filterConfig.priceRanges.filter(r => r.value !== range.value) })}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>

            </div>
          </TabsContent>

          {/* ═══════ INVENTORY MANAGER ═══════ */}
          <TabsContent value="inventory">
            <div className="space-y-6">
              {/* Inventory Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-gradient-to-br from-primary/5 to-transparent">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Total Products</p>
                      <p className="text-2xl font-bold">{allProducts.length}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-amber-500/5 to-transparent border-amber-500/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                      <AlertCircle className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Low Stock Alerts</p>
                      <p className="text-2xl font-bold text-amber-600">4</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-6 bg-gradient-to-br from-blue-500/5 to-transparent border-blue-500/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <History className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Recent Movements</p>
                      <p className="text-2xl font-bold text-blue-600">{mockInventoryTransactions.length}</p>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                  <div>
                    <h2 className="font-serif text-xl font-semibold">Stock Ledger</h2>
                    <p className="text-sm text-muted-foreground">Track movement and verify physical counts.</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Dialog open={showInwardModal} onOpenChange={setShowInwardModal}>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700 text-white">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Inward
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Stock Inward</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <Label>Select Product</Label>
                            <ProductSearchSelect 
                              value={inventoryForm.productId}
                              onValueChange={(v) => setInventoryForm({ ...inventoryForm, productId: v })}
                              products={allProducts}
                            />
                          </div>
                          <div>
                            <Label>Quantity to Add</Label>
                            <Input 
                              type="number"
                              min="1"
                              value={inventoryForm.quantity}
                              onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Reason</Label>
                            <Input 
                              placeholder="e.g. Supplier delivery"
                              value={inventoryForm.reason}
                              onChange={(e) => setInventoryForm({ ...inventoryForm, reason: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                          <Button className="w-full" onClick={handleStockInward}>Record Inward</Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={showOutwardModal} onOpenChange={setShowOutwardModal}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                          <TrendingDown className="h-4 w-4 mr-2" />
                          Outward
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Stock Outward</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <Label>Select Product</Label>
                            <ProductSearchSelect 
                              value={inventoryForm.productId}
                              onValueChange={(v) => setInventoryForm({ ...inventoryForm, productId: v })}
                              products={allProducts}
                            />
                          </div>
                          <div>
                            <Label>Quantity to Remove</Label>
                            <Input 
                              type="number"
                              min="1"
                              value={inventoryForm.quantity}
                              onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label>Reason</Label>
                            <Input 
                              placeholder="e.g. Damaged"
                              value={inventoryForm.reason}
                              onChange={(e) => setInventoryForm({ ...inventoryForm, reason: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                          <Button variant="destructive" className="w-full" onClick={handleStockOutward}>Record Outward</Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={showReconcileModal} onOpenChange={setShowReconcileModal}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
                          <Scale className="h-4 w-4 mr-2" />
                          Reconcile
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Stock Reconciliation</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="bg-primary/5 p-4 rounded-lg text-sm text-primary mb-2">
                            <p>Enter the <strong>actual physical count</strong> from your audit. The system will calculate the adjustment automatically.</p>
                          </div>
                          <div>
                            <Label>Select Product</Label>
                            <ProductSearchSelect 
                              value={reconcileForm.productId}
                              onValueChange={(v) => setReconcileForm({ ...reconcileForm, productId: v })}
                              products={allProducts}
                            />
                          </div>
                          <div>
                            <Label>Physical Count Found</Label>
                            <Input 
                              type="number"
                              placeholder="Current total on shelf"
                              value={reconcileForm.physicalCount}
                              onChange={(e) => setReconcileForm({ ...reconcileForm, physicalCount: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                          <Button className="w-full" onClick={handleReconcile}>Submit Audit</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Change</TableHead>
                        <TableHead>Status Impact</TableHead>
                        <TableHead>Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockInventoryTransactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell className="text-sm">{new Date(tx.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              tx.type === 'IN' ? 'bg-green-100 text-green-700' : 
                              tx.type === 'OUT' ? 'bg-red-100 text-red-700' : 
                              'bg-primary/10 text-primary'
                            }`}>
                              {tx.type}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium text-sm">{tx.productName}</TableCell>
                          <TableCell className={`text-sm font-semibold ${tx.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}
                          </TableCell>
                          <TableCell>
                            {tx.quantity < -5 ? (
                              <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                                <AlertCircle className="h-3 w-3" />
                                Low Stock
                              </span>
                            ) : (
                              <span className="text-xs text-green-600 font-medium">Normal</span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs">{tx.reason}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* ═══════ THEME CUSTOMIZATION ═══════ */}
          <TabsContent value="theme">
            <div className="space-y-6">
              {/* Color Palette */}
              <Card className="p-6">
                <h2 className="font-serif text-xl font-semibold mb-1">Color Palette</h2>
                <p className="text-sm text-muted-foreground mb-6">Choose the primary accent color for the storefront.</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {Object.entries(colorThemes).map(([key, theme]) => (
                    <button
                      key={key}
                      onClick={() => applyColorTheme(key)}
                      className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${activeTheme === key ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                    >
                      <span
                        className="h-10 w-10 rounded-full shadow-md ring-2 ring-white"
                        style={{ background: theme.swatch }}
                      />
                      <span className="text-xs text-center font-medium text-primary leading-tight">{theme.label}</span>
                      {activeTheme === key && <Check className="h-3.5 w-3.5 text-primary" />}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Dark / Light Mode */}
              <Card className="p-6">
                <h2 className="font-serif text-xl font-semibold mb-1">Display Mode</h2>
                <p className="text-sm text-muted-foreground mb-6">Switch between light and dark interface themes.</p>
                <div className="flex gap-4">
                  <button
                    onClick={() => { if (isDark) toggleDarkMode(); }}
                    className={`flex-1 flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${!isDark ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                  >
                    <Sun className="h-7 w-7 text-amber-500" strokeWidth={1.5} />
                    <span className="text-sm font-medium text-primary">Light</span>
                    {!isDark && <Check className="h-3.5 w-3.5 text-primary" />}
                  </button>
                  <button
                    onClick={() => { if (!isDark) toggleDarkMode(); }}
                    className={`flex-1 flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${isDark ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                  >
                    <Moon className="h-7 w-7 text-blue-400" strokeWidth={1.5} />
                    <span className="text-sm font-medium text-primary">Dark</span>
                    {isDark && <Check className="h-3.5 w-3.5 text-primary" />}
                  </button>
                </div>
              </Card>

              {/* Save Global Theme */}
              <Card className="p-6">
                <h2 className="font-serif text-xl font-semibold mb-1">Save Global Theme</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Persist the selected theme and display mode for all users by saving to the server. Theme is also saved to localStorage for instant fallback.
                </p>
                <Button
                  onClick={async () => {
                    const config = { theme: activeTheme, isDark };
                    localStorage.setItem('kv-theme-config', JSON.stringify(config));
                    await updateStoreConfigMutation.mutateAsync(config);
                  }}
                  disabled={updateStoreConfigMutation.isPending}
                >
                  <Check className="h-4 w-4 mr-2" />
                  {updateStoreConfigMutation.isPending ? 'Saving...' : 'Save Global Theme'}
                </Button>
              </Card>

              {/* Tip */}
              <div className="bg-secondary/40 rounded-lg p-4 text-sm text-muted-foreground border border-border/60">
                <strong className="text-foreground font-medium">Note:</strong> Theme changes apply immediately across the entire storefront. Click "Save Global Theme" above to persist them for all users. To make changes permanent in code, update the CSS variables in <code className="text-xs bg-secondary px-1 py-0.5 rounded">src/index.css</code>.
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
