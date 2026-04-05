import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { productService } from '@/services/product';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';

const RecentlyViewed = () => {
  const { getIds, clearAll } = useRecentlyViewed();
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(getIds());
  }, [getIds]);

  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: ['products-for-recently-viewed'],
    queryFn: () => productService.getProducts(),
    enabled: ids.length > 0,
  });

  const products = ids
    .map((id) => allProducts.find((p) => p.id === id))
    .filter(Boolean) as typeof allProducts;

  const handleClear = () => {
    clearAll();
    setIds([]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-lg">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Your Journey</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-normal text-primary">
              Recently Viewed
            </h1>
            <p className="text-muted-foreground mt-3 font-light">
              Pieces you've admired — revisit them before they're gone.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {ids.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mb-6">
              <Clock className="h-9 w-9 text-muted-foreground" strokeWidth={1} />
            </div>
            <h2 className="font-serif text-2xl text-primary mb-3">Nothing here yet</h2>
            <p className="text-muted-foreground mb-8 max-w-sm font-light">
              Browse our collection and this page will remember the pieces that caught your eye.
            </p>
            <Link to="/shop">
              <Button className="btn-shine gap-2">
                Explore Collection
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-10">
              <p className="text-sm text-muted-foreground">
                {products.length} piece{products.length !== 1 ? 's' : ''} viewed recently
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-muted-foreground hover:text-destructive gap-2 text-xs uppercase tracking-wider"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear History
              </Button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 place-items-center">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <p>Some products may no longer be available.</p>
              </div>
            )}

            <div className="text-center mt-16">
              <Link to="/shop">
                <Button variant="outline" className="border-primary/20 hover:bg-primary hover:text-white px-8 h-12 text-xs uppercase tracking-widest transition-all duration-500 gap-2">
                  Browse Full Collection
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RecentlyViewed;
