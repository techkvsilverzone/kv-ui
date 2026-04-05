import { forwardRef } from 'react';
import type { Order } from '@/services/order';

interface InvoiceViewProps {
  order: Order;
  customerName?: string;
  customerEmail?: string;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

/**
 * Read-only invoice layout. Pass a `ref` when using react-to-print.
 * Styled for clean browser printing via @media print rules.
 */
const InvoiceView = forwardRef<HTMLDivElement, InvoiceViewProps>(
  ({ order, customerName, customerEmail }, ref) => {
    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = order.tax ?? subtotal * 0.03;
    const orderId = (order.id ?? order._id ?? '').slice(-10).toUpperCase();

    return (
      <div
        ref={ref}
        className="bg-white text-gray-900 p-8 max-w-2xl mx-auto print:p-6 print:shadow-none"
        style={{ fontFamily: 'sans-serif' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-8 pb-4 border-b-2 border-gray-800">
          <div>
            <h1 className="text-2xl font-bold">KV Silver Zone</h1>
            <p className="text-xs text-gray-500 mt-0.5">Tax Invoice</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold text-base">Invoice #{orderId}</p>
            <p className="text-gray-500">Date: {formatDate(order.createdAt)}</p>
          </div>
        </div>

        {/* Bill To */}
        <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Bill To</p>
            <p className="font-semibold">{customerName ?? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`}</p>
            {customerEmail && <p className="text-gray-600">{customerEmail}</p>}
            <p className="text-gray-600">{order.shippingAddress.phone}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Ship To</p>
            <p className="text-gray-700 leading-relaxed">
              {order.shippingAddress.address},<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}
            </p>
          </div>
        </div>

        {/* Line Items */}
        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="bg-gray-100 text-left text-xs text-gray-500 uppercase">
              <th className="py-2 px-3">#</th>
              <th className="py-2 px-3">Item</th>
              <th className="py-2 px-3 text-center">Qty</th>
              <th className="py-2 px-3 text-right">Unit Price</th>
              <th className="py-2 px-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-2 px-3 text-gray-400">{i + 1}</td>
                <td className="py-2 px-3">{item.name}</td>
                <td className="py-2 px-3 text-center">{item.quantity}</td>
                <td className="py-2 px-3 text-right">{formatPrice(item.price)}</td>
                <td className="py-2 px-3 text-right font-medium">{formatPrice(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-56 text-sm space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">GST (3%)</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-gray-300 pt-2 mt-2">
              <span>Total</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="text-sm text-gray-600 mb-6">
          <span className="font-medium">Payment Method: </span>{order.paymentMethod}
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-400 text-center border-t border-gray-200 pt-4 print:pt-3">
          Thank you for shopping with KV Silver Zone. This is a computer-generated invoice. No signature required.
        </p>
      </div>
    );
  },
);

InvoiceView.displayName = 'InvoiceView';

export default InvoiceView;
