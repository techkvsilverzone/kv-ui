import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Product, useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { wishlistService } from '@/services/wishlist';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

const ProductCard = ({ product, onQuickView }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: wishlistProducts = [] } = useQuery({
    queryKey: ['wishlist-items'],
    queryFn: wishlistService.getWishlistProducts,
    enabled: isAuthenticated,
  });

  const wishlistIds = useMemo(() => new Set(wishlistProducts.map((item) => item.id)), [wishlistProducts]);
  const isWishlisted = wishlistIds.has(product.id);

  const { mutate: toggleWishlist, isPending: isWishlistUpdating } = useMutation({
    mutationFn: async () => {
      if (isWishlisted) {
        await wishlistService.removeItem(product.id);
        return 'removed';
      }

      await wishlistService.addItem(product.id);
      return 'added';
    },
    onSuccess: (action) => {
      void queryClient.invalidateQueries({ queryKey: ['wishlist-items'] });
      toast({
        title: action === 'added' ? 'Added to Wishlist' : 'Removed from Wishlist',
        description: `${product.name} has been ${action === 'added' ? 'added to' : 'removed from'} your wishlist.`,
      });
    },
    onError: () => {
      toast({
        title: 'Wishlist Update Failed',
        description: 'Unable to update wishlist right now. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if wrapped in Link
    addToCart(product);
    toast({
      title: 'Added to Cart',
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please login to save products to your wishlist.',
      });
      navigate('/login');
      return;
    }

    toggleWishlist();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Link to={`/product/${product.id}`} className="group relative bg-background block">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-secondary/20 mb-4 cursor-pointer">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/placeholder.svg';
          }}
        />

        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {product.isNew && (
            <span className="bg-white text-black text-[10px] uppercase tracking-widest px-2 py-1 font-medium">
              New
            </span>
          )}
          {product.isSale && (
            <span className="bg-destructive text-white text-[10px] uppercase tracking-widest px-2 py-1 font-medium">
              Sale
            </span>
          )}
        </div>

        {/* Quick Actions - Appearing on bottom */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-center gap-2 z-20">
          <Button
            size="icon"
            className="bg-white text-black hover:bg-primary hover:text-white rounded-none w-10 h-10 transition-colors shadow-sm"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" strokeWidth={1.5} />
          </Button>
          <Button
            size="icon"
            className="bg-white text-black hover:bg-primary hover:text-white rounded-none w-10 h-10 transition-colors shadow-sm"
            onClick={handleWishlist}
            disabled={isWishlistUpdating}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current text-destructive' : ''}`} strokeWidth={1.5} />
          </Button>
          {onQuickView && (
            <Button
              size="icon"
              className="bg-white text-black hover:bg-primary hover:text-white rounded-none w-10 h-10 transition-colors shadow-sm"
              onClick={(e) => {
                e.preventDefault();
                onQuickView(product);
              }}
            >
              <Eye className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="text-center space-y-1">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
          {product.category}
        </p>
        <h3 className="font-serif text-lg font-normal text-foreground group-hover:text-primary transition-colors cursor-pointer">
          {product.name}
        </h3>
        <div className="flex items-center justify-center gap-3 mt-1">
          <span className="text-sm font-medium tracking-wide">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through decoration-muted-foreground/50">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
