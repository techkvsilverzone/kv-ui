import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, Search, ChevronDown, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { totalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Collections', path: '/shop' },
    { name: 'Silver Rate', path: '/silver-rate' },
    { name: 'Savings Scheme', path: '/savings-scheme' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const submitSearch = () => {
    const query = searchQuery.trim();
    navigate(query ? `/shop?search=${encodeURIComponent(query)}` : '/shop');
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`transition-all duration-500 border-b ${isScrolled
        ? 'bg-background/95 backdrop-blur-md border-border/40 shadow-sm py-2'
        : 'bg-background/95 backdrop-blur-md border-border/40 py-4'
        }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">

          {/* Left Section */}
          <div className="flex-1 flex items-center justify-start gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src="/kvlogo.png"
                alt="KV Silver Zone"
                className="h-10 w-10 md:h-11 md:w-11 object-contain"
              />
              <div className="hidden sm:flex flex-col leading-none">
                <span className="font-serif text-lg md:text-xl font-bold text-primary tracking-wide group-hover:opacity-90 transition-opacity">
                  KV SILVER ZONE
                </span>
                <span className="text-[9px] md:text-[10px] uppercase tracking-[0.22em] text-muted-foreground group-hover:text-accent transition-colors">
                  Pure Silver • Pure Trust
                </span>
              </div>
            </Link>

            {/* Expandable Search */}
            <div className={`relative flex items-center transition-all duration-300 ${isSearchOpen ? 'w-full max-w-sm ml-4 lg:ml-0' : 'w-auto'}`}>
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex text-muted-foreground hover:text-foreground transition-colors z-10"
                onClick={() => {
                  if (isSearchOpen && searchQuery.trim()) {
                    submitSearch();
                    return;
                  }
                  setIsSearchOpen(!isSearchOpen);
                }}
              >
                {isSearchOpen ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Search className="h-5 w-5" strokeWidth={1.5} />}
              </Button>
              <div
                className={`absolute left-0 top-1/2 -translate-y-1/2 overflow-hidden transition-all duration-300 flex items-center ${isSearchOpen ? 'w-[300px] opacity-100 pl-10' : 'w-0 opacity-0'
                  }`}
              >
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      submitSearch();
                    }
                  }}
                  className="w-full bg-secondary/50 border border-input rounded-full py-2 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all font-light"
                  autoFocus={isSearchOpen}
                />
              </div>
            </div>
          </div>

          {/* Actions (Right) */}
          <div className="flex-1 flex items-center justify-end gap-1 md:gap-3">
            <Link to="/wishlist">
              <Button variant="ghost" size="icon" className="hidden sm:flex text-muted-foreground hover:text-white transition-colors">
                <Heart className="h-5 w-5" strokeWidth={1.5} />
              </Button>
            </Link>

            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-white transition-colors">
                <ShoppingCart className="h-5 w-5" strokeWidth={1.5} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-white font-normal">
                    <User className="h-4 w-4" strokeWidth={1.5} />
                    <span className="hidden md:inline text-xs uppercase tracking-wider">{user?.name}</span>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-card border-border/50">
                  <DropdownMenuItem asChild className="text-foreground focus:bg-muted/50 focus:text-foreground cursor-pointer">
                    <Link to="/profile">My Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-foreground focus:bg-muted/50 focus:text-foreground cursor-pointer">
                    <Link to="/profile">My Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-foreground focus:bg-muted/50 focus:text-foreground cursor-pointer">
                    <Link to="/wishlist">My Wishlist</Link>
                  </DropdownMenuItem>
                  {user?.isAdmin && (
                    <>
                      <DropdownMenuSeparator className="bg-border/50" />
                      <DropdownMenuItem asChild className="text-foreground focus:bg-muted/50 focus:text-foreground cursor-pointer">
                        <Link to="/admin">Admin Panel</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-xs uppercase tracking-wider font-medium hover:bg-transparent hover:text-accent">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Desktop Navigation (Bottom Row - Centered) */}
        <div className="hidden lg:flex justify-center mt-4 pb-1">
          <div className="flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link text-xs font-medium tracking-[0.15em] transition-colors ${isActive(link.path)
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-primary'
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-6 border-t border-border/50 animate-fade-in bg-background">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 text-sm uppercase tracking-wider transition-colors ${isActive(link.path)
                    ? 'bg-accent/5 text-accent font-semibold border-l-2 border-accent'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                    }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
