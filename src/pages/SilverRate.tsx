import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, Minus, Loader2, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { silverRateService, type SilverRate as SilverRateType } from '@/services/silverRate';

const SilverRate = () => {
  const { data: todayRates = [], isLoading: todayLoading } = useQuery({
    queryKey: ['silver-rates-today'],
    queryFn: silverRateService.getTodayRate,
  });

  const { data: historyRates = [], isLoading: historyLoading } = useQuery({
    queryKey: ['silver-rates-history'],
    queryFn: () => silverRateService.getRateHistory(30),
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getTopRate = (purity: string) => {
    return todayRates.find((r) => r.purity === purity);
  };

  const getPreviousRate = (purity: string) => {
    const sorted = historyRates
      .filter((r) => r.purity === purity)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sorted.length > 1 ? sorted[1] : null;
  };

  const getChange = (current: SilverRateType | undefined, previous: SilverRateType | null) => {
    if (!current || !previous) return { change: 0, percentage: 0 };
    const change = current.ratePerGram - previous.ratePerGram;
    const percentage = (change / previous.ratePerGram) * 100;
    return { change, percentage };
  };

  const purityTypes = [
    { code: '999', label: '999 Fine Silver (24K)', description: 'Investment grade pure silver' },
    { code: '925', label: '925 Sterling Silver', description: 'Standard jewelry silver' },
    { code: '916', label: '916 Silver', description: 'Traditional jewelry grade' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-muted-foreground text-xs uppercase tracking-[0.2em] mb-4 block">
            Updated Daily
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-normal text-primary mb-4">
            Today's Silver Rate
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Live silver prices at KV Silver Zone. Our rates are updated daily based on market rates from the India Bullion and Jewellers Association (IBJA).
          </p>
          <div className="w-24 h-px bg-primary/20 mt-6 mx-auto"></div>
        </div>

        {todayLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : (
          <>
            {/* Rate Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {purityTypes.map((purity) => {
                const rate = getTopRate(purity.code);
                const prevRate = getPreviousRate(purity.code);
                const { change, percentage } = getChange(rate, prevRate);

                return (
                  <Card key={purity.code} className="p-6 hover:shadow-md transition-shadow">
                    <div className="text-center">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                        {purity.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground mb-4">{purity.description}</p>

                      <div className="mb-4">
                        <p className="text-3xl font-semibold text-primary">
                          {rate ? formatPrice(rate.ratePerGram) : '—'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">per gram</p>
                      </div>

                      {rate && (
                        <div className="flex items-center justify-center gap-2 text-sm">
                          {change > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : change < 0 ? (
                            <TrendingDown className="h-4 w-4 text-destructive" />
                          ) : (
                            <Minus className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className={change > 0 ? 'text-green-600' : change < 0 ? 'text-destructive' : 'text-muted-foreground'}>
                            {change >= 0 ? '+' : ''}{formatPrice(change)} ({percentage.toFixed(2)}%)
                          </span>
                        </div>
                      )}

                      {rate?.ratePerKg && (
                        <p className="text-sm text-muted-foreground mt-3">
                          {formatPrice(rate.ratePerKg)} / kg
                        </p>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Rate History Table */}
            <Card className="p-6 mb-12">
              <h2 className="font-serif text-xl font-semibold mb-6">30-Day Price History</h2>
              {historyLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-accent" />
                </div>
              ) : historyRates.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">Purity</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">Rate/Gram</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">Rate/Kg</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyRates
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 30)
                        .map((rate, idx) => (
                          <tr key={idx} className="border-b border-border last:border-0 hover:bg-muted/30">
                            <td className="py-3 px-4">
                              {new Date(rate.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="py-3 px-4 text-right">{rate.purity}</td>
                            <td className="py-3 px-4 text-right font-medium">{formatPrice(rate.ratePerGram)}</td>
                            <td className="py-3 px-4 text-right">{formatPrice(rate.ratePerKg)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Rate history will appear here once prices are updated.
                </p>
              )}
            </Card>
          </>
        )}

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="p-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-accent mt-0.5" />
              <div>
                <h3 className="font-serif text-lg font-semibold mb-2">Making Charges</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Product prices include silver rate + making charges + GST (3% on silver value + 5% on making charges). Making charges vary by product complexity and design.
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-accent mt-0.5" />
              <div>
                <h3 className="font-serif text-lg font-semibold mb-2">Buyback Policy</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We offer buyback on all KV Silver Zone products at the prevailing silver rate minus 2% deduction. Bring your product with the original invoice for hassle-free buyback.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Want to invest smartly? Start our Monthly Silver Savings Scheme.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild>
              <Link to="/shop">Shop Now</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/savings-scheme">Savings Scheme</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SilverRate;
