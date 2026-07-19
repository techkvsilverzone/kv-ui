import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Coins } from 'lucide-react';
import { silverRateService } from '@/services/silverRate';
import { goldRateService } from '@/services/goldRate';

const metalAliases = {
  silver: ['silver', '999', '999 fine silver', 'silver 999'],
  // '916' bare is what the API actually returns for gold purity — the aliased
  // forms below are kept for any legacy/manually-entered records.
  gold22k: ['gold22k', 'gold 22k', '22k', 'gold-22k', '916 gold', '916'],
};

const getMetalKey = (purity: string): 'silver' | 'gold22k' | null => {
  const normalized = purity.trim().toLowerCase();
  if (metalAliases.silver.includes(normalized)) return 'silver';
  if (metalAliases.gold22k.includes(normalized)) return 'gold22k';
  return null;
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

/**
 * Fixed, always-visible bottom-right rate card for the Home page — a static
 * (non-dismissible) glanceable summary of today's Silver / Gold 22K rate.
 */
const FloatingRateWidget = () => {
  const { data: silverToday = [] } = useQuery({
    queryKey: ['silver-rates-today'],
    queryFn: silverRateService.getTodayRate,
    staleTime: 5 * 60_000,
  });
  const { data: goldToday = [] } = useQuery({
    queryKey: ['gold-rates-today'],
    queryFn: goldRateService.getTodayRate,
    staleTime: 5 * 60_000,
  });

  const silver = silverToday.find((r) => getMetalKey(r.purity) === 'silver');
  const gold = goldToday.find((r) => getMetalKey(r.purity) === 'gold22k');

  if (!silver && !gold) return null;

  return (
    <Link
      to="/silver-rate"
      className="fixed bottom-5 right-5 z-40 bg-card border border-border rounded-xl shadow-lg px-4 py-3 hidden sm:flex flex-col gap-1.5 hover:shadow-xl transition-shadow"
      aria-label="Today's silver and gold rates"
    >
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Coins className="h-3.5 w-3.5 text-primary" />
        Today's Rate
      </div>
      {silver && (
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-muted-foreground">Silver</span>
          <span className="font-semibold text-primary">{formatPrice(silver.ratePerGram)}/g</span>
        </div>
      )}
      {gold && (
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-muted-foreground">Gold 22K</span>
          <span className="font-semibold text-primary">{formatPrice(gold.ratePerGram)}/g</span>
        </div>
      )}
    </Link>
  );
};

export default FloatingRateWidget;
