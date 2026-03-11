import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCart } from '@/context/CartContext';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, totalPrice, clearCart, isCartSyncing, isItemUpdating } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
          <h1 className="font-serif text-3xl font-bold text-foreground mb-4">
            Your Cart is Empty
          </h1>
          <p className="text-muted-foreground mb-8">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link to="/shop">
            <Button size="lg" className="btn-shine">
              Start Shopping
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="font-serif text-4xl font-bold text-foreground mb-8">
          Shopping Cart
        </h1>

        {isCartSyncing && (
          <div className="mb-6 rounded-md border border-border bg-muted/40 p-3">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Syncing your cart...</span>
              <span>Please wait</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full w-1/3 rounded-full bg-accent animate-pulse" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const isUpdating = isItemUpdating(item.id) || isCartSyncing;

              return (
                <Card key={item.id} className={`p-4 transition-opacity ${isUpdating ? 'opacity-85' : ''}`}>
                  <div className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-serif font-semibold text-foreground">
                            {item.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {item.weight} • {item.purity}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.id)}
                          className="text-destructive hover:text-destructive"
                          disabled={isUpdating}
                        >
                          {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={isUpdating}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={isUpdating}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          {isUpdating && (
                            <span className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Updating...
                            </span>
                          )}
                        </div>
                        <span className="font-semibold text-accent">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}

            <Button variant="outline" onClick={clearCart} disabled={isCartSyncing || items.some((item) => isItemUpdating(item.id))}>
              {isCartSyncing ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Clearing...
                </span>
              ) : (
                'Clear Cart'
              )}
            </Button>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 sticky top-24">
              <h2 className="font-serif text-xl font-semibold mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (GST 5%)</span>
                  <span>{formatPrice(totalPrice * 0.05)}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-accent">{formatPrice(totalPrice * 1.05)}</span>
                </div>
              </div>

              <Link to="/payment">
                <Button className="w-full btn-shine" size="lg" disabled={isCartSyncing || items.some((item) => isItemUpdating(item.id))}>
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <p className="text-xs text-center text-muted-foreground mt-4">
                Free shipping on orders above ₹5,000
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
