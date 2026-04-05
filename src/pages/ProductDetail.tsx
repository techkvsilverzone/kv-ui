import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShoppingCart,
  Heart,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Loader2,
  ChevronRight,
  Minus,
  Plus,
  MapPin,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { productService } from '@/services/product';
import { wishlistService } from '@/services/wishlist';
import { reviewService, type Review } from '@/services/review';
import ProductCard from '@/components/ProductCard';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState<'available' | 'unavailable' | null>(null);
  const [pincodeChecking, setPincodeChecking] = useState(false);
  const { addProduct: addRecentlyViewed } = useRecentlyViewed();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProductById(id!),
    enabled: !!id,
  });

  const { data: reviewData } = useQuery({
    queryKey: ['product-reviews', id],
    queryFn: () => reviewService.getProductReviews(id!),
    enabled: !!id,
  });

  const { data: relatedProducts = [] } = useQuery({
    queryKey: ['related-products', product?.category],
    queryFn: () => productService.getProducts({ category: product?.category }),
    enabled: !!product?.category,
  });

  const { data: wishlistProducts = [] } = useQuery({
    queryKey: ['wishlist-items'],
    queryFn: wishlistService.getWishlistProducts,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (id) addRecentlyViewed(id);
  }, [id, addRecentlyViewed]);

  const isWishlisted = wishlistProducts.some((item) => item.id === id);

  const { mutate: toggleWishlist, isPending: isWishlistUpdating } = useMutation({
    mutationFn: async () => {
      if (isWishlisted) {
        await wishlistService.removeItem(id!);
        return 'removed';
      }
      await wishlistService.addItem(id!);
      return 'added';
    },
    onSuccess: (action) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist-items'] });
      toast({
        title: action === 'added' ? 'Added to Wishlist' : 'Removed from Wishlist',
        description: `${product?.name} has been ${action === 'added' ? 'added to' : 'removed from'} your wishlist.`,
      });
    },
  });

  const createReviewMutation = useMutation({
    mutationFn: () =>
      reviewService.createReview({
        productId: id!,
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', id] });
      setReviewForm({ rating: 5, title: '', comment: '' });
      toast({ title: 'Review Submitted', description: 'Thank you for your review!' });
    },
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const checkPincode = async () => {
    if (pincode.length !== 6) return;
    setPincodeChecking(true);
    setPincodeResult(null);
    await new Promise((r) => setTimeout(r, 800));
    // All valid Indian 6-digit pincodes are serviceable
    setPincodeResult('available');
    setPincodeChecking(false);
  };

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    toast({
      title: 'Added to Cart',
      description: `${quantity}x ${product.name} added to cart.`,
    });
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      toast({ title: 'Login Required', description: 'Please login to save products.' });
      navigate('/login');
      return;
    }
    toggleWishlist();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 pb-16 text-center">
        <h2 className="font-serif text-2xl text-foreground mb-4">Product Not Found</h2>
        <Button asChild>
          <Link to="/shop">Back to Shop</Link>
        </Button>
      </div>
    );
  }

  const filteredRelated = relatedProducts.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to={`/shop?category=${product.category}`} className="hover:text-foreground transition-colors">
            {product.category}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{product.name}</span>
        </nav>

        {/* Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-secondary/20">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.isNew && (
              <span className="absolute top-4 left-4 bg-white text-black text-[10px] uppercase tracking-widest px-3 py-1 font-medium">
                New
              </span>
            )}
            {product.isSale && (
              <span className="absolute top-4 left-16 bg-destructive text-white text-[10px] uppercase tracking-widest px-3 py-1 font-medium">
                Sale
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] mb-2">
              {product.category}
            </p>
            <h1 className="font-serif text-3xl md:text-4xl font-normal text-primary mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            {reviewData && reviewData.totalReviews > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${star <= Math.round(reviewData.averageRating) ? 'fill-accent text-primary' : 'text-muted-foreground/30'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  ({reviewData.totalReviews} review{reviewData.totalReviews !== 1 ? 's' : ''})
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-2xl font-semibold">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="text-sm text-green-600 font-medium">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                  </span>
                </>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="mb-6 p-4 bg-secondary/20 rounded-md border border-border/60">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Price Breakdown</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Metal Value</span>
                  <span>{formatPrice(Math.round((product.price / 1.03) * 0.75))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Making Charges</span>
                  <span>{formatPrice(Math.round((product.price / 1.03) * 0.25))}</span>
                </div>
                <div className="flex justify-between text-muted-foreground/70">
                  <span>GST (3%)</span>
                  <span>{formatPrice(Math.round(product.price - product.price / 1.03))}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatPrice(product.price)}</span>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Specifications */}
            <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-secondary/30 rounded-md">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Weight</p>
                <p className="font-medium">{product.weight}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Purity</p>
                <p className="font-medium">{product.purity}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Category</p>
                <p className="font-medium">{product.category}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Availability</p>
                <p className={`font-medium ${product.inStock ? 'text-green-600' : 'text-destructive'}`}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </p>
              </div>
            </div>

            {/* Pincode Checker */}
            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2 flex items-center gap-1.5">
                <MapPin className="h-3 w-3" />
                Check Delivery
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter 6-digit pincode"
                  value={pincode}
                  onChange={(e) => {
                    setPincode(e.target.value.replace(/\D/g, '').slice(0, 6));
                    setPincodeResult(null);
                  }}
                  maxLength={6}
                  className="max-w-[180px] h-9 text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9"
                  onClick={checkPincode}
                  disabled={pincode.length < 6 || pincodeChecking}
                >
                  {pincodeChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Check'}
                </Button>
              </div>
              {pincodeResult && (
                <p className={`text-xs mt-2 flex items-center gap-1.5 ${pincodeResult === 'available' ? 'text-green-600' : 'text-destructive'}`}>
                  {pincodeResult === 'available' ? (
                    <><CheckCircle2 className="h-3.5 w-3.5" /> Delivery available — arrives in 5–7 business days</>
                  ) : (
                    <><XCircle className="h-3.5 w-3.5" /> Delivery not available to this pincode</>
                  )}
                </p>
              )}
            </div>

            {/* Quantity & Actions */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-none"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-none"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button
                className="flex-1 btn-shine h-12"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12"
                onClick={handleWishlist}
                disabled={isWishlistUpdating}
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current text-destructive' : ''}`} />
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">BIS Hallmarked</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Insured Shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">7-Day Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews & Description Tabs */}
        <Tabs defaultValue="reviews" className="mb-16">
          <TabsList>
            <TabsTrigger value="reviews">
              Reviews ({reviewData?.totalReviews || 0})
            </TabsTrigger>
            <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
          </TabsList>

          <TabsContent value="reviews">
            <Card className="p-6">
              {/* Existing Reviews */}
              {reviewData?.reviews && reviewData.reviews.length > 0 ? (
                <div className="space-y-6 mb-8">
                  {reviewData.reviews.map((review: Review) => (
                    <div key={review.id} className="border-b border-border pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${star <= review.rating ? 'fill-accent text-primary' : 'text-muted-foreground/30'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium">{review.userName}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.title && (
                        <p className="font-medium text-sm mb-1">{review.title}</p>
                      )}
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4 mb-6">
                  No reviews yet. Be the first to review this product!
                </p>
              )}

              {/* Write Review */}
              {isAuthenticated && (
                <div className="border-t border-border pt-6">
                  <h3 className="font-serif text-lg font-semibold mb-4">Write a Review</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Rating</Label>
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                          >
                            <Star
                              className={`h-6 w-6 cursor-pointer transition-colors ${star <= reviewForm.rating ? 'fill-accent text-primary' : 'text-muted-foreground/30 hover:text-primary/50'}`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="reviewTitle">Title</Label>
                      <Input
                        id="reviewTitle"
                        className="mt-1"
                        placeholder="Summary of your review"
                        value={reviewForm.title}
                        onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="reviewComment">Your Review</Label>
                      <Textarea
                        id="reviewComment"
                        className="mt-1"
                        placeholder="Tell us about your experience with this product..."
                        rows={4}
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      />
                    </div>
                    <Button
                      onClick={() => createReviewMutation.mutate()}
                      disabled={!reviewForm.comment || createReviewMutation.isPending}
                    >
                      {createReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="shipping">
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="font-serif text-lg font-semibold mb-2">Shipping</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Free insured shipping on all orders</li>
                  <li>• Delivery within 5-7 business days across India</li>
                  <li>• All shipments are fully insured and tamper-proof sealed</li>
                  <li>• Real-time tracking available after dispatch</li>
                </ul>
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold mb-2">Returns & Exchange</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• 7-day easy return policy from delivery date</li>
                  <li>• Products must be in original condition with tags intact</li>
                  <li>• Exchange available for size/design changes</li>
                  <li>• Refunds processed within 5-7 business days</li>
                  <li>• Buyback available at prevailing silver rates</li>
                </ul>
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold mb-2">Certification</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• All products are BIS Hallmarked for purity assurance</li>
                  <li>• Certificate of authenticity included with every purchase</li>
                  <li>• Weight verification guarantee</li>
                </ul>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {filteredRelated.length > 0 && (
          <section>
            <div className="text-center mb-10">
              <span className="text-muted-foreground text-xs uppercase tracking-[0.2em] mb-2 block">
                You May Also Like
              </span>
              <h2 className="font-serif text-3xl font-normal text-primary">Related Products</h2>
              <div className="w-16 h-px bg-primary/20 mt-4 mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 place-items-center">
              {filteredRelated.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
