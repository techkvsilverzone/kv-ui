import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Loader2, Gift, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/context/CartContext';

const GIFT_WRAP_FEE = 99;

const Cart = () => {
  const { items, updateQuantity, removeFromCart, totalPrice, clearCart, isCartSyncing, isItemUpdating } = useCart();
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');

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
                        <span className="font-semibold text-primary">
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

            {/* Gifting Options */}
            <Card className="p-5 border border-border/60">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                  <span className="font-serif text-sm font-medium text-primary">Gift Wrapping</span>
                </div>
                <button
                  onClick={() => setGiftWrap((v) => !v)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${giftWrap ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                  aria-checked={giftWrap}
                  role="switch"
                >
                  <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${giftWrap ? 'translate-x-4' : 'translate-x-1'}`} />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-4 ml-6">
                Premium KV Silver gift box with ribbon — ₹{GIFT_WRAP_FEE}
              </p>
              {giftWrap && (
                <div className="ml-6">
                  <div className="flex items-center gap-1.5 mb-2">
                    <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Personalized Message</span>
                  </div>
                  <Textarea
                    placeholder="Add a heartfelt message for the recipient… (optional)"
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    maxLength={200}
                    rows={3}
                    className="text-sm resize-none"
                  />
                  <p className="text-[10px] text-muted-foreground text-right mt-1">{giftMessage.length}/200</p>
                </div>
              )}
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 sticky top-24">
              <h2 className="font-serif text-xl font-semibold mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal (incl. GST)</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                {giftWrap && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Gift Wrapping</span>
                    <span>{formatPrice(GIFT_WRAP_FEE)}</span>
                  </div>
                )}
                <hr />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(totalPrice + (giftWrap ? GIFT_WRAP_FEE : 0))}</span>
                </div>
              </div>

              <Link to="/payment">
                <Button className="w-full btn-shine" size="lg" disabled={isCartSyncing || items.some((item) => isItemUpdating(item.id))}>
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>

              <p className="text-xs text-center text-muted-foreground mt-4">
                Free insured shipping · GST included in prices
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
