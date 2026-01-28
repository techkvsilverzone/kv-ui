import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Truck, Award, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/hero-silver.jpg';
import savingsImage from '@/assets/savings-scheme.jpg';
import ProductCard from '@/components/ProductCard';
import { products } from '@/data/products';

const Index = () => {
  const featuredProducts = products.slice(0, 4);
  const newArrivals = products.filter(p => p.isNew).slice(0, 4);

  const features = [
    {
      icon: Shield,
      title: 'Certified Purity',
      description: '100% BIS Hallmarked silver with certified purity guarantee',
    },
    {
      icon: Truck,
      title: 'Free Shipping',
      description: 'Free insured delivery on orders above ₹5,000',
    },
    {
      icon: Award,
      title: 'Lifetime Exchange',
      description: 'Exchange your silver jewelry at full value anytime',
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Dedicated customer support for all your queries',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="KV Silver Zone Collection"
            className="w-full h-full object-cover"
          />
          <div className="hero-overlay absolute inset-0" />
        </div>
        
        <div className="relative container mx-auto px-4 z-10">
          <div className="max-w-2xl animate-fade-in-up">
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent-foreground text-sm font-medium mb-6 border border-accent/30">
              ✨ Premium Silver Collection
            </span>
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Timeless Silver<br />
              <span className="text-silver-gradient">Eternal Elegance</span>
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-lg">
              Discover our exquisite collection of handcrafted silver jewelry. Each piece tells a story of tradition, craftsmanship, and pure elegance.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop">
                <Button size="lg" className="btn-shine bg-accent hover:bg-accent/90 text-accent-foreground">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/savings-scheme">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Start Saving
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-6 bg-card rounded-xl shadow-soft"
              >
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-foreground mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-accent text-sm font-medium uppercase tracking-wider">
              Handpicked for You
            </span>
            <h2 className="font-serif text-4xl font-bold text-foreground mt-2">
              Featured Collection
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/shop">
              <Button variant="outline" size="lg">
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Savings Scheme CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6">
                💰 Monthly Savings Scheme
              </span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
                Save Smart,<br />Shine Brighter
              </h2>
              <p className="text-lg opacity-80 mb-6">
                Join our Monthly Savings Scheme and get a bonus month's silver on completing 11 months! Start with as low as ₹1,000/month.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Flexible monthly installments from ₹1,000',
                  '1 month bonus silver on 11-month completion',
                  'No making charges on scheme redemption',
                  'Lock in silver price at today\'s rate',
                ].map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                      <span className="text-accent-foreground text-xs">✓</span>
                    </div>
                    <span className="opacity-90">{benefit}</span>
                  </li>
                ))}
              </ul>
              <Link to="/savings-scheme">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground btn-shine">
                  Join Now & Save
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-elegant animate-float">
                <img
                  src={savingsImage}
                  alt="Savings Scheme"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-accent text-sm font-medium uppercase tracking-wider">
              Just Landed
            </span>
            <h2 className="font-serif text-4xl font-bold text-foreground mt-2">
              New Arrivals
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Download App CTA */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-serif text-4xl font-bold text-foreground mb-4">
              Download Our App
            </h2>
            <p className="text-muted-foreground mb-8">
              Shop on the go with our mobile app. Get exclusive offers, track your orders, and manage your savings scheme - all in one place.
            </p>
            <div className="flex justify-center gap-8 flex-wrap">
              <div className="bg-card p-4 rounded-xl shadow-soft">
                <div className="w-32 h-32 bg-primary rounded-lg flex items-center justify-center mb-2">
                  <div className="grid grid-cols-5 gap-1">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 ${
                          Math.random() > 0.3 ? 'bg-primary-foreground' : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-center text-muted-foreground">iOS App</p>
              </div>
              <div className="bg-card p-4 rounded-xl shadow-soft">
                <div className="w-32 h-32 bg-primary rounded-lg flex items-center justify-center mb-2">
                  <div className="grid grid-cols-5 gap-1">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 ${
                          Math.random() > 0.3 ? 'bg-primary-foreground' : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-center text-muted-foreground">Android App</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
