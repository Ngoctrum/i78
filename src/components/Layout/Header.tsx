import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, User, LogOut, LayoutDashboard, Menu, Settings, Ticket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdmin(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdmin(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdmin = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    
    setIsAdmin(!!data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Package className="h-6 w-6 text-primary" />
          <span className="bg-gradient-to-r from-primary to-shopee-red bg-clip-text text-transparent">
            Ani Shop
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
            Trang chủ
          </Link>
          <Link to="/track" className="text-sm font-medium hover:text-primary transition-colors">
            Tra cứu đơn
          </Link>
          <Link to="/order" className="text-sm font-medium hover:text-primary transition-colors">
            Đặt hàng
          </Link>
          <Link to="/support" className="text-sm font-medium hover:text-primary transition-colors">
            Hỗ trợ
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {/* Mobile menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-6">
                <Link 
                  to="/" 
                  className="text-sm font-medium hover:text-primary transition-colors px-4 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Trang chủ
                </Link>
                <Link 
                  to="/track" 
                  className="text-sm font-medium hover:text-primary transition-colors px-4 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Tra cứu đơn
                </Link>
                <Link 
                  to="/order" 
                  className="text-sm font-medium hover:text-primary transition-colors px-4 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Đặt hàng
                </Link>
                <Link 
                  to="/support" 
                  className="text-sm font-medium hover:text-primary transition-colors px-4 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Hỗ trợ
                </Link>

                {user && (
                  <>
                    <div className="border-t my-2" />
                    <Link 
                      to="/orders" 
                      className="text-sm font-medium hover:text-primary transition-colors px-4 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Package className="inline mr-2 h-4 w-4" />
                      Đơn hàng của tôi
                    </Link>
                  </>
                )}

                {isAdmin && (
                  <>
                    <div className="border-t my-2" />
                    <div className="px-4 text-xs font-semibold text-muted-foreground">QUẢN TRỊ</div>
                    <Link 
                      to="/admin/dashboard" 
                      className="text-sm font-medium hover:text-primary transition-colors px-4 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LayoutDashboard className="inline mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                    <Link 
                      to="/admin/orders" 
                      className="text-sm font-medium hover:text-primary transition-colors px-4 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Package className="inline mr-2 h-4 w-4" />
                      Quản lý đơn
                    </Link>
                    <Link 
                      to="/admin/users" 
                      className="text-sm font-medium hover:text-primary transition-colors px-4 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="inline mr-2 h-4 w-4" />
                      Quản lý user
                    </Link>
                    <Link 
                      to="/admin/vouchers" 
                      className="text-sm font-medium hover:text-primary transition-colors px-4 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Ticket className="inline mr-2 h-4 w-4" />
                      Quản lý voucher
                    </Link>
                    <Link 
                      to="/admin/support" 
                      className="text-sm font-medium hover:text-primary transition-colors px-4 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Ticket className="inline mr-2 h-4 w-4" />
                      Quản lý hỗ trợ
                    </Link>
                    <Link 
                      to="/admin/settings" 
                      className="text-sm font-medium hover:text-primary transition-colors px-4 py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Settings className="inline mr-2 h-4 w-4" />
                      Cài đặt
                    </Link>
                  </>
                )}

                {user && (
                  <>
                    <div className="border-t my-2" />
                    <Button 
                      variant="ghost" 
                      className="justify-start px-4"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Đăng xuất
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Desktop user menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden md:flex">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background z-50">
                <DropdownMenuItem onClick={() => navigate("/orders")}>
                  <Package className="mr-2 h-4 w-4" />
                  Đơn hàng của tôi
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/admin/dashboard")}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/admin/orders")}>
                      <Package className="mr-2 h-4 w-4" />
                      Quản lý đơn
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/admin/users")}>
                      <User className="mr-2 h-4 w-4" />
                      Quản lý user
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/admin/vouchers")}>
                      <Ticket className="mr-2 h-4 w-4" />
                      Quản lý voucher
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/admin/support")}>
                      <Ticket className="mr-2 h-4 w-4" />
                      Quản lý hỗ trợ
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/admin/settings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      Cài đặt
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => navigate("/auth")}>
              Đăng nhập
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};