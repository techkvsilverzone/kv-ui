import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  ChevronRight,
  Loader2,
  MapPin,
  CreditCard,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { orderService } from '@/services/order';

const statusSteps = [
  { key: 'Pending', label: 'Order Placed', icon: Clock },
  { key: 'Processing', label: 'Processing', icon: Package },
  { key: 'Shipped', label: 'Shipped', icon: Truck },
  { key: 'Delivered', label: 'Delivered', icon: CheckCircle },
];

const OrderTracking = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: orderService.getMyOrders,
    enabled: !!isAuthenticated,
  });

  const order = orders.find((o) => o.id === id || o._id === id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusIndex = (status: string) => {
    if (status === 'Cancelled') return -1;
    const index = statusSteps.findIndex((s) => s.key === status);
    return index >= 0 ? index : 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-24 pb-16 text-center">
        <h2 className="font-serif text-2xl text-foreground mb-4">Order Not Found</h2>
        <p className="text-muted-foreground mb-6">We couldn't find this order in your history.</p>
        <Button asChild>
          <Link to="/profile">Back to Profile</Link>
        </Button>
      </div>
    );
  }

  const currentStatusIndex = getStatusIndex(order.status);
  const isCancelled = order.status === 'Cancelled';

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/profile" className="hover:text-foreground transition-colors">My Account</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">Order #{order.id.slice(-6)}</span>
        </nav>

        <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
          Order Tracking
        </h1>
        <p className="text-muted-foreground mb-8">
          Order #{order.id.slice(-6)} • Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        {/* Status Tracker */}
        <Card className="p-8 mb-8">
          {isCancelled ? (
            <div className="text-center py-6">
              <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="font-serif text-xl font-semibold text-destructive mb-2">Order Cancelled</h3>
              <p className="text-muted-foreground">This order has been cancelled. Refund will be processed if payment was made.</p>
            </div>
          ) : (
            <div className="flex items-center justify-between relative">
              {/* Progress Line */}
              <div className="absolute top-6 left-0 right-0 h-0.5 bg-border z-0">
                <div
                  className="h-full bg-accent transition-all duration-500"
                  style={{ width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` }}
                />
              </div>

              {statusSteps.map((step, index) => {
                const isActive = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                return (
                  <div key={step.key} className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                        isActive
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-muted text-muted-foreground'
                      } ${isCurrent ? 'ring-4 ring-accent/20' : ''}`}
                    >
                      <step.icon className="h-5 w-5" />
                    </div>
                    <span className={`text-xs mt-2 font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="font-serif text-xl font-semibold mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold mt-1">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <hr className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(order.totalAmount / 1.05)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (GST 5%)</span>
                  <span>{formatPrice(order.totalAmount - order.totalAmount / 1.05)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-serif text-lg font-semibold">Shipping Address</h3>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </p>
                <p>Phone: {order.shippingAddress.phone}</p>
              </div>
            </Card>

            {/* Payment Info */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-serif text-lg font-semibold">Payment</h3>
              </div>
              <p className="text-sm text-muted-foreground capitalize">
                {order.paymentMethod === 'card' ? 'Credit/Debit Card' : order.paymentMethod === 'upi' ? 'UPI Payment' : order.paymentMethod === 'netbanking' ? 'Net Banking' : order.paymentMethod}
              </p>
            </Card>

            {/* Actions */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-serif text-lg font-semibold">Actions</h3>
              </div>
              <div className="space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/contact">Need Help?</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/profile">Back to Orders</Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
