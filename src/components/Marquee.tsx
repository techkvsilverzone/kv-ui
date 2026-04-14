import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { TrendingUp, Bell } from 'lucide-react';
import { silverRateService } from '@/services/silverRate';

interface PriceUpdate {
  type: 'price' | 'notification';
  text: string;
  icon?: 'up' | 'bell';
}

const metalAliases = {
  silver: ['silver', '999', '999 fine silver', 'silver 999'],
  gold22k: ['gold22k', 'gold 22k', '22k', 'gold-22k', '916 gold'],
};

const getMetalKey = (purity: string): 'silver' | 'gold22k' | null => {
  const normalized = purity.trim().toLowerCase();
  if (metalAliases.silver.includes(normalized)) return 'silver';
  if (metalAliases.gold22k.includes(normalized)) return 'gold22k';
  return null;
};

const staticUpdates: PriceUpdate[] = [
  { type: 'notification', text: '🎉 Festive Sale: Up to 25% OFF on all jewelry!', icon: 'bell' },
  { type: 'notification', text: '💎 New Arrival: Exclusive Temple Jewelry Collection', icon: 'bell' },
  { type: 'notification', text: '🏆 Join our Monthly Savings Scheme - Get 1 month bonus!', icon: 'bell' },
];

const Marquee = () => {
  const [isPaused, setIsPaused] = useState(false);
  const location = useLocation();

  const { data: rates = [] } = useQuery({
    queryKey: ['silver-rates-today'],
    queryFn: silverRateService.getTodayRate,
    staleTime: 5 * 60 * 1000, // re-fetch after 5 minutes
  });

  if (location.pathname.startsWith('/admin')) return null;

  const metalRates = rates.reduce<Record<'silver' | 'gold22k', typeof rates[number] | undefined>>(
    (acc, rate) => {
      const metal = getMetalKey(rate.purity || '');
      if (!metal || acc[metal]) return acc;
      acc[metal] = rate;
      return acc;
    },
    { silver: undefined, gold22k: undefined },
  );

  const rateUpdates: PriceUpdate[] = [
    metalRates.silver
      ? {
          type: 'price',
          text: `Silver: ₹${metalRates.silver.ratePerKg.toLocaleString('en-IN')}/kg  |  ₹${metalRates.silver.ratePerGram}/g`,
          icon: 'up',
        }
      : null,
    metalRates.gold22k
      ? {
          type: 'price',
          text: `Gold 22K: ₹${metalRates.gold22k.ratePerKg.toLocaleString('en-IN')}/kg  |  ₹${metalRates.gold22k.ratePerGram}/g`,
          icon: 'up',
        }
      : null,
  ].filter(Boolean) as PriceUpdate[];

  const updates = rateUpdates.length > 0
    ? [...rateUpdates, ...staticUpdates]
    : [
        { type: 'price', text: 'Silver: Live rate update soon', icon: 'up' },
        { type: 'price', text: 'Gold 22K: Live rate update soon', icon: 'up' },
        ...staticUpdates,
      ] as PriceUpdate[];

  return (
    <div
      className="bg-primary text-primary-foreground py-2 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative flex">
        <div
          className={`flex gap-12 whitespace-nowrap ${isPaused ? '' : 'marquee'}`}
          style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
        >
          {[...updates, ...updates].map((update, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              {update.icon === 'up' && <TrendingUp className="h-4 w-4 text-green-400" />}
              {update.icon === 'bell' && <Bell className="h-4 w-4 text-yellow-400" />}
              <span>{update.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Marquee;
