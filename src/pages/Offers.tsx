import { Link } from 'react-router-dom';
import { Tag, ArrowRight, Clock, Sparkles, Gift, Percent } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { productService } from '@/services/product';

interface Campaign {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  bgClass: string;
  accentClass: string;
  icon: typeof Tag;
  link: string;
  linkLabel: string;
}

const campaigns: Campaign[] = [
  {
    id: 'akshaya',
    title: 'Akshaya Tritiya Specials',
    subtitle: 'Celebrate the auspicious day with our curated silver gifting collection. Zero making charges for a limited time.',
    badge: 'Limited Time',
    bgClass: 'bg-gradient-to-br from-amber-50 to-orange-50',
    accentClass: 'text-amber-700 border-amber-200 bg-amber-100',
    icon: Sparkles,
    link: '/shop?category=Puja Items',
    linkLabel: 'Shop Auspicious Collection',
  },
  {
    id: 'gifting',
    title: 'Silver Gifting Season',
    subtitle: 'Thoughtfully curated gift sets — from earrings to coin sets — elegantly packed in signature KV Silver boxes.',
    badge: 'Gift Ready',
    bgClass: 'bg-gradient-to-br from-rose-50 to-pink-50',
    accentClass: 'text-rose-700 border-rose-200 bg-rose-100',
    icon: Gift,
    link: '/shop',
    linkLabel: 'Explore Gift Sets',
  },
  {
    id: 'savings',
    title: 'Savings Scheme Bonus',
    subtitle: 'Enroll in our monthly silver savings plan and earn a bonus installment on maturity. Lock in today\'s rates.',
    badge: 'Investment',
    bgClass: 'bg-gradient-to-br from-teal-50 to-cyan-50',
    accentClass: 'text-teal-700 border-teal-200 bg-teal-100',
    icon: Percent,
    link: '/savings-scheme',
    linkLabel: 'Start Saving Today',
  },
];

const Offers = () => {
  const { data: saleProducts = [], isLoading } = useQuery({
    queryKey: ['sale-products'],
    queryFn: () => productService.getProducts({ sortBy: 'newest' }),
  });

  const discountedProducts = saleProducts.filter((p) => p.isSale || p.originalPrice).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative border-b border-border overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/8 via-transparent to-transparent" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-primary/20 rounded-full text-[10px] uppercase tracking-[0.2em] text-primary/70 mb-6">
              <Tag className="h-3 w-3" />
              Exclusive Offers
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-normal text-primary leading-tight mb-4">
              Deals &<br />
              <span className="italic">Campaigns</span>
            </h1>
            <p className="text-muted-foreground text-lg font-light leading-relaxed">
              Curated promotions on our finest silver collections. Limited periods, timeless pieces.
            </p>
          </div>
        </div>
      </div>

      {/* Campaign Cards */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="font-serif text-2xl text-primary mb-10">Active Campaigns</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className={`rounded-xl border border-border p-8 flex flex-col gap-6 hover:shadow-md transition-shadow ${campaign.bgClass}`}
            >
              <div className="flex items-start justify-between">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider border font-medium ${campaign.accentClass}`}>
                  <campaign.icon className="h-3 w-3" />
                  {campaign.badge}
                </div>
              </div>
              <div>
                <h3 className="font-serif text-xl font-medium text-primary mb-3">{campaign.title}</h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">{campaign.subtitle}</p>
              </div>
              <Link to={campaign.link} className="mt-auto">
                <Button variant="outline" size="sm" className="w-full border-primary/20 hover:bg-primary hover:text-white transition-all gap-2 text-xs uppercase tracking-wider">
                  {campaign.linkLabel}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Sale Products */}
      {(isLoading || discountedProducts.length > 0) && (
        <section className="container mx-auto px-4 pb-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-2">On Sale Now</span>
              <h2 className="font-serif text-3xl font-normal text-primary">Discounted Pieces</h2>
            </div>
            <Link to="/shop">
              <Button variant="ghost" className="text-xs uppercase tracking-wider gap-2 text-muted-foreground hover:text-primary">
                View All
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 place-items-center">
              {discountedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Trust Strip */}
      <section className="border-t border-border bg-secondary/30">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Clock, label: 'Limited Period', desc: 'All offers are time-sensitive' },
              { icon: Tag, label: 'Genuine Discounts', desc: 'No hidden markups, real savings' },
              { icon: Sparkles, label: 'BIS Hallmarked', desc: 'Purity guaranteed on all pieces' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <Icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                <p className="font-serif text-sm font-medium text-primary">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Offers;
