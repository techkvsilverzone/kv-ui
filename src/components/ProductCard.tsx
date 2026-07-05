import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Product, useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { wishlistService } from '@/services/wishlist';
import { silverRateService } from '@/services/silverRate';
import { computeProductPricing } from '@/lib/pricing';
import ProductImageCarousel from '@/components/ProductImageCarousel';

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

  // Today's silver rate drives the live pre-GST price (rate/g × weight + making + wastage).
  // Shared cache key — every card reuses the one fetch.
  const { data: silverRates = [] } = useQuery({
    queryKey: ['silver-rate-today'],
    queryFn: silverRateService.getTodayRate,
    staleTime: 5 * 60_000,
  });

  // Pre-GST price shown on the card. Falls back to product.price for fixed-price products
  // or when no rate/weight is available. GST + delivery are added at checkout.
  const pricing = useMemo(() => computeProductPricing(product, silverRates), [product, silverRates]);

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
    if (!product.inStock) {
      toast({
        title: 'Out of Stock',
        description: `${product.name} is currently unavailable.`,
        variant: 'destructive',
      });
      return;
    }
    addToCart({ ...product, price: pricing.preGstPrice });
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

  // Images for the sliding gallery: prefer the full images array, fall back to the single image.
  const cardImages = useMemo(() => {
    const imgs = (product.images ?? []).filter(Boolean);
    return imgs.length ? imgs : [product.image].filter(Boolean);
  }, [product.images, product.image]);

  // Collections card lists the available variant weights (e.g. "20g / 30g / 40g").
  const availableWeights = useMemo(() => {
    const weights = (product.variants ?? [])
      .map((v) => v.weight?.trim())
      .filter((w): w is string => !!w);
    return weights.length ? weights.join(' / ') : null;
  }, [product.variants]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Link to={`/product/${product.id}`} className="group relative block w-full card-lift">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-secondary/30 mb-4 cursor-pointer ring-1 ring-border/60 group-hover:ring-primary/30 transition-[box-shadow,--tw-ring-color] duration-500">
        <ProductImageCarousel
          images={cardImages}
          alt={product.name}
          imageClassName="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-[1.06]"
        />

        {/* Overlay on Hover — soft graphite wash rising from the base */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {product.isNew && (
            <span className="bg-primary text-primary-foreground text-[10px] uppercase tracking-widest px-2.5 py-1 font-medium rounded-full shadow-sm">
              New
            </span>
          )}
          {product.isSale && (
            <span className="bg-destructive text-destructive-foreground text-[10px] uppercase tracking-widest px-2.5 py-1 font-medium rounded-full shadow-sm">
              Sale
            </span>
          )}
          {!product.inStock && (
            <span className="bg-background/90 backdrop-blur-sm text-muted-foreground text-[10px] uppercase tracking-widest px-2.5 py-1 font-medium rounded-full">
              Out of Stock
            </span>
          )}
        </div>

        {/* Quick Actions - Appearing on bottom */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-center gap-2 z-20">
          <Button
            size="icon"
            className="bg-background/90 backdrop-blur-md text-foreground hover:bg-primary hover:text-primary-foreground rounded-full w-10 h-10 transition-colors shadow-elegant"
            onClick={handleAddToCart}
            disabled={!product.inStock}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="h-4 w-4" strokeWidth={1.5} />
          </Button>
          <Button
            size="icon"
            className="bg-background/90 backdrop-blur-md text-foreground hover:bg-primary hover:text-primary-foreground rounded-full w-10 h-10 transition-colors shadow-elegant"
            onClick={handleWishlist}
            disabled={isWishlistUpdating}
            aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            aria-pressed={isWishlisted}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current text-destructive' : ''}`} strokeWidth={1.5} />
          </Button>
          {onQuickView && (
            <Button
              size="icon"
              className="bg-background/90 backdrop-blur-md text-foreground hover:bg-primary hover:text-primary-foreground rounded-full w-10 h-10 transition-colors shadow-elegant"
              onClick={(e) => {
                e.preventDefault();
                onQuickView(product);
              }}
              aria-label={`Quick view ${product.name}`}
            >
              <Eye className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="text-center space-y-1 px-1">
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.18em]">
          {product.category}
        </p>
        <h3 className="font-serif text-lg font-medium text-foreground group-hover:text-primary transition-colors cursor-pointer">
          {product.name}
        </h3>
        <div className="flex items-center justify-center gap-3 mt-1">
          <span className="text-[15px] font-semibold tracking-wide text-foreground">
            {formatPrice(pricing.preGstPrice)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through decoration-muted-foreground/50">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
        {availableWeights && (
          <p className="text-[11px] text-muted-foreground tracking-wide pt-0.5">
            {availableWeights}
          </p>
        )}
      </div>
    </Link>
  );
};

// Memoized so the Shop grid doesn't re-render every card when an unrelated parent state changes.
export default memo(ProductCard);
