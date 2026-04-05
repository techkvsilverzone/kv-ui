import { Shield } from 'lucide-react';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-10">
    <h2 className="font-serif text-xl font-medium text-primary mb-4">{title}</h2>
    <div className="space-y-3 text-sm text-muted-foreground font-light leading-relaxed">{children}</div>
  </div>
);

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-background">
    {/* Header */}
    <div className="border-b border-border">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Legal</span>
        </div>
        <h1 className="font-serif text-4xl md:text-5xl font-normal text-primary mb-3">Privacy Policy</h1>
        <p className="text-muted-foreground font-light">
          Last updated: April 2025 &nbsp;|&nbsp; Effective from: April 2025
        </p>
      </div>
    </div>

    {/* Content */}
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="bg-primary/5 border border-primary/15 rounded-lg p-6 mb-12">
        <p className="text-sm text-muted-foreground font-light leading-relaxed">
          KV Silver Zone ("<strong className="text-foreground font-medium">we</strong>", "
          <strong className="text-foreground font-medium">us</strong>", or "
          <strong className="text-foreground font-medium">our</strong>") is committed to protecting your personal
          information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use
          our website or purchase our products.
        </p>
      </div>

      <Section title="1. Information We Collect">
        <p>
          <strong className="text-foreground font-medium">Personal Identification Information:</strong> Name, email
          address, phone number, billing and shipping address collected during account registration or checkout.
        </p>
        <p>
          <strong className="text-foreground font-medium">Payment Information:</strong> We do not store card details on
          our servers. Payments are processed securely through Razorpay, which is PCI DSS compliant.
        </p>
        <p>
          <strong className="text-foreground font-medium">Usage Data:</strong> Browser type, IP address, pages visited,
          and time spent on our site, collected automatically via cookies and analytics tools.
        </p>
        <p>
          <strong className="text-foreground font-medium">Preferences:</strong> Wishlist items, recently viewed
          products, and savings scheme enrollment data to personalize your experience.
        </p>
      </Section>

      <Section title="2. How We Use Your Information">
        <p>• Process and fulfill your orders, including shipping and delivery updates.</p>
        <p>• Send order confirmations, invoices, and authenticity certificates.</p>
        <p>• Respond to customer service enquiries and support requests.</p>
        <p>• Send promotional communications (only with your consent; you may opt out at any time).</p>
        <p>• Improve our website functionality, product recommendations, and user experience.</p>
        <p>• Comply with legal obligations under Indian law (GST, consumer protection, etc.).</p>
      </Section>

      <Section title="3. Sharing of Information">
        <p>
          We do not sell, trade, or rent your personal information to third parties. We may share data with:
        </p>
        <p>
          <strong className="text-foreground font-medium">Logistics Partners:</strong> Shipping details are shared with
          our courier partners (e.g., BlueDart, DTDC) solely for delivery purposes.
        </p>
        <p>
          <strong className="text-foreground font-medium">Payment Processors:</strong> Razorpay receives transaction
          data necessary to process payments securely.
        </p>
        <p>
          <strong className="text-foreground font-medium">Legal Authorities:</strong> When required by law, court order,
          or governmental authority.
        </p>
      </Section>

      <Section title="4. Cookies & Tracking">
        <p>
          Our website uses cookies to maintain your session, remember cart items, and analyze traffic patterns. You may
          disable cookies in your browser settings, but this may affect the functionality of certain features.
        </p>
        <p>
          We use Google Analytics to understand website usage. This data is anonymized and does not personally identify
          you.
        </p>
      </Section>

      <Section title="5. Data Security">
        <p>
          We implement industry-standard security measures including SSL/TLS encryption for all data transmission, secure
          server infrastructure, and access controls limiting who can view your data internally.
        </p>
        <p>
          While we take every reasonable precaution, no transmission over the internet is 100% secure. We encourage
          you to use strong, unique passwords for your account.
        </p>
      </Section>

      <Section title="6. Data Retention">
        <p>
          We retain your personal data for as long as your account is active or as needed to provide services. Order and
          payment records are kept for 7 years as required by GST regulations. You may request deletion of your account
          data by contacting us — subject to legal retention obligations.
        </p>
      </Section>

      <Section title="7. Your Rights">
        <p>• <strong className="text-foreground font-medium">Access:</strong> Request a copy of the personal data we hold about you.</p>
        <p>• <strong className="text-foreground font-medium">Correction:</strong> Update inaccurate information through your account profile.</p>
        <p>• <strong className="text-foreground font-medium">Deletion:</strong> Request erasure of your personal data (subject to legal obligations).</p>
        <p>• <strong className="text-foreground font-medium">Opt-out:</strong> Unsubscribe from marketing emails at any time via the link in any email.</p>
      </Section>

      <Section title="8. Children's Privacy">
        <p>
          Our website and services are not directed at children under the age of 18. We do not knowingly collect
          personal data from minors. If you believe we have inadvertently collected such data, please contact us
          immediately.
        </p>
      </Section>

      <Section title="9. Contact Us">
        <p>
          For any privacy-related questions, requests, or concerns, please reach out:
        </p>
        <div className="bg-secondary/50 rounded-lg p-4 mt-2 space-y-1">
          <p><strong className="text-foreground font-medium">KV Silver Zone</strong></p>
          <p>14, Rajaram St, Gnanamoorthy Nagar Extn, Ambattur, Chennai 600053</p>
          <p>Email: <a href="mailto:kvszchennai@gmail.com" className="text-primary hover:underline">kvszchennai@gmail.com</a></p>
          <p>Phone: <a href="tel:+918825649680" className="text-primary hover:underline">(+91) 88256 49680</a></p>
        </div>
      </Section>
    </div>
  </div>
);

export default PrivacyPolicy;
