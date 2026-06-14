import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Gift, Star, Truck, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { giftVoucherService, type GiftVoucher } from '@/services/giftVoucher';
import Seo from '@/components/Seo';

// Rotating gradient palette so API-driven vouchers still look distinct.
const voucherColors = [
  'from-amber-400 to-yellow-300',
  'from-primary/80 to-primary/40',
  'from-rose-400 to-pink-300',
  'from-violet-500 to-purple-400',
];

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

const GiftVouchers = () => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [added, setAdded] = useState<string | null>(null);

  const { data: vouchers = [], isLoading } = useQuery({
    queryKey: ['gift-vouchers'],
    queryFn: giftVoucherService.getGiftVouchers,
  });

  const handleAddToCart = (voucher: GiftVoucher) => {
    addToCart({
      id: voucher.id,
      name: voucher.name,
      price: voucher.price,
      image: '',
      category: 'Gift Vouchers',
      weight: '—',
      purity: '—',
      description: voucher.description,
      inStock: true,
      isGiftVoucher: true,
      giftVoucherId: voucher.id,
    });
    setAdded(voucher.id);
    setTimeout(() => setAdded(null), 1800);
    toast({ title: 'Added to cart', description: `${voucher.name} added to your cart.` });
  };

  const features = [
    { icon: Gift, label: 'Instant Digital Delivery', desc: 'Receive your voucher code via email within minutes.' },
    { icon: ShieldCheck, label: 'Never Expires Early', desc: 'Valid for 12 months from the date of purchase.' },
    { icon: Truck, label: 'Physical Cards Available', desc: 'Order a beautifully printed card for in-store gifting.' },
    { icon: Star, label: 'GST Inclusive', desc: 'No hidden taxes — the price shown is the price you pay.' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <Seo
        title="Gift Vouchers"
        description="Give the gift of choice with KV Silver Zone gift vouchers — redeemable on our entire silver collection, online or in-store."
      />
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6">
            <Gift className="h-4 w-4" />
            Gift Vouchers
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            The Perfect Silver Gift
          </h1>
          <p className="text-lg opacity-80 max-w-xl mx-auto">
            Give the gift of choice. Our digital and physical gift vouchers are redeemable on our entire silver collection.
          </p>
        </div>
      </section>

      {/* Feature Strips */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <f.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{f.label}</p>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Catalogue */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-3xl font-bold text-center mb-10">Choose a Voucher</h2>
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : vouchers.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">
              Gift vouchers are currently unavailable. Please check back soon.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {vouchers.map((voucher, index) => (
                <Card key={voucher.id} className="overflow-hidden card-hover">
                  {/* Voucher Visual */}
                  <div className={`bg-gradient-to-br ${voucherColors[index % voucherColors.length]} h-36 flex items-center justify-center relative`}>
                    <Gift className="h-14 w-14 text-white/70" />
                    {voucher.tag && (
                      <Badge className="absolute top-3 right-3 bg-white text-gray-800 text-xs">
                        {voucher.tag}
                      </Badge>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="font-serif text-xl font-bold mb-1">{voucher.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{voucher.description}</p>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-primary">{formatPrice(voucher.price)}</p>
                        <p className="text-xs text-muted-foreground">GST incl.</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(voucher)}
                        disabled={added === voucher.id}
                        className="btn-shine"
                      >
                        {added === voucher.id ? 'Added!' : 'Add to Cart'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Info Box */}
      <section className="py-8 bg-muted/50">
        <div className="container mx-auto px-4 max-w-2xl text-center text-sm text-muted-foreground">
          <p>
            Gift vouchers are valid for 12 months from purchase. They can be redeemed in-store or online.
            Not redeemable for cash. Lost or stolen vouchers cannot be replaced.
          </p>
        </div>
      </section>
    </div>
  );
};

export default GiftVouchers;
