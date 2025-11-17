import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "./components/Layout/Header";
import { Banner } from "./components/Layout/Banner";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Order from "./pages/Order";
import TrackOrder from "./pages/TrackOrder";
import MyOrders from "./pages/MyOrders";
import Support from "./pages/Support";
import Dashboard from "./pages/admin/Dashboard";
import Orders from "./pages/admin/Orders";
import OrderDetail from "./pages/admin/OrderDetail";
import Users from "./pages/admin/Users";
import Vouchers from "./pages/admin/Vouchers";
import AdminSupport from "./pages/admin/Support";
import Settings from "./pages/admin/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Banner />
        <Header />
        <main className="min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/order" element={<Order />} />
            <Route path="/track/:orderCode" element={<TrackOrder />} />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/support" element={<Support />} />
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/orders" element={<Orders />} />
            <Route path="/admin/orders/:id" element={<OrderDetail />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/vouchers" element={<Vouchers />} />
            <Route path="/admin/support" element={<AdminSupport />} />
            <Route path="/admin/settings" element={<Settings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
