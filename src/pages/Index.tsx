import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Award, Headphones, ChevronDown, Loader2, RotateCcw, Coins, Gift, Flame } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-silver.jpg';
import savingsImage from '@/assets/savings-scheme.jpg';
import ProductCard from '@/components/ProductCard';
import FloatingRateWidget from '@/components/FloatingRateWidget';
import Seo from '@/components/Seo';
import { productService } from '@/services/product';
import { useReveal } from '@/hooks/useReveal';

const Index = () => {
  const { data: featuredProducts = [], isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: productService.getFeatured,
  });

  const occasionsReveal = useReveal<HTMLDivElement>();
  const featuredReveal = useReveal<HTMLDivElement>();
  const savingsReveal = useReveal<HTMLDivElement>();
  const arrivalsReveal = useReveal<HTMLDivElement>();

  const trustBar = [
    { icon: Award, title: '100% BIS Hallmarked', description: 'Certified Silver' },
    { icon: Shield, title: 'Insured Shipping', description: 'Every parcel fully covered' },
    { icon: RotateCcw, title: 'Fault-Protected Returns', description: 'Video-verified, 48-hr window' },
    { icon: Headphones, title: 'Concierge Support', description: 'Dedicated relationship managers' },
  ];

  const occasions = [
    { label: 'Coins and Bars', query: 'Silver coin + Box', icon: Coins },
    { label: 'Gifting', query: 'Silver plated', icon: Gift },
    { label: 'Puja & Ritual', query: 'Wood + Silver', icon: Flame },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Premium Silver Jewellery & Coins"
        description="Shop BIS-hallmarked silver jewellery, coins and gifts at KV Silver Zone. Live silver rates, monthly savings schemes and insured delivery across India."
        image={heroImage.startsWith('http') ? heroImage : undefined}
      />
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70 z-10" />
          <img
            src={heroImage}
            alt="KV Silver Zone Collection"
            className="w-full h-full object-cover scale-105 animate-float"
            style={{ animationDuration: '20s' }}
          />
        </div>

        <div className="relative container mx-auto px-4 z-20 text-center text-white">
          <div className="max-w-4xl mx-auto animate-fade-in-up">
            <h2 className="text-sm md:text-base tracking-[0.32em] uppercase mb-6 text-white/85 font-light">
              KV Silver Zone Exclusive
            </h2>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium mb-8 leading-[1.05] tracking-tight text-white">
              Timeless Silver,<br />
              <span className="italic font-serif">Eternal Elegance</span>
            </h1>
            <p className="text-lg md:text-xl text-white/85 mb-10 max-w-xl mx-auto font-light leading-relaxed">
              Discover our exquisite collection of handcrafted silver jewellery. Designed to define luxury and celebrate tradition.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/shop">
                <Button size="lg" className="btn-shine bg-white text-black hover:bg-white/90 min-w-[200px] h-12 text-sm uppercase tracking-wider group">
                  Explore Collection
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
                </Button>
              </Link>
              <Link to="/savings-scheme">
                <Button size="lg" variant="outline" className="border-white/70 text-white bg-white/5 hover:bg-white hover:text-black min-w-[200px] h-12 text-sm uppercase tracking-wider backdrop-blur-sm transition-colors">
                  Savings Scheme
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
          <ChevronDown className="h-8 w-8 text-white" strokeWidth={1} />
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border">
            {trustBar.map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-8 hover:bg-secondary/40 transition-colors cursor-default group"
              >
                <item.icon className="h-7 w-7 text-muted-foreground mb-3 group-hover:text-primary transition-colors" strokeWidth={1.25} />
                <h3 className="font-serif text-sm font-medium text-primary mb-1">{item.title}</h3>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider opacity-80">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Occasion */}
      <section className="section-padding border-b border-border bg-secondary/30">
        <div ref={occasionsReveal} className="reveal container mx-auto px-4">
          <div className="flex flex-col items-center text-center mb-12">
            <span className="eyebrow mb-4">Browse by Lifestyle</span>
            <h2 className="font-serif text-4xl md:text-5xl font-normal text-primary">Shop by Occasion</h2>
            <div className="rule-metallic w-24 mt-8" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {occasions.map(({ label, query, icon: Icon }) => (
              <Link
                key={label}
                to={`/shop?category=${encodeURIComponent(query)}`}
                className="group flex flex-col items-center gap-4 p-10 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-elegant transition-all duration-500 card-lift"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/60 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-500">
                  <Icon className="h-7 w-7" strokeWidth={1.25} />
                </span>
                <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground group-hover:text-primary transition-colors font-medium text-center">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-padding">
        <div ref={featuredReveal} className="reveal container mx-auto px-4">
          <div className="flex flex-col items-center text-center mb-16">
            <span className="eyebrow mb-4">Curated Excellence</span>
            <h2 className="font-serif text-4xl md:text-5xl font-normal text-primary">Featured Collection</h2>
            <div className="rule-metallic w-24 mt-8" />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-16">
            <Link to="/shop">
              <Button variant="outline" size="lg" className="border-primary/30 hover:bg-primary hover:text-primary-foreground px-8 h-12 text-xs uppercase tracking-widest transition-all duration-500 group">
                View All Masterpieces
                <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Savings Scheme - Horizontal Split */}
      <section className="bg-secondary/40">
        <div ref={savingsReveal} className="reveal grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
          <div className="order-2 lg:order-1 flex items-center justify-center p-12 lg:p-24">
            <div className="max-w-lg">
              <span className="inline-block px-3 py-1 border border-primary/25 rounded-full text-[10px] uppercase tracking-wider mb-8 text-primary/80">
                Investment Plan
              </span>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal mb-8 leading-tight text-primary">
                Smart Savings,<br />Silver Future
              </h2>
              <p className="text-muted-foreground text-lg mb-8 font-light leading-relaxed">
                Secure your future with our flexible monthly savings scheme. Enjoy bonus months and exclusive benefits on maturity.
              </p>

              <ul className="space-y-4 mb-10">
                {[
                  'Bonus installment on completion',
                  'Zero making charges on redemption',
                  'Locked-in silver rates',
                ].map((benefit, index) => (
                  <li key={index} className="flex items-center gap-4 text-primary/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                    <span className="text-sm uppercase tracking-wide">{benefit}</span>
                  </li>
                ))}
              </ul>

              <Link to="/savings-scheme">
                <Button size="lg" className="btn-shine bg-primary text-primary-foreground hover:bg-primary/90 min-w-[180px] h-12 text-xs uppercase tracking-widest">
                  Start Investing
                </Button>
              </Link>
            </div>
          </div>
          <div className="order-1 lg:order-2 relative h-[400px] lg:h-auto overflow-hidden group">
            <img
              src={savingsImage}
              alt="Savings Scheme"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="section-padding">
        <div ref={arrivalsReveal} className="reveal container mx-auto px-4">
          <div className="flex flex-col items-center text-center mb-16">
            <span className="eyebrow mb-4">Fresh from Atelier</span>
            <h2 className="font-serif text-4xl md:text-5xl font-normal text-primary">New Arrivals</h2>
            <div className="rule-metallic w-24 mt-8" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {isLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="w-full aspect-square bg-muted animate-pulse rounded-xl" />
              ))
            ) : (
              featuredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* App Download - Minimalist */}
      <section className="py-24 bg-card text-primary relative overflow-hidden border-t border-border">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-normal mb-6 text-primary">
            Experience Luxury on the Go
          </h2>
          <p className="text-muted-foreground mb-10 max-w-lg mx-auto font-light">
            Download our app to browse exclusive collections, track orders, and manage your investment portfolio.
          </p>
          <div className="flex justify-center gap-6">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground h-14 px-8 gap-3 transition-colors">
              <span className="text-xs uppercase tracking-wider">App Store</span>
            </Button>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground h-14 px-8 gap-3 transition-colors">
              <span className="text-xs uppercase tracking-wider">Play Store</span>
            </Button>
          </div>
        </div>
      </section>

      <FloatingRateWidget />
    </div>
  );
};

export default Index;
