import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Loader2, Minus, Plus, Search, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PrintInvoiceButton from '@/components/admin/PrintInvoiceButton';
import { useToast } from '@/hooks/use-toast';
import { ApiError } from '@/lib/api';
import { adminService, type OfflineSalePayload } from '@/services/admin';
import type { Order } from '@/services/order';
import type { Product, ProductVariant } from '@/context/CartContext';

const LOCATION_KEY = 'kv-sale-location';
const PAYMENT_METHODS: { value: OfflineSalePayload['paymentMethod']; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card' },
];

const formatPrice = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);

const readStoredLocation = () => {
  try {
    return localStorage.getItem(LOCATION_KEY) ?? '';
  } catch {
    return '';
  }
};

interface BillLine {
  key: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}

/** In-store / stall billing for admin and staff: priced and stock-checked by the server, invoiced like an online order. */
export default function OfflineSalePanel({ products }: { products: Product[] }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [variantChoice, setVariantChoice] = useState<Record<string, string>>({});
  const [lines, setLines] = useState<BillLine[]>([]);
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
  const [saleLocation, setSaleLocation] = useState(readStoredLocation);
  const [paymentMethod, setPaymentMethod] = useState<OfflineSalePayload['paymentMethod']>('cash');
  const [couponDraft, setCouponDraft] = useState('');
  const [coupon, setCoupon] = useState('');
  const [completed, setCompleted] = useState<Order | null>(null);

  const sellable = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products
      .filter((p) => !p.isGiftVoucher)
      .filter((p) => !q || [p.name, p.category, p.subcategory, p.material].some((v) => v?.toLowerCase().includes(q)))
      .slice(0, 30);
  }, [products, search]);

  const items = lines.map((l) => ({
    product: l.product.id,
    quantity: l.quantity,
    ...(l.variant && { variantWeight: l.variant.weight }),
  }));

  const quote = useQuery({
    queryKey: ['offline-sale-quote', items, coupon],
    queryFn: () => adminService.quoteOfflineSale({ items, ...(coupon && { couponCode: coupon }) }),
    enabled: items.length > 0,
    retry: false,
    placeholderData: (previous) => previous,
  });

  const phoneDigits = customer.phone.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
  const phoneInvalid = customer.phone.trim() !== '' && !/^[6-9]\d{9}$/.test(phoneDigits);

  const sale = useMutation({
    mutationFn: () =>
      adminService.createOfflineSale({
        items,
        paymentMethod,
        ...(coupon && { couponCode: coupon }),
        ...(saleLocation.trim() && { saleLocation: saleLocation.trim() }),
        customer: { name: customer.name.trim(), phone: phoneDigits, address: customer.address.trim() },
      }),
    onSuccess: (order) => {
      setCompleted(order);
      try {
        localStorage.setItem(LOCATION_KEY, saleLocation.trim());
      } catch {
        /* remembering the location is a convenience only */
      }
      void queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({ title: 'Sale recorded', description: `Invoice ${order.invoiceNumber} · ${formatPrice(order.totalAmount)}` });
    },
    onError: (error) =>
      toast({
        title: 'Could not record the sale',
        description: error instanceof ApiError ? error.message : 'Please try again.',
        variant: 'destructive',
      }),
  });

  const addProduct = (product: Product) => {
    const variant = product.variants?.find((v) => v.label === variantChoice[product.id]) ?? product.variants?.[0];
    const key = `${product.id}|${variant?.label ?? ''}`;
    setLines((current) =>
      current.some((l) => l.key === key)
        ? current.map((l) => (l.key === key ? { ...l, quantity: l.quantity + 1 } : l))
        : [...current, { key, product, variant, quantity: 1 }],
    );
  };

  const changeQuantity = (key: string, delta: number) =>
    setLines((current) =>
      current.map((l) => (l.key === key ? { ...l, quantity: l.quantity + delta } : l)).filter((l) => l.quantity > 0),
    );

  const startNewSale = () => {
    setLines([]);
    setCustomer({ name: '', phone: '', address: '' });
    setCoupon('');
    setCouponDraft('');
    setPaymentMethod('cash');
    setCompleted(null);
  };

  if (completed) {
    return (
      <Card className="mx-auto max-w-md p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
        <h2 className="mt-3 font-serif text-xl font-semibold">Sale recorded</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Invoice <span className="font-medium text-foreground">{completed.invoiceNumber}</span> ·{' '}
          {formatPrice(completed.totalAmount)} · {PAYMENT_METHODS.find((m) => m.value === completed.paymentMethod)?.label}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Stock has been reduced and the sale is listed under Orders.</p>
        <div className="mt-6 flex justify-center gap-3">
          <PrintInvoiceButton order={completed} size="default" />
          <Button onClick={startNewSale}>New sale</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_420px]">
      {/* Products */}
      <Card className="p-4 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <h2 className="font-serif text-xl font-semibold">In-store Sale</h2>
        </div>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search products by name or category"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search products"
          />
        </div>
        {sellable.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No products match "{search}".</p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {sellable.map((p) => {
              const outOfStock = !p.inStock || p.stockAvailable === 0;
              return (
                <li key={p.id} className="flex gap-3 rounded-lg border p-3">
                  {p.image && <img src={p.image} alt="" className="h-16 w-16 shrink-0 rounded-md object-cover" />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium" title={p.name}>{p.name}</p>
                    <p className="text-sm font-semibold">{formatPrice(p.price)}</p>
                    <p className={`text-xs ${outOfStock ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {outOfStock ? 'Out of stock' : p.stockAvailable !== undefined ? `${p.stockAvailable} in stock` : p.category}
                    </p>
                    <div className="mt-2 flex gap-2">
                      {!!p.variants?.length && (
                        <Select
                          value={variantChoice[p.id] ?? p.variants[0].label}
                          onValueChange={(v) => setVariantChoice((c) => ({ ...c, [p.id]: v }))}
                        >
                          <SelectTrigger className="h-8 text-xs" aria-label={`Variant for ${p.name}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {p.variants.map((v) => (
                              <SelectItem key={v.label} value={v.label}>
                                {v.label} · {v.weight}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <Button size="sm" className="h-8 shrink-0" disabled={outOfStock} onClick={() => addProduct(p)}>
                        <Plus className="mr-1 h-3.5 w-3.5" />
                        Add
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* Bill */}
      <Card className="h-fit p-4 sm:p-6 lg:sticky lg:top-24">
        <h3 className="mb-3 flex items-center gap-2 font-semibold">
          <ShoppingBag className="h-4 w-4" /> Bill
        </h3>
        {lines.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Add products from the list to start a bill.
          </p>
        ) : (
          <ul className="divide-y">
            {lines.map((l) => {
              const priced = quote.data?.items.find(
                (i) => i.product === l.product.id && (!l.variant || i.weight === parseFloat(l.variant.weight)),
              );
              return (
                <li key={l.key} className="flex items-center gap-2 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{l.product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {l.variant ? `${l.variant.label} · ` : ''}
                      {priced ? `${formatPrice(priced.unitPrice)} each` : '…'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-7 w-7" aria-label="Decrease quantity" onClick={() => changeQuantity(l.key, -1)}>
                      {l.quantity === 1 ? <Trash2 className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                    </Button>
                    <span className="w-6 text-center text-sm">{l.quantity}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7" aria-label="Increase quantity" onClick={() => changeQuantity(l.key, 1)}>
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-4 space-y-3 border-t pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Customer (optional)</p>
          <Input placeholder="Name" value={customer.name} onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))} aria-label="Customer name" />
          <div>
            <Input
              placeholder="Mobile number"
              inputMode="tel"
              value={customer.phone}
              onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))}
              aria-label="Customer mobile"
              aria-invalid={phoneInvalid}
            />
            {phoneInvalid ? (
              <p className="mt-1 text-xs text-destructive">Enter a 10-digit mobile number.</p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">If it matches a customer account, the sale shows in their orders.</p>
            )}
          </div>
          <Input placeholder="Address" value={customer.address} onChange={(e) => setCustomer((c) => ({ ...c, address: e.target.value }))} aria-label="Customer address" />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 border-t pt-4">
          <div>
            <Label htmlFor="sale-location">Sale location</Label>
            <Input
              id="sale-location"
              className="mt-1"
              placeholder="e.g. Showroom, Anna Nagar stall"
              value={saleLocation}
              onChange={(e) => setSaleLocation(e.target.value)}
            />
          </div>
          <div>
            <Label>Payment</Label>
            <div className="mt-1 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Payment method">
              {PAYMENT_METHODS.map((m) => (
                <Button
                  key={m.value}
                  type="button"
                  role="radio"
                  aria-checked={paymentMethod === m.value}
                  variant={paymentMethod === m.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPaymentMethod(m.value)}
                >
                  {m.label}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="sale-coupon">Coupon</Label>
            <div className="mt-1 flex gap-2">
              <Input
                id="sale-coupon"
                placeholder="Code"
                value={couponDraft}
                onChange={(e) => setCouponDraft(e.target.value.toUpperCase())}
              />
              {coupon ? (
                <Button variant="outline" size="sm" className="h-10" onClick={() => { setCoupon(''); setCouponDraft(''); }}>
                  Remove
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="h-10" disabled={!couponDraft.trim()} onClick={() => setCoupon(couponDraft.trim())}>
                  Apply
                </Button>
              )}
            </div>
          </div>
        </div>

        {lines.length > 0 && (
          <div className="mt-4 space-y-1.5 border-t pt-4 text-sm" aria-live="polite">
            {quote.isError ? (
              <p className="text-destructive">
                {quote.error instanceof ApiError ? quote.error.message : 'Could not price this bill.'}
              </p>
            ) : !quote.data ? (
              <p className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Pricing…</p>
            ) : (
              <>
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(quote.data.subtotal)}</span></div>
                {quote.data.discount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Discount ({quote.data.couponCode})</span><span>−{formatPrice(quote.data.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between"><span className="text-muted-foreground">GST ({quote.data.gstPercent}%)</span><span>{formatPrice(quote.data.taxAmount)}</span></div>
                <div className="flex justify-between border-t pt-2 text-base font-semibold"><span>Total</span><span>{formatPrice(quote.data.grandTotal)}</span></div>
              </>
            )}
          </div>
        )}

        <Button
          className="mt-4 w-full"
          size="lg"
          disabled={lines.length === 0 || !quote.data || quote.isError || quote.isFetching || phoneInvalid || sale.isPending}
          onClick={() => sale.mutate()}
        >
          {sale.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : `Complete sale${quote.data ? ` · ${formatPrice(quote.data.grandTotal)}` : ''}`}
        </Button>
      </Card>
    </div>
  );
}
