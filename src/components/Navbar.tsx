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

          {/* Left Section: Logo & Mobile Menu */}
          <div className="flex-shrink-0 flex items-center justify-start gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>

            <Link to="/" className="flex items-center gap-3 lg:gap-4 group">
              <img
                src="/kvlogo.png"
                alt="KV Silver Zone"
                className="h-12 w-12 md:h-16 md:w-16 object-contain"
              />
              <div className="hidden sm:flex flex-col justify-center leading-tight">
                <span className="font-serif text-xl md:text-3xl font-bold text-primary tracking-wide group-hover:opacity-90 transition-opacity whitespace-nowrap">
                  KV SILVER ZONE
                </span>
                <span className="text-[10px] md:text-sm uppercase tracking-[0.22em] text-muted-foreground group-hover:text-primary transition-colors">
                  Pure Silver • Pure Trust
                </span>
              </div>
            </Link>
          </div>

          {/* Center Section: Always Expanded Search (Hidden in Admin) */}
          {!location.pathname.startsWith('/admin') ? (
            <div className="flex-1 min-w-0 flex items-center px-6 md:px-12 lg:px-24 xl:px-32 max-w-4xl">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                  className="w-full bg-secondary/50 border border-input rounded-full py-2.5 pl-11 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all font-light"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-semibold">Admin Panel</span>
            </div>
          )}

          {/* Actions (Right) */}
          <div className="flex-shrink-0 flex items-center justify-end gap-3 md:gap-6">
            {!location.pathname.startsWith('/admin') && (
              <>
                <Link to="/wishlist">
                  <Button variant="ghost" size="icon" className="hidden sm:flex text-muted-foreground hover:text-primary transition-colors">
                    <Heart className="h-6 w-6" strokeWidth={1.5} />
                  </Button>
                </Link>

                <Link to="/cart">
                  <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary transition-colors">
                    <ShoppingCart className="h-6 w-6" strokeWidth={1.5} />
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                        {totalItems}
                      </span>
                    )}
                  </Button>
                </Link>
              </>
            )}

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2 text-muted-foreground hover:text-primary font-normal">
                    <User className="h-5 w-5" strokeWidth={1.5} />
                    <span className="hidden md:inline text-sm uppercase tracking-wider">{user?.name}</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
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
                <Button variant="ghost" size="sm" className="text-xs uppercase tracking-wider font-medium hover:bg-transparent hover:text-primary">
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
                className={`nav-link text-sm font-medium tracking-[0.15em] transition-colors ${isActive(link.path)
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
                    ? 'bg-accent/5 text-primary font-semibold border-l-2 border-accent'
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
