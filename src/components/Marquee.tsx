import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Bell } from 'lucide-react';

interface PriceUpdate {
  type: 'price' | 'notification';
  text: string;
  icon?: 'up' | 'down' | 'bell';
}

const updates: PriceUpdate[] = [
  { type: 'price', text: 'Silver (999): ₹92,500/kg', icon: 'up' },
  { type: 'price', text: 'Silver (925): ₹85,625/kg', icon: 'up' },
  { type: 'notification', text: '🎉 Festive Sale: Up to 25% OFF on all jewelry!', icon: 'bell' },
  { type: 'price', text: 'Today\'s Making Charges: 12% onwards', icon: 'bell' },
  { type: 'notification', text: '💎 New Arrival: Exclusive Temple Jewelry Collection', icon: 'bell' },
  { type: 'price', text: 'Silver Rate (10g): ₹925', icon: 'down' },
  { type: 'notification', text: '🏆 Join our Monthly Savings Scheme - Get 1 month bonus!', icon: 'bell' },
];

const Marquee = () => {
  const [isPaused, setIsPaused] = useState(false);

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
              {update.icon === 'down' && <TrendingDown className="h-4 w-4 text-red-400" />}
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
