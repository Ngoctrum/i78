import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  Users,
  Ticket,
  Settings,
  LogOut,
  Menu,
  X,
  Gift,
  Home,
} from "lucide-react";
import { toast } from "sonner";
import Logo from "./Logo";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { path: "/home", label: "Trang chủ User", icon: Home },
    { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/orders", label: "Đơn hàng", icon: Package },
    { path: "/admin/users", label: "Người dùng", icon: Users },
    { path: "/admin/vouchers", label: "Voucher", icon: Gift },
    { path: "/admin/support", label: "Hỗ trợ", icon: Ticket },
    { path: "/admin/settings", label: "Cài đặt", icon: Settings },
  ];

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Đăng xuất thất bại");
    } else {
      toast.success("Đã đăng xuất");
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <Logo />
              <div>
                <span className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Admin Panel
                </span>
              </div>
            </Link>
          </div>

          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-2 hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Đăng xuất</span>
          </Button>
        </div>
      </header>

      <div className="container flex gap-6 py-6">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex lg:flex-col w-64 gap-2">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start gap-2 transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-primary to-primary/80 shadow-lg scale-105"
                        : "hover:bg-primary/10 hover:scale-102"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="fixed left-0 top-16 bottom-0 w-64 bg-background border-r p-4 space-y-1 animate-slide-in-right">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`w-full justify-start gap-2 ${
                        isActive ? "bg-primary" : ""
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 animate-fade-in">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
