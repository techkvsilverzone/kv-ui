import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ApiError } from '@/lib/api';
import { silverRateService } from '@/services/silverRate';
import { goldRateService } from '@/services/goldRate';
import type { Metal } from '@/lib/rateFreshness';

interface MetalMeta {
  label: string;
  purity: string;
  queryKey: string;
  update: (payload: { ratePerGram: number; purity: string }) => Promise<unknown>;
}

const METAL_META: Record<Metal, MetalMeta> = {
  silver: {
    label: 'Silver',
    purity: 'Silver',
    queryKey: 'admin-silver-rates',
    update: silverRateService.updateRate,
  },
  gold: {
    label: 'Gold (22K)',
    purity: '22K Gold',
    queryKey: 'admin-gold-rates',
    update: goldRateService.updateRate,
  },
};

/** Inline rate-update form for a single stale metal. Updating it clears the block. */
const MetalRateForm = ({ metal }: { metal: Metal }) => {
  const meta = METAL_META[metal];
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [ratePerGram, setRatePerGram] = useState('');

  const mutation = useMutation({
    mutationFn: () => meta.update({ ratePerGram: Number(ratePerGram), purity: meta.purity }),
    onSuccess: () => {
      toast({ title: `${meta.label} rate updated`, description: "Today's rate has been recorded." });
      queryClient.invalidateQueries({ queryKey: [meta.queryKey] });
      // Refresh the authoritative block flag too (client-side reconciliation also clears it).
      queryClient.invalidateQueries({ queryKey: ['admin-rate-status'] });
    },
    onError: (err) => {
      toast({
        variant: 'destructive',
        title: `Failed to update ${meta.label.toLowerCase()} rate`,
        description: err instanceof ApiError ? err.message : 'Please try again.',
      });
    },
  });

  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <h3 className="mb-3 font-medium">{meta.label}</h3>
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <Label htmlFor={`gate-rate-${metal}`}>Rate per Gram (₹)</Label>
          <Input
            id={`gate-rate-${metal}`}
            type="number"
            min={0}
            inputMode="decimal"
            className="mt-1"
            value={ratePerGram}
            onChange={(e) => setRatePerGram(e.target.value)}
          />
        </div>
        <Button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !ratePerGram || Number(ratePerGram) <= 0}
        >
          {mutation.isPending ? 'Updating…' : 'Update Rate'}
        </Button>
      </div>
    </div>
  );
};

/**
 * Full-screen block shown to admin/staff when the mandatory daily metal rate has not
 * been updated by the 10am cutoff. The panel stays locked until the stale rate(s) are
 * updated here. Customers never see this — they cannot reach the admin panel.
 */
export const RateUpdateGate = ({
  staleMetals,
  userName,
  notifyNumber,
}: {
  staleMetals: Metal[];
  userName?: string;
  notifyNumber?: string;
}) => {
  const metalNames = staleMetals.map((m) => METAL_META[m].label).join(' and ');

  return (
    <div className="min-h-screen bg-muted/30 pt-24 pb-16">
      <div className="container mx-auto max-w-xl px-4">
        <Card className="p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold">Admin Panel Locked</h1>
              <p className="text-sm text-muted-foreground">Mandatory daily rate update required</p>
            </div>
          </div>

          <p className="text-sm text-foreground">
            {userName ? `Hi ${userName}, ` : ''}today's <span className="font-medium">{metalNames}</span>{' '}
            {staleMetals.length > 1 ? 'rates have' : 'rate has'} not been updated yet. The admin panel
            is locked for all admin and staff until {staleMetals.length > 1 ? 'they are' : 'it is'}{' '}
            recorded for today.
          </p>

          {notifyNumber && (
            <p className="mt-2 text-xs text-muted-foreground">
              A reminder has been sent via WhatsApp to {notifyNumber}.
            </p>
          )}

          <div className="mt-6 space-y-4">
            {staleMetals.map((metal) => (
              <MetalRateForm key={metal} metal={metal} />
            ))}
          </div>

          <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            The panel unlocks automatically once today's {metalNames}{' '}
            {staleMetals.length > 1 ? 'rates are' : 'rate is'} saved.
          </p>
        </Card>
      </div>
    </div>
  );
};
