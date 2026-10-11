import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';
import InvoiceView from '@/components/InvoiceView';
import type { Order } from '@/services/order';

/** Prints an order's tax invoice (rendered off-screen) — online orders and in-store sales alike. */
export default function PrintInvoiceButton({
  order,
  label = 'Print invoice',
  ...buttonProps
}: { order: Order; label?: string } & ButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const print = useReactToPrint({ contentRef: ref, documentTitle: `KV-Silver-Zone-${order.invoiceNumber ?? order.id}` });

  return (
    <>
      <Button variant="outline" size="sm" className="gap-1.5" {...buttonProps} onClick={() => print()}>
        <Printer className="h-3.5 w-3.5" />
        {label}
      </Button>
      <div className="hidden">
        <InvoiceView ref={ref} order={order} />
      </div>
    </>
  );
}
