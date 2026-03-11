import { Navigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Heart } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { wishlistService } from '@/services/wishlist';

const Wishlist = () => {
  const { isAuthenticated } = useAuth();

  const { data: wishlistProducts = [], isLoading } = useQuery({
    queryKey: ['wishlist-items'],
    queryFn: wishlistService.getWishlistProducts,
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-7 w-7 text-accent" />
          <h1 className="font-serif text-4xl font-bold text-foreground">My Wishlist</h1>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-accent animate-spin mb-4" />
            <p className="text-muted-foreground">Loading wishlist...</p>
          </div>
        ) : wishlistProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {wishlistProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-border rounded-lg bg-card/40">
            <h2 className="font-serif text-2xl text-foreground mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">Save your favorite pieces and find them here anytime.</p>
            <Button asChild>
              <Link to="/shop">Browse Collection</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
