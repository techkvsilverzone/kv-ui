import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, MessageCircle, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  category: string;
  items: FAQItem[];
}

const faqData: FAQCategory[] = [
  {
    category: 'Purity & Certification',
    items: [
      {
        question: 'What does Silver mean?',
        answer:
          'Silver means the piece contains 92.5% pure silver and 7.5% other metals (usually copper) for added strength and durability. This is the international standard for high-quality silver jewelry. All KV Silver Zone products meet this standard.',
      },
      {
        question: 'What is BIS Hallmarking?',
        answer:
          'BIS (Bureau of Indian Standards) Hallmarking is the official Indian certification for precious metals. A BIS hallmark guarantees the purity of the silver as declared. All products sold by KV Silver Zone are BIS Hallmarked, ensuring you get exactly what you pay for.',
      },
      {
        question: 'Do I receive a Certificate of Authenticity?',
        answer:
          'Yes. Every purchase from KV Silver Zone comes with a Certificate of Authenticity, which includes the product details, weight, purity, and our verification seal. This document also supports buy-back and exchange claims.',
      },
      {
        question: 'Can I get an invoice for GST purposes?',
        answer:
          'Absolutely. A GST-compliant invoice is generated for every order and shared via email. You can also download it from your Profile → Orders section. Our GSTIN is available on all invoices.',
      },
    ],
  },
  {
    category: 'Ordering & Payment',
    items: [
      {
        question: 'What payment methods do you accept?',
        answer:
          'We accept all major payment methods through Razorpay: UPI (GPay, PhonePe, Paytm), debit and credit cards (Visa, Mastercard, RuPay, Amex), net banking, and digital wallets. Cash on Delivery (COD) is available for orders up to ₹15,000 in eligible pin codes.',
      },
      {
        question: 'Is it safe to pay online?',
        answer:
          'Yes. All transactions are secured with 256-bit SSL encryption. We use Razorpay — a PCI DSS Level 1 compliant payment gateway — to process payments. We never store your card details on our servers.',
      },
      {
        question: 'Can I modify or cancel an order after placing it?',
        answer:
          'Orders can be cancelled within 2 hours of placement by contacting our support team. Once dispatched, cancellations are not possible — you may initiate a return after delivery. For modifications, please call us immediately after ordering.',
      },
      {
        question: 'Do prices include GST?',
        answer:
          'Yes. All prices displayed on our website are inclusive of 3% GST applicable on silver jewelry as per Indian tax regulations. You will see a full breakdown on your invoice.',
      },
    ],
  },
  {
    category: 'Shipping & Delivery',
    items: [
      {
        question: 'How long does delivery take?',
        answer:
          'Standard delivery takes 5–7 business days across India. Metro cities like Chennai, Mumbai, Delhi, and Bangalore typically receive orders within 3–4 days. Remote pin codes may require additional time.',
      },
      {
        question: 'Are shipments insured?',
        answer:
          'Yes. Every shipment from KV Silver Zone is fully insured against loss or damage during transit. In the rare event of a transit issue, we will replace or refund your order at no additional cost.',
      },
      {
        question: 'How do I track my order?',
        answer:
          'Once your order is dispatched, you will receive an SMS and email with the tracking number and courier partner details. You can also track your order in real time via Profile → Orders → View Order.',
      },
      {
        question: 'Do you ship outside India?',
        answer:
          'Currently, we ship only within India. International shipping is not available at this time. We hope to expand our reach in the future.',
      },
    ],
  },
  {
    category: 'Returns, Exchanges & Buyback',
    items: [
      {
        question: 'What is your return policy?',
        answer:
          'We accept returns within 7 days of delivery. Items must be unworn, in original condition with all tags intact, and returned with the original packaging, invoice, and authenticity certificate. Personalized or engraved items are non-returnable.',
      },
      {
        question: 'How do I initiate a return?',
        answer:
          'Log in to your account, go to Profile → Returns, and submit a return request. Our team will review it within 24 hours and arrange a pickup. Once received and verified, your refund will be processed in 5–7 business days.',
      },
      {
        question: 'Can I exchange for a different size or design?',
        answer:
          'Yes. We offer exchanges for size and design changes within 7 days of delivery, subject to product availability. Exchange shipping costs are borne by the customer for the first request; subsequent exchanges may incur additional charges.',
      },
      {
        question: 'Do you offer a silver buyback?',
        answer:
          'Yes. KV Silver Zone offers a buyback option at prevailing silver market rates at the time of transaction, minus applicable making charges and taxes. Buyback is subject to purity verification and is available in-store. Contact us to arrange an appointment.',
      },
    ],
  },
  {
    category: 'Silver Care',
    items: [
      {
        question: 'Why is my silver tarnishing?',
        answer:
          'Tarnishing is a natural process caused by a reaction between silver and sulfur compounds in the air, water, and skin oils. It is not a defect. Silver is slightly more prone to tarnishing than pure silver due to the copper content, but tarnish can be easily removed.',
      },
      {
        question: 'How do I clean and maintain my silver jewelry?',
        answer:
          'Clean with a soft, lint-free cloth regularly. For deeper cleaning, use a mild soap solution and a soft brush, then rinse and dry thoroughly. Avoid contact with chlorine, perfumes, lotions, and harsh chemicals. Store in an airtight pouch or the box provided to reduce tarnishing.',
      },
      {
        question: 'Can I wear silver while swimming or bathing?',
        answer:
          'We strongly recommend removing silver jewelry before swimming (especially in chlorinated pools or saltwater) and bathing. Chlorine and salt water can accelerate tarnishing and damage the finish of your pieces.',
      },
    ],
  },
  {
    category: 'Savings Scheme',
    items: [
      {
        question: 'How does the KV Silver Zone Savings Scheme work?',
        answer:
          'You enroll with a monthly installment amount (minimum ₹500) and a plan duration (6, 11, or 17 months). After 11 regular payments, you earn a bonus 12th installment. At maturity, the accumulated amount can be redeemed against any silver purchase at zero making charges.',
      },
      {
        question: 'Can I withdraw before the scheme matures?',
        answer:
          'Yes, you may exit early, but the bonus installment will be forfeited. Only the principal paid amounts will be credited toward a purchase. We recommend completing the full term for maximum benefit.',
      },
      {
        question: 'Are the monthly savings locked at a fixed silver rate?',
        answer:
          'Savings amounts are monetary, not locked to a silver rate. The redemption value equals the total savings plus any bonus, used toward purchases at the prevailing price at the time of redemption.',
      },
    ],
  },
];

const FAQAccordionItem = ({ question, answer }: FAQItem) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        className="w-full flex items-center justify-between py-5 text-left gap-4 group"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="font-medium text-sm text-foreground group-hover:text-primary transition-colors pr-4">
          {question}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          strokeWidth={1.5}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 pb-5' : 'max-h-0'}`}
      >
        <p className="text-sm text-muted-foreground font-light leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState(faqData[0].category);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-16 max-w-5xl">
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground block mb-4">Help Center</span>
          <h1 className="font-serif text-4xl md:text-5xl font-normal text-primary mb-4">
            Frequently Asked<br />
            <span className="italic">Questions</span>
          </h1>
          <p className="text-muted-foreground font-light max-w-xl">
            Everything you need to know about our silver, shopping experience, and the KV Silver Zone promise.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Category nav */}
          <aside className="lg:w-56 shrink-0">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-4">Categories</p>
            <nav className="space-y-1">
              {faqData.map(({ category }) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`w-full text-left px-3 py-2.5 rounded-md text-sm transition-colors ${
                    activeCategory === category
                      ? 'bg-primary/8 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                  }`}
                >
                  {category}
                </button>
              ))}
            </nav>

            {/* Contact block */}
            <div className="mt-10 border border-border rounded-lg p-5">
              <p className="font-serif text-base font-medium text-primary mb-1">Still have questions?</p>
              <p className="text-xs text-muted-foreground mb-4 font-light">Our team is here to help.</p>
              <div className="space-y-2">
                <a href="tel:+918825649680" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                  <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
                  (+91) 88256 49680
                </a>
                <a href="mailto:kvszchennai@gmail.com" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                  <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
                  kvszchennai@gmail.com
                </a>
                <Link to="/contact" className="flex items-center gap-2 text-xs text-primary hover:underline mt-3">
                  <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Open a support request
                </Link>
              </div>
            </div>
          </aside>

          {/* FAQ content */}
          <div className="flex-1">
            {faqData
              .filter(({ category }) => category === activeCategory)
              .map(({ category, items }) => (
                <div key={category}>
                  <h2 className="font-serif text-2xl font-normal text-primary mb-6">{category}</h2>
                  <div className="border border-border rounded-lg px-6">
                    {items.map((item) => (
                      <FAQAccordionItem key={item.question} {...item} />
                    ))}
                  </div>
                </div>
              ))}

            {/* Browse all */}
            <div className="mt-10 bg-secondary/30 rounded-lg p-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
              <div>
                <p className="font-serif text-base font-medium text-primary">Can't find your answer?</p>
                <p className="text-sm text-muted-foreground font-light">We respond to all enquiries within 4 business hours.</p>
              </div>
              <Link to="/contact">
                <Button size="sm" className="btn-shine shrink-0 gap-2 text-xs uppercase tracking-wider">
                  <MessageCircle className="h-3.5 w-3.5" />
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
