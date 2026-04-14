import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, QueryCache } from "@tanstack/react-query";
import { useLocation, BrowserRouter, Routes, Route } from "react-router-dom";
import { cn } from "@/lib/utils";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Marquee from "@/components/Marquee";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import SavingsScheme from "./pages/SavingsScheme";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Cart from "./pages/Cart";
import Payment from "./pages/Payment";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import Wishlist from "./pages/Wishlist";
import Admin from "./pages/Admin";
import ProductDetail from "./pages/ProductDetail";
import OrderTracking from "./pages/OrderTracking";
import SilverRatePage from "./pages/SilverRate";
import NotFound from "./pages/NotFound";
import OrderConfirmation from "./pages/OrderConfirmation";
import RecentlyViewed from "./pages/RecentlyViewed";
import Offers from "./pages/Offers";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import FAQ from "./pages/FAQ";
import CustomerDashboard from "./pages/CustomerDashboard";
import GiftVouchers from "./pages/GiftVouchers";
import { storeConfigService } from "@/services/storeConfig";
import ScrollToTop from "@/components/ScrollToTop";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
  queryCache: new QueryCache({
    onError: (error: unknown, query) => {
      const message = (query.meta?.errorMessage as string) ?? 'Something went wrong';
      console.error(`[API Error] ${message}:`, error);
    },
  }),
});

const colorThemeCssVars: Record<string, { primary: string; ring: string }> = {
  'ocean-teal': { primary: '195 50% 45%', ring: '195 50% 45%' },
  'rose-gold': { primary: '350 40% 50%', ring: '350 40% 50%' },
  'icy-silver': { primary: '210 25% 45%', ring: '210 25% 45%' },
  'deep-amethyst': { primary: '270 40% 45%', ring: '270 40% 45%' },
};

const applyTheme = (theme: string, isDark: boolean) => {
  document.documentElement.classList.toggle('dark', isDark);
  const vars = colorThemeCssVars[theme];
  if (vars) {
    document.documentElement.style.setProperty('--primary', vars.primary);
    document.documentElement.style.setProperty('--ring', vars.ring);
  }
};

const AppContent = () => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50">
        <Marquee />
        <Navbar />
      </header>
      <main className={cn("flex-1", isAdminPath ? "pt-[72px]" : "pt-[112px]")}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/savings-scheme" element={<SavingsScheme />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/order/:id" element={<OrderTracking />} />
          <Route path="/silver-rate" element={<SilverRatePage />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
          <Route path="/recently-viewed" element={<RecentlyViewed />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/gift-vouchers" element={<GiftVouchers />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App = () => {
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const config = await storeConfigService.getPublicStoreConfig();
        applyTheme(config.theme, !!config.isDark);
        localStorage.setItem('kv-theme-config', JSON.stringify(config));
      } catch {
        try {
          const stored = localStorage.getItem('kv-theme-config');
          if (!stored) return;
          const { theme, isDark } = JSON.parse(stored) as { theme: string; isDark: boolean };
          applyTheme(theme, !!isDark);
        } catch {
          /* ignore malformed config */
        }
      }
    };

    loadTheme();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <AppContent />
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
