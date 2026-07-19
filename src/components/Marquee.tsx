import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import FastMarquee from 'react-fast-marquee';
import { TrendingUp, TrendingDown, Minus, Bell } from 'lucide-react';
import { silverRateService, type SilverRate as SilverRateType } from '@/services/silverRate';
import { goldRateService } from '@/services/goldRate';

interface PriceUpdate {
  type: 'price' | 'notification';
  text: string;
  change?: number;
}

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

const staticUpdates: PriceUpdate[] = [
  { type: 'notification', text: '🎉 Festive Sale: Up to 25% OFF on all jewelry!' },
  { type: 'notification', text: '💎 New Arrival: Exclusive Temple Jewelry Collection' },
  { type: 'notification', text: '🏆 Join our Monthly Savings Scheme - Get 1 month bonus!' },
];

const formatMoney = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const Marquee = () => {
  const location = useLocation();

  // Silver and gold live in separate collections/endpoints — both must be
  // fetched and merged, or gold silently never appears (same fix as /silver-rate).
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

  if (location.pathname.startsWith('/admin')) return null;

  const rates: SilverRateType[] = [...silverToday, ...goldToday];
  const history: SilverRateType[] = [...silverHistory, ...goldHistory];

  const getTopRate = (metal: 'silver' | 'gold22k') => rates.find((r) => getMetalKey(r.purity) === metal);
  const getChange = (metal: 'silver' | 'gold22k') => {
    const current = getTopRate(metal);
    const sorted = history
      .filter((r) => getMetalKey(r.purity) === metal)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const previous = sorted.length > 1 ? sorted[1] : null;
    if (!current || !previous) return { current, change: 0 };
    return { current, change: current.ratePerGram - previous.ratePerGram };
  };

  const metalLabels: { key: 'silver' | 'gold22k'; label: string }[] = [
    { key: 'silver', label: 'Silver' },
    { key: 'gold22k', label: 'Gold 22K' },
  ];

  const rateUpdates: PriceUpdate[] = metalLabels
    .map(({ key, label }) => {
      const { current, change } = getChange(key);
      if (!current) return null;
      return {
        type: 'price' as const,
        text: `${label}: ${formatMoney(current.ratePerKg)}/kg  |  ${formatMoney(current.ratePerGram)}/g`,
        change,
      };
    })
    .filter((u): u is PriceUpdate => !!u);

  const updates = rateUpdates.length > 0
    ? [...rateUpdates, ...staticUpdates]
    : [
        { type: 'price' as const, text: 'Silver: Live rate update soon' },
        { type: 'price' as const, text: 'Gold 22K: Live rate update soon' },
        ...staticUpdates,
      ];

  return (
    <div className="bg-primary text-primary-foreground py-2">
      <FastMarquee pauseOnHover gradient={false} speed={40} autoFill>
        {updates.map((update, index) => (
          <div key={index} className="flex items-center gap-2 text-sm mr-12">
            {update.type === 'price' ? (
              update.change === undefined || update.change === 0 ? (
                <Minus className="h-4 w-4 text-primary-foreground/70" />
              ) : update.change > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400" />
              )
            ) : (
              <Bell className="h-4 w-4 text-yellow-400" />
            )}
            <span>{update.text}</span>
          </div>
        ))}
      </FastMarquee>
    </div>
  );
};

export default Marquee;
