import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight } from 'lucide-react';
import { silverRateService, type SilverRate as SilverRateType } from '@/services/silverRate';
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

const METALS = [
  { key: 'silver' as const, label: 'Silver', swatch: 'bg-slate-300' },
  { key: 'gold22k' as const, label: 'Gold 22K', swatch: 'bg-amber-400' },
];

/**
 * Fixed, always-visible bottom-right rate card for the Home page — a static
 * (non-dismissible) glanceable summary of today's Silver / Gold 22K rate,
 * with day-over-day change direction.
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
  const { data: silverHistory = [] } = useQuery({
    queryKey: ['silver-rates-history'],
    queryFn: () => silverRateService.getRateHistory(2),
    staleTime: 5 * 60_000,
  });
  const { data: goldHistory = [] } = useQuery({
    queryKey: ['gold-rates-history'],
    queryFn: () => goldRateService.getRateHistory(2),
    staleTime: 5 * 60_000,
  });

  const today: SilverRateType[] = [...silverToday, ...goldToday];
  const history: SilverRateType[] = [...silverHistory, ...goldHistory];

  const rows = METALS.map(({ key, label, swatch }) => {
    const current = today.find((r) => getMetalKey(r.purity) === key);
    if (!current) return null;
    const sorted = history
      .filter((r) => getMetalKey(r.purity) === key)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const previous = sorted.length > 1 ? sorted[1] : null;
    const change = previous ? current.ratePerGram - previous.ratePerGram : 0;
    return { key, label, swatch, current, change };
  }).filter((r): r is NonNullable<typeof r> => !!r);

  if (rows.length === 0) return null;

  return (
    <Link
      to="/silver-rate"
      className="fixed bottom-5 right-5 z-40 hidden sm:block w-64 rounded-2xl border border-border/60 bg-card/95 backdrop-blur-sm shadow-lg overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-[box-shadow,transform] duration-300"
      aria-label="Today's silver and gold rates"
    >
      <div className="flex items-center justify-between px-4 py-2.5 bg-primary text-primary-foreground">
        <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-foreground/70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary-foreground" />
          </span>
          Today's Rate
        </span>
        <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
      </div>

      <div className="divide-y divide-border/60">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${row.swatch}`} />
              <span className="text-sm text-muted-foreground">{row.label}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-foreground">{formatPrice(row.current.ratePerGram)}/g</span>
              {row.change > 0 ? (
                <TrendingUp className="h-3.5 w-3.5 text-green-600" />
              ) : row.change < 0 ? (
                <TrendingDown className="h-3.5 w-3.5 text-destructive" />
              ) : (
                <Minus className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </div>
          </div>
        ))}
      </div>
    </Link>
  );
};

export default FloatingRateWidget;
