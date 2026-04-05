import { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Package, ArrowRight, ShoppingBag, Loader2, Download, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { orderService } from '@/services/order';

const OrderConfirmation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: orderService.getMyOrders,
    enabled: !!isAuthenticated,
  });

  const order = orders.find((o) => o.id === id || o._id === id);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Celebration header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/10 py-24 px-4 text-center">
        {/* Decorative shimmer lines */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent" />
          <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent" />
        </div>

        <div className="relative max-w-2xl mx-auto">
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-500" strokeWidth={1.5} />
              </div>
              <div className="absolute -inset-2 rounded-full border border-green-200/50 animate-ping" />
            </div>
          </div>

          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">Order Confirmed</p>
          <h1 className="font-serif text-4xl md:text-5xl font-normal text-primary mb-4 leading-tight">
            Thank you for your<br />
            <span className="italic">precious order</span>
          </h1>
          <p className="text-muted-foreground text-lg font-light mb-2">
            Your silver treasures are being carefully prepared.
          </p>
          {order && (
            <p className="text-sm text-muted-foreground">
              Order <span className="font-medium text-foreground">#{order.id.slice(-8).toUpperCase()}</span> •{' '}
              {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* What happens next */}
        <div className="mb-16">
          <h2 className="font-serif text-2xl text-center mb-12 text-primary">What happens next</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: Package,
                title: 'Hallmarking & Packing',
                desc: 'Our artisans verify purity, apply BIS hallmarks, and pack your pieces in our signature gift box.',
              },
              {
                step: '02',
                icon: ShoppingBag,
                title: 'Insured Dispatch',
                desc: 'Your order is fully insured and dispatched via our trusted courier within 24–48 hours.',
              },
              {
                step: '03',
                icon: CheckCircle,
                title: 'Delivered to You',
                desc: 'Expect delivery within 5–7 business days. You\'ll receive tracking details via SMS & email.',
              },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center group">
                <div className="relative mb-6">
                  <span className="absolute -top-3 -left-3 text-[10px] font-medium text-muted-foreground/50 tracking-widest">{step}</span>
                  <div className="w-16 h-16 rounded-full border border-border bg-secondary/50 flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/5 transition-colors">
                    <Icon className="h-7 w-7 text-muted-foreground group-hover:text-primary transition-colors" strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="font-serif text-base font-medium text-primary mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Order summary */}
        {order && (
          <div className="border border-border rounded-lg overflow-hidden mb-12">
            <div className="bg-secondary/30 px-6 py-4 border-b border-border">
              <h3 className="font-serif text-lg text-primary">Order Summary</h3>
            </div>
            <div className="divide-y divide-border">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 object-cover rounded border border-border"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-secondary/20 flex justify-between items-center">
              <span className="text-sm font-medium">Total Paid</span>
              <span className="font-serif text-xl font-semibold text-primary">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        )}

        {/* Authenticity notice */}
        <div className="bg-primary/5 border border-primary/15 rounded-lg p-6 mb-12 flex gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle className="h-5 w-5 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <h4 className="font-serif text-base font-medium text-primary mb-1">Certificate of Authenticity Included</h4>
            <p className="text-sm text-muted-foreground font-light leading-relaxed">
              Your package will include a BIS Hallmark certificate and KV Silver Zone authenticity card. These documents verify the purity and craftsmanship of your silver pieces.
            </p>
          </div>
        </div>

        {/* CTA row */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {order && (
            <Link to={`/order/${order.id}`}>
              <Button variant="outline" className="w-full sm:w-auto border-primary/20 hover:bg-primary hover:text-white gap-2 transition-all">
                <Package className="h-4 w-4" />
                Track My Order
              </Button>
            </Link>
          )}
          <Link to="/shop">
            <Button className="w-full sm:w-auto btn-shine gap-2">
              Continue Shopping
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="tel:+918825649680">
            <Button variant="ghost" className="w-full sm:w-auto gap-2 text-muted-foreground hover:text-foreground">
              <Phone className="h-4 w-4" />
              Contact Support
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
