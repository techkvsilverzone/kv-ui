import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-secondary text-primary pt-24 pb-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-24 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex flex-col gap-1">
              <h3 className="font-serif text-2xl font-medium tracking-wide">KV SILVER ZONE</h3>
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Pure Silver • Pure Trust</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed font-light">
              Experience the elegance of pure silver. Our certified collections define luxury and tradition, crafted for the modern connoisseur.
            </p>
            <div className="flex gap-4 pt-2">
              <SocialIcon icon={Facebook} />
              <SocialIcon icon={Instagram} />
              <SocialIcon icon={Twitter} />
              <SocialIcon icon={Youtube} />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-medium mb-8">Discover</h4>
            <ul className="space-y-4">
              <FooterLink to="/shop" label="Silver Collection" />
              <FooterLink to="/savings-scheme" label="Investment Plan" />
              <FooterLink to="/about" label="Our Heritage" />
              <FooterLink to="/contact" label="Concierge" />
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-serif text-lg font-medium mb-8">Collections</h4>
            <ul className="space-y-4">
              <FooterLink to="/shop?category=Necklaces" label="Necklaces & Chains" />
              <FooterLink to="/shop?category=Bangles" label="Bangles & Bracelets" />
              <FooterLink to="/shop?category=Rings" label="Rings" />
              <FooterLink to="/shop?category=Puja Items" label="Silver Artifacts" />
            </ul>
          </div>

          {/* Newsletter / Contact */}
          <div>
            <h4 className="font-serif text-lg font-medium mb-8">Stay Connected</h4>
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-sm text-muted-foreground font-light">
                <MapPin className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                <span>14, Rajaram St, Gnanamoorthy Nagar Extn,<br />Town Planning Colony, Ambattur, Chennai 600053</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground font-light">
                <Phone className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                <span>(+91) 90922 24666 / 88256 49680</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground font-light">
                <Mail className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                <span>kvszchennai@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            © 2025 KV Silver Zone. All rights reserved.
          </p>
          <div className="flex gap-8">
            <Link to="#" className="text-xs text-muted-foreground hover:text-primary uppercase tracking-wider transition-colors">
              Privacy
            </Link>
            <Link to="#" className="text-xs text-muted-foreground hover:text-primary uppercase tracking-wider transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialIcon = ({ icon: Icon }: { icon: any }) => (
  <a
    href="#"
    className="w-10 h-10 rounded-full border border-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all duration-300"
  >
    <Icon className="h-4 w-4" strokeWidth={1.5} />
  </a>
);

const FooterLink = ({ to, label }: { to: string; label: string }) => (
  <li>
    <Link
      to={to}
      className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group font-light"
    >
      <span className="w-0 group-hover:w-2 h-px bg-primary transition-all duration-300" />
      {label}
    </Link>
  </li>
);

export default Footer;
