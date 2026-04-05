import { Navigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package, CreditCard, Loader2, ExternalLink, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { orderService, type Order } from '@/services/order';
import { savingsService, type SavingsEnrollment } from '@/services/savings';

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Shipped: 'bg-blue-100 text-blue-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const paymentStatusColors: Record<string, string> = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const OrdersTab = ({ orders, isLoading }: { orders: Order[]; isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="text-center py-16">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No orders yet.</p>
        <Button asChild variant="link" className="mt-2">
          <Link to="/shop">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const paymentStatus = (order as any).paymentStatus ?? 'paid';
        return (
          <Card key={order.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Order #{(order.id ?? '').slice(-8).toUpperCase()}</p>
                <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status] ?? 'bg-muted text-muted-foreground'}`}>
                  {order.status}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${paymentStatusColors[paymentStatus] ?? 'bg-muted text-muted-foreground'}`}>
                  Payment: {paymentStatus}
                </span>
              </div>
            </div>

            <div className="space-y-2 mb-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-foreground">{item.name} × {item.quantity}</span>
                  <span className="text-muted-foreground">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="font-semibold">{formatPrice(order.totalAmount)}</span>
              <Button asChild variant="outline" size="sm">
                <Link to={`/order/${order.id}`}>
                  Track Order <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

const SavingsTab = ({ schemes, isLoading }: { schemes: SavingsEnrollment[]; isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!schemes.length) {
    return (
      <div className="text-center py-16">
        <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">You have no active savings schemes.</p>
        <Button asChild variant="link" className="mt-2">
          <Link to="/savings-scheme">Explore Schemes</Link>
        </Button>
      </div>
    );
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  return (
    <div className="space-y-4">
      {schemes.map((scheme) => {
        const start = new Date(scheme.startDate);
        const maturity = new Date(start);
        maturity.setMonth(maturity.getMonth() + scheme.duration);
        const passbookNumber = (scheme as any).passbookNumber ?? scheme._id.slice(-8).toUpperCase();

        return (
          <Card key={scheme._id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Passbook #{passbookNumber}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  scheme.status === 'active' ? 'bg-green-100 text-green-700' :
                  scheme.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {scheme.status}
                </span>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/savings-scheme#passbook-${scheme._id}`}>
                  <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                  Passbook
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Monthly</p>
                <p className="font-semibold">{formatPrice(scheme.monthlyAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="font-semibold">{scheme.duration} months</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Started</p>
                <p className="font-semibold">{formatDate(scheme.startDate)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Matures</p>
                <p className="font-semibold">{formatDate(maturity.toISOString())}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border flex justify-between text-sm">
              <span className="text-muted-foreground">Total Paid</span>
              <span className="font-semibold">{formatPrice(scheme.totalPaid)}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

const CustomerDashboard = () => {
  const { user, isAuthenticated } = useAuth();

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: orderService.getMyOrders,
    enabled: isAuthenticated,
  });

  const { data: schemes = [], isLoading: schemesLoading } = useQuery({
    queryKey: ['my-savings'],
    queryFn: savingsService.getMySchemes,
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold text-foreground">My Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}</p>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList>
            <TabsTrigger value="orders" className="gap-2">
              <Package className="h-4 w-4" />
              My Orders
            </TabsTrigger>
            <TabsTrigger value="savings" className="gap-2">
              <CreditCard className="h-4 w-4" />
              My Savings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <OrdersTab orders={orders} isLoading={ordersLoading} />
          </TabsContent>

          <TabsContent value="savings">
            <SavingsTab schemes={schemes} isLoading={schemesLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CustomerDashboard;
