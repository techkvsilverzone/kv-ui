import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product, useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

const ProductCard = ({ product, onQuickView }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if wrapped in Link
    addToCart(product);
    toast({
      title: 'Added to Cart',
      description: `${product.name} has been added to your cart.`,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="group relative bg-background">
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary/20 mb-4 cursor-pointer">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
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
          >
            <Heart className="h-4 w-4" strokeWidth={1.5} />
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
    </div>
  );
};

export default ProductCard;
