import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Bell } from 'lucide-react';
import { silverRateService } from '@/services/silverRate';

interface PriceUpdate {
  type: 'price' | 'notification';
  text: string;
  icon?: 'up' | 'bell';
}

const staticUpdates: PriceUpdate[] = [
  { type: 'notification', text: '🎉 Festive Sale: Up to 25% OFF on all jewelry!', icon: 'bell' },
  { type: 'notification', text: '💎 New Arrival: Exclusive Temple Jewelry Collection', icon: 'bell' },
  { type: 'notification', text: '🏆 Join our Monthly Savings Scheme - Get 1 month bonus!', icon: 'bell' },
];

const Marquee = () => {
  const [isPaused, setIsPaused] = useState(false);

  const { data: rates = [] } = useQuery({
    queryKey: ['silver-rates-today'],
    queryFn: silverRateService.getTodayRate,
    staleTime: 5 * 60 * 1000, // re-fetch after 5 minutes
  });

  const rateUpdates: PriceUpdate[] = rates.map((r) => ({
    type: 'price',
    text: `Silver (${r.purity}): ₹${r.ratePerKg.toLocaleString('en-IN')}/kg  |  ₹${r.ratePerGram}/g`,
    icon: 'up',
  }));

  const updates = rateUpdates.length > 0
    ? [...rateUpdates, ...staticUpdates]
    : [
        { type: 'price', text: 'Silver (999): ₹92,500/kg', icon: 'up' },
        { type: 'price', text: 'Silver (925): ₹85,625/kg', icon: 'up' },
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
