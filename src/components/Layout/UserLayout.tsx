import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Home, Package, HelpCircle, LogOut, Menu, X, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";
import Logo from "./Logo";
import { Banner } from "./Banner";

const UserLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchAdminRole = async (userId: string) => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (error) {
        console.error("fetchAdminRole error", error);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(!!data);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      const userId = session?.user?.id;
      if (userId) {
        fetchAdminRole(userId);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const userId = session?.user?.id;
        if (userId) {
          setTimeout(() => fetchAdminRole(userId), 0);
        } else {
          setIsAdmin(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const menuItems = [
    { path: "/home", label: "Trang chủ", icon: Home },
    { path: "/my-orders", label: "Đơn của tôi", icon: Package },
    { path: "/support", label: "Hỗ trợ", icon: HelpCircle },
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Banner />
      
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
            <Link to="/home" className="flex items-center gap-2">
              <Logo />
            </Link>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`gap-2 transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-primary to-primary/80 shadow-md"
                        : "hover:bg-primary/10"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}

            {isAdmin && (
              <Link to="/admin/dashboard">
                <Button
                  variant="outline"
                  className="gap-2 ml-2 border-primary/40 text-primary hover:bg-primary/10"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Quản trị
                </Button>
              </Link>
            )}
          </nav>

          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-2 hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Đăng xuất</span>
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background p-4 space-y-2 animate-accordion-down">
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

            {isAdmin && (
              <>
                <div className="border-t my-2" />
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-primary hover:bg-primary/10"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Vào trang quản trị
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="container py-8 animate-fade-in">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-12">
        <div className="container py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Ani Shop. Dịch vụ order Shopee uy tín, nhanh chóng.</p>
        </div>
      </footer>
    </div>
  );
};

export default UserLayout;
