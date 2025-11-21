import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./components/Layout/AdminLayout";
import UserLayout from "./components/Layout/UserLayout";
import Landing from "./pages/Landing";
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
        <Routes>
          {/* Public Routes - No Layout */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/track/:orderCode" element={<TrackOrder />} />
          <Route path="/track" element={<TrackOrder />} />

          {/* User Routes - UserLayout */}
          <Route
            path="/home"
            element={
              <UserLayout>
                <Home />
              </UserLayout>
            }
          />
          <Route
            path="/order"
            element={
              <UserLayout>
                <Order />
              </UserLayout>
            }
          />
          <Route
            path="/my-orders"
            element={
              <UserLayout>
                <MyOrders />
              </UserLayout>
            }
          />
          <Route
            path="/support"
            element={
              <UserLayout>
                <Support />
              </UserLayout>
            }
          />

          {/* Admin Routes - AdminLayout */}
          <Route
            path="/admin"
            element={
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminLayout>
                <Orders />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/orders/:id"
            element={
              <AdminLayout>
                <OrderDetail />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminLayout>
                <Users />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/vouchers"
            element={
              <AdminLayout>
                <Vouchers />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/support"
            element={
              <AdminLayout>
                <AdminSupport />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AdminLayout>
                <Settings />
              </AdminLayout>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
