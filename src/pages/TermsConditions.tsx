import { FileText } from 'lucide-react';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-10">
    <h2 className="font-serif text-xl font-medium text-primary mb-4">{title}</h2>
    <div className="space-y-3 text-sm text-muted-foreground font-light leading-relaxed">{children}</div>
  </div>
);

const TermsConditions = () => (
  <div className="min-h-screen bg-background">
    {/* Header */}
    <div className="border-b border-border">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Legal</span>
        </div>
        <h1 className="font-serif text-4xl md:text-5xl font-normal text-primary mb-3">Terms & Conditions</h1>
        <p className="text-muted-foreground font-light">
          Last updated: April 2025 &nbsp;|&nbsp; Governing Law: India
        </p>
      </div>
    </div>

    {/* Content */}
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="bg-primary/5 border border-primary/15 rounded-lg p-6 mb-12">
        <p className="text-sm text-muted-foreground font-light leading-relaxed">
          By accessing or purchasing from KV Silver Zone, you agree to be bound by these Terms and Conditions. Please
          read them carefully. If you do not agree, please discontinue use of our website.
        </p>
      </div>

      <Section title="1. Eligibility">
        <p>
          You must be at least 18 years of age to make a purchase. By placing an order, you confirm that you are of
          legal age and have the legal capacity to enter into a binding contract under the laws of India.
        </p>
      </Section>

      <Section title="2. Products & Pricing">
        <p>
          All products listed are subject to availability. Prices are displayed in Indian Rupees (INR) and include
          applicable GST (currently 3% on silver jewelry). Prices are subject to change without prior notice.
        </p>
        <p>
          Product images are representative. Slight variations in color, finish, or texture may exist due to
          photography lighting and screen calibration. All silver products are BIS Hallmarked (Silver
          unless stated otherwise).
        </p>
        <p>
          Weight mentioned is gross weight. Net metal weight may differ based on making charges and ornament design.
          Actual weights are verified at dispatch and are accurate within ±2% tolerance.
        </p>
      </Section>

      <Section title="3. Orders & Payment">
        <p>
          Placing an order constitutes an offer to purchase. KV Silver Zone reserves the right to accept or decline
          any order at its discretion.
        </p>
        <p>
          Payments are processed securely via Razorpay. We accept UPI, debit/credit cards, net banking, and cash on
          delivery (COD) for eligible pin codes. COD orders are subject to a maximum order value of ₹15,000.
        </p>
        <p>
          In the event of a payment failure or dispute, contact us within 48 hours at kvszchennai@gmail.com with
          your order reference.
        </p>
      </Section>

      <Section title="4. Shipping & Delivery">
        <p>
          All orders are dispatched within 24–48 hours of payment confirmation (excluding Sundays and national
          holidays). Standard delivery takes 5–7 business days across India.
        </p>
        <p>
          All shipments are fully insured against loss or damage in transit. Tracking details will be shared via
          SMS and email once dispatched.
        </p>
        <p>
          We currently ship only within India. Delivery to remote pin codes may take additional time. KV Silver Zone
          is not responsible for delays caused by courier partners or natural events.
        </p>
      </Section>

      <Section title="5. Returns, Exchanges & Refunds">
        <p>
          We accept returns within 7 days of delivery, provided items are in original, unworn condition with all tags
          intact, packed in original packaging, and accompanied by the original invoice and authenticity certificate.
        </p>
        <p>
          <strong className="text-foreground font-medium">Non-Returnable Items:</strong> Personalized or engraved
          pieces, items showing signs of wear, and items damaged due to misuse.
        </p>
        <p>
          Approved refunds are processed within 5–7 business days to the original payment method. For COD orders,
          refunds are issued via bank transfer.
        </p>
        <p>
          <strong className="text-foreground font-medium">Buyback Policy:</strong> KV Silver Zone offers a buyback
          option at prevailing silver rates minus applicable making charges and taxes. Buyback is at our discretion
          and is subject to purity verification.
        </p>
      </Section>

      <Section title="6. Savings Scheme">
        <p>
          The KV Silver Zone Monthly Savings Scheme is an in-store saving plan. Enrollment does not constitute a
          regulated financial product. The scheme allows customers to save a fixed monthly amount and redeem
          equivalent silver value at maturity, with an applicable bonus installment.
        </p>
        <p>
          KV Silver Zone reserves the right to modify scheme terms with 30 days' notice. Premature withdrawal may
          result in forfeiture of bonus benefits.
        </p>
      </Section>

      <Section title="7. Intellectual Property">
        <p>
          All content on this website — including text, images, logos, and product designs — is the property of KV
          Silver Zone and is protected under applicable Indian copyright and trademark laws. Unauthorized
          reproduction or use is strictly prohibited.
        </p>
      </Section>

      <Section title="8. Limitation of Liability">
        <p>
          KV Silver Zone's liability for any claim shall not exceed the value of the product purchased. We are not
          liable for indirect, incidental, or consequential damages arising from use of our products or website.
        </p>
      </Section>

      <Section title="9. Governing Law & Dispute Resolution">
        <p>
          These terms are governed by the laws of India. Any disputes arising shall be subject to the exclusive
          jurisdiction of the courts in Chennai, Tamil Nadu.
        </p>
        <p>
          We encourage resolution through our customer support team before initiating any formal proceedings.
          Reach us at kvszchennai@gmail.com or (+91) 88256 49680.
        </p>
      </Section>

      <Section title="10. Amendments">
        <p>
          KV Silver Zone reserves the right to update these Terms & Conditions at any time. Continued use of our
          website after changes constitutes your acceptance of the updated terms. We recommend checking this page
          periodically.
        </p>
      </Section>

      <div className="bg-secondary/50 rounded-lg p-6 mt-4">
        <p className="font-serif text-base font-medium text-primary mb-2">Contact Us</p>
        <p className="text-sm text-muted-foreground font-light">
          KV Silver Zone, 14 Rajaram St, Ambattur, Chennai 600053<br />
          <a href="mailto:kvszchennai@gmail.com" className="text-primary hover:underline">kvszchennai@gmail.com</a>
          {' '}·{' '}
          <a href="tel:+918825649680" className="text-primary hover:underline">(+91) 88256 49680</a>
        </p>
      </div>
    </div>
  </div>
);

export default TermsConditions;
