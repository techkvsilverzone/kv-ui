import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, QueryCache } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import Wishlist from "./pages/Wishlist";
import Admin from "./pages/Admin";
import ProductDetail from "./pages/ProductDetail";
import OrderTracking from "./pages/OrderTracking";
import SilverRatePage from "./pages/SilverRate";
import NotFound from "./pages/NotFound";

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <div className="flex flex-col min-h-screen">
              <header className="fixed top-0 left-0 right-0 z-50">
                <Marquee />
                <Navbar />
              </header>
              <main className="flex-1 pt-[112px]">
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
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/order/:id" element={<OrderTracking />} />
                  <Route path="/silver-rate" element={<SilverRatePage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
