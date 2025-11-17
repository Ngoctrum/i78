import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, User, LogOut, LayoutDashboard } from "lucide-react";
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

export const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

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
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
                      Voucher
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/admin/support")}>
                      Hỗ trợ
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/admin/settings")}>
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
            <Button onClick={() => navigate("/auth")} variant="default">
              Đăng nhập
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};