import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Wallet, Building, Shield, CheckCircle, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { paymentService } from '@/services/payment';
import { couponService } from '@/services/coupon';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Payment = () => {
  const navigate = useNavigate();
  const { totalPrice, clearCart, items } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [isCouponLoading, setIsCouponLoading] = useState(false);
  const [address, setAddress] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
  });

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({ ...address, [e.target.id]: e.target.value });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const subtotal = totalPrice;
  const tax = subtotal * 0.05;
  const totalWithTax = subtotal + tax - couponDiscount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsCouponLoading(true);
    try {
      const result = await couponService.applyCoupon({
        code: couponCode.trim().toUpperCase(),
        orderAmount: subtotal,
      });
      if (result.valid) {
        setCouponDiscount(result.discount);
        setAppliedCoupon(couponCode.trim().toUpperCase());
        toast({ title: 'Coupon Applied', description: result.message });
      } else {
        toast({ title: 'Invalid Coupon', description: result.message, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Coupon Error', description: 'Unable to apply coupon.', variant: 'destructive' });
    } finally {
      setIsCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponDiscount(0);
    setAppliedCoupon('');
    setCouponCode('');
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast({ title: 'Payment Error', description: 'Failed to load payment gateway.', variant: 'destructive' });
      return;
    }

    try {
      // Create order on backend
      const razorpayOrder = await paymentService.createRazorpayOrder({
        amount: Math.round(totalWithTax * 100), // amount in paise
        currency: 'INR',
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'KV Silver Zone',
        description: `Order payment - ${items.length} item(s)`,
        order_id: razorpayOrder.id,
        prefill: {
          name: `${address.firstName} ${address.lastName}`,
          email: user?.email || '',
          contact: address.phone,
        },
        theme: {
          color: '#1a1a1a',
        },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            const verifyResult = await paymentService.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderData: {
                items: items.map(item => ({
                  product: item.id,
                  name: item.name,
                  price: item.price,
                  quantity: item.quantity,
                  image: item.image,
                })),
                shippingAddress: address,
                paymentMethod: 'razorpay',
                totalAmount: totalWithTax,
                couponCode: appliedCoupon || undefined,
              },
            });

            if (verifyResult.success) {
              toast({ title: 'Payment Successful!', description: 'Your order has been placed.' });
              clearCart();
              navigate(`/order/${verifyResult.orderId}`);
            }
          } catch {
            toast({ title: 'Verification Failed', description: 'Payment verification failed. Contact support.', variant: 'destructive' });
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      toast({ title: 'Payment Failed', description: 'Could not initiate payment.', variant: 'destructive' });
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!address.firstName || !address.address || !address.phone) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required shipping details.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    if (paymentMethod === 'razorpay') {
      await handleRazorpayPayment();
    } else {
      // COD fallback
      try {
        const result = await paymentService.verifyPayment({
          razorpayOrderId: '',
          razorpayPaymentId: '',
          razorpaySignature: '',
          orderData: {
            items: items.map(item => ({
              product: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
            })),
            shippingAddress: address,
            paymentMethod: 'cod',
            totalAmount: totalWithTax,
            couponCode: appliedCoupon || undefined,
          },
        });

        toast({ title: 'Order Placed!', description: 'Your COD order has been placed successfully.' });
        clearCart();
        navigate(`/order/${result.orderId}`);
      } catch (error: any) {
        toast({ title: 'Order Failed', description: error.message || 'There was an error.', variant: 'destructive' });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="font-serif text-4xl font-bold text-foreground mb-8">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card className="p-6">
              <h2 className="font-serif text-xl font-semibold mb-4">Shipping Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" className="mt-1" placeholder="John" value={address.firstName} onChange={handleAddressChange} />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" className="mt-1" placeholder="Doe" value={address.lastName} onChange={handleAddressChange} />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" className="mt-1" placeholder="123 Main Street" value={address.address} onChange={handleAddressChange} />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" className="mt-1" placeholder="Chennai" value={address.city} onChange={handleAddressChange} />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input id="state" className="mt-1" placeholder="Tamil Nadu" value={address.state} onChange={handleAddressChange} />
                </div>
                <div>
                  <Label htmlFor="pincode">PIN Code</Label>
                  <Input id="pincode" className="mt-1" placeholder="600001" value={address.pincode} onChange={handleAddressChange} />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" className="mt-1" placeholder="+91 98765 43210" value={address.phone} onChange={handleAddressChange} />
                </div>
              </div>
            </Card>

            {/* Payment Method */}
            <Card className="p-6">
              <h2 className="font-serif text-xl font-semibold mb-4">Payment Method</h2>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="space-y-3">
                  <label className="flex items-center gap-4 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="razorpay" />
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <span className="block">Pay Online (Razorpay)</span>
                      <span className="text-xs text-muted-foreground">Card, UPI, Net Banking, Wallets</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-4 p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="cod" />
                    <Wallet className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <span className="block">Cash on Delivery</span>
                      <span className="text-xs text-muted-foreground">Pay when you receive</span>
                    </div>
                  </label>
                </div>
              </RadioGroup>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 sticky top-24">
              <h2 className="font-serif text-xl font-semibold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <hr className="mb-4" />

              {/* Coupon Code */}
              <div className="mb-4">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 p-3 rounded-md">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">{appliedCoupon}</span>
                    </div>
                    <button onClick={removeCoupon} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="text-sm"
                    />
                    <Button variant="outline" size="sm" onClick={handleApplyCoupon} disabled={isCouponLoading}>
                      Apply
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (GST 5%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Coupon Discount</span>
                    <span className="text-green-600">-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
                <hr />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-accent">{formatPrice(totalWithTax)}</span>
                </div>
              </div>

              <Button
                className="w-full btn-shine"
                size="lg"
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  'Processing...'
                ) : (
                  <>
                    Pay {formatPrice(totalWithTax)}
                    <CheckCircle className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Secure 256-bit SSL encryption</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
