import { useState } from 'react';
import { ArrowRight, Check, Calculator, Calendar, Gift, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import savingsImage from '@/assets/savings-scheme.jpg';

const SavingsScheme = () => {
  const { toast } = useToast();
  const [monthlyAmount, setMonthlyAmount] = useState('5000');
  const [duration, setDuration] = useState('11');

  const calculateTotal = () => {
    const amount = parseInt(monthlyAmount) || 0;
    const months = parseInt(duration) || 11;
    const totalPaid = amount * months;
    const bonusAmount = months === 11 ? amount : 0; // 1 month bonus on 11-month scheme
    return { totalPaid, bonusAmount, totalValue: totalPaid + bonusAmount };
  };

  const { totalPaid, bonusAmount, totalValue } = calculateTotal();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const benefits = [
    {
      icon: Gift,
      title: 'Bonus Month',
      description: 'Get 1 month free silver on completing 11 monthly installments',
    },
    {
      icon: Shield,
      title: 'Price Protection',
      description: 'Lock in today\'s silver rate and protect against price increases',
    },
    {
      icon: Calendar,
      title: 'Flexible Payments',
      description: 'Choose monthly amounts from ₹1,000 to ₹1,00,000',
    },
    {
      icon: Check,
      title: 'Zero Making Charges',
      description: 'No making charges when you redeem your scheme for jewelry',
    },
  ];

  const handleEnroll = () => {
    toast({
      title: 'Enrollment Initiated',
      description: 'Our team will contact you shortly to complete your enrollment.',
    });
  };

  return (
    <div className="min-h-screen pt-24">
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6">
                💰 Monthly Savings Scheme
              </span>
              <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">
                Secure Your Silver<br />Future Today
              </h1>
              <p className="text-lg opacity-80 mb-8">
                Join our Monthly Savings Scheme and build your silver collection systematically. 
                Save as little as ₹1,000 per month and earn bonus silver on completion!
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground btn-shine"
                  onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Calculate Savings
                  <Calculator className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-elegant animate-float">
                <img
                  src={savingsImage}
                  alt="Savings Scheme"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-bold text-foreground">
              Why Choose Our Scheme?
            </h2>
            <p className="text-muted-foreground mt-2">
              Maximize your silver savings with exclusive benefits
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-6 text-center card-hover">
                <div className="w-16 h-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <benefit.icon className="h-8 w-8 text-accent" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section id="calculator" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-4xl font-bold text-foreground">
                Savings Calculator
              </h2>
              <p className="text-muted-foreground mt-2">
                Plan your silver savings and see how much you can accumulate
              </p>
            </div>

            <Card className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Input */}
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="amount">Monthly Investment Amount</Label>
                    <Select value={monthlyAmount} onValueChange={setMonthlyAmount}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card">
                        <SelectItem value="1000">₹1,000</SelectItem>
                        <SelectItem value="2000">₹2,000</SelectItem>
                        <SelectItem value="5000">₹5,000</SelectItem>
                        <SelectItem value="10000">₹10,000</SelectItem>
                        <SelectItem value="25000">₹25,000</SelectItem>
                        <SelectItem value="50000">₹50,000</SelectItem>
                        <SelectItem value="100000">₹1,00,000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="duration">Scheme Duration</Label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card">
                        <SelectItem value="6">6 Months</SelectItem>
                        <SelectItem value="11">11 Months (+ 1 Month Bonus)</SelectItem>
                        <SelectItem value="12">12 Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Results */}
                <div className="bg-primary text-primary-foreground rounded-xl p-6">
                  <h3 className="font-serif text-xl font-semibold mb-6">Your Savings Summary</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="opacity-80">Monthly Payment</span>
                      <span className="font-semibold">{formatPrice(parseInt(monthlyAmount))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-80">Duration</span>
                      <span className="font-semibold">{duration} months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-80">Total Paid</span>
                      <span className="font-semibold">{formatPrice(totalPaid)}</span>
                    </div>
                    {bonusAmount > 0 && (
                      <div className="flex justify-between text-accent">
                        <span>Bonus Month Value</span>
                        <span className="font-semibold">+ {formatPrice(bonusAmount)}</span>
                      </div>
                    )}
                    <hr className="border-primary-foreground/20" />
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold">Total Value</span>
                      <span className="font-bold">{formatPrice(totalValue)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Button
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground btn-shine"
                  onClick={handleEnroll}
                >
                  Enroll Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  * Silver will be calculated based on the prevailing rate at the time of each payment
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-bold text-foreground">
              How It Works
            </h2>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: '01', title: 'Enroll', desc: 'Choose your monthly amount and register for the scheme' },
                { step: '02', title: 'Save', desc: 'Pay your installments monthly via UPI, card, or cash' },
                { step: '03', title: 'Earn', desc: 'Get bonus silver on completing the scheme duration' },
                { step: '04', title: 'Redeem', desc: 'Exchange your accumulated value for jewelry or silver' },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-accent text-accent-foreground flex items-center justify-center font-serif text-2xl font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-serif text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-serif text-4xl font-bold text-foreground text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {[
                {
                  q: 'What is the minimum amount to start the scheme?',
                  a: 'You can start with as low as ₹1,000 per month.',
                },
                {
                  q: 'Can I change my monthly amount mid-scheme?',
                  a: 'Yes, you can increase your monthly amount anytime. However, decreasing is not allowed.',
                },
                {
                  q: 'What happens if I miss a payment?',
                  a: 'You have a grace period of 10 days. After that, a nominal late fee applies.',
                },
                {
                  q: 'How is the bonus calculated?',
                  a: 'On completing 11 monthly installments, you receive silver worth one month\'s installment as bonus.',
                },
              ].map((faq, index) => (
                <Card key={index} className="p-6">
                  <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground">{faq.a}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SavingsScheme;
