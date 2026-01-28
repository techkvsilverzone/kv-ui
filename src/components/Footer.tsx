import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary-foreground flex items-center justify-center">
                <span className="text-primary font-serif font-bold text-xl">KV</span>
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold">KV Silver Zone</h3>
                <p className="text-xs opacity-80">Pure Silver, Pure Trust</p>
              </div>
            </div>
            <p className="text-sm opacity-80 mb-4">
              Your trusted destination for premium silver jewelry and investment. Experience the elegance of pure silver with our certified collection.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { name: 'Shop Silver', path: '/shop' },
                { name: 'Savings Scheme', path: '/savings-scheme' },
                { name: 'About Us', path: '/about' },
                { name: 'Contact Support', path: '/contact' },
                { name: 'My Account', path: '/profile' },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm opacity-80 hover:opacity-100 transition-opacity"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Categories</h4>
            <ul className="space-y-2">
              {['Necklaces', 'Bangles', 'Earrings', 'Rings', 'Anklets', 'Coins', 'Puja Items'].map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/shop?category=${cat}`}
                    className="text-sm opacity-80 hover:opacity-100 transition-opacity"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 opacity-80" />
                <span className="text-sm opacity-80">
                  123 Silver Street, Jewelry Market,<br />Chennai, Tamil Nadu 600001
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 opacity-80" />
                <span className="text-sm opacity-80">+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 opacity-80" />
                <span className="text-sm opacity-80">info@kvsilverzone.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm opacity-60">
              © 2025 KV Silver Zone. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="#" className="text-sm opacity-60 hover:opacity-100 transition-opacity">
                Privacy Policy
              </Link>
              <Link to="#" className="text-sm opacity-60 hover:opacity-100 transition-opacity">
                Terms of Service
              </Link>
              <Link to="#" className="text-sm opacity-60 hover:opacity-100 transition-opacity">
                Refund Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
