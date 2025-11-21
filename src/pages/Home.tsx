import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Plus, 
  Search, 
  HelpCircle, 
  TrendingUp,
  Clock,
  CheckCircle2,
  Truck,
  ShoppingBag
} from "lucide-react";

const statusConfig: Record<string, { label: string; variant: any; icon: any }> = {
  pending: { label: "Chờ duyệt", variant: "secondary", icon: Clock },
  ordered: { label: "Đã đặt", variant: "default", icon: Package },
  shipping: { label: "Đang giao", variant: "default", icon: Truck },
  completed: { label: "Thành công", variant: "default", icon: CheckCircle2 },
  awaiting_payment: { label: "Chờ thanh toán", variant: "secondary", icon: Clock },
};

const Home = () => {
  const navigate = useNavigate();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch recent orders
      const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (orders) {
        setRecentOrders(orders);
        setStats({
          total: orders.length,
          pending: orders.filter(o => o.status === "pending" || o.status === "awaiting_payment").length,
          completed: orders.filter(o => o.status === "completed").length,
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      icon: Plus,
      label: "Đặt hàng mới",
      description: "Tạo đơn hàng Shopee",
      action: () => navigate("/order"),
      gradient: "from-primary to-orange-500",
    },
    {
      icon: Search,
      label: "Tra cứu đơn",
      description: "Kiểm tra trạng thái",
      action: () => navigate("/track"),
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: HelpCircle,
      label: "Hỗ trợ",
      description: "Liên hệ admin",
      action: () => navigate("/support"),
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-accent p-8 text-white animate-fade-in">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            Chào mừng trở lại! 👋
          </h1>
          <p className="text-white/90 text-lg">
            Sẵn sàng đặt hàng Shopee với chúng tôi
          </p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-20">
          <ShoppingBag className="h-full w-full" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 animate-fade-in" style={{ animationDelay: "100ms" }}>
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng đơn</p>
                <p className="text-3xl font-bold text-primary">{stats.total}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <Package className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Đang xử lý</p>
                <p className="text-3xl font-bold text-accent">{stats.pending}</p>
              </div>
              <div className="rounded-full bg-accent/10 p-3">
                <Clock className="h-6 w-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hoàn thành</p>
                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="rounded-full bg-green-500/10 p-3">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
        <h2 className="text-2xl font-bold mb-4">Thao tác nhanh</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map((action, index) => (
            <Card
              key={index}
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50"
              onClick={action.action}
            >
              <CardContent className="pt-6">
                <div className={`mb-4 inline-flex rounded-2xl bg-gradient-to-br ${action.gradient} p-4 text-white group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold mb-1">{action.label}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="animate-fade-in" style={{ animationDelay: "300ms" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Đơn hàng gần đây</h2>
          <Button variant="outline" onClick={() => navigate("/my-orders")}>
            Xem tất cả
          </Button>
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </CardContent>
          </Card>
        ) : recentOrders.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-4">Chưa có đơn hàng nào</p>
              <Button onClick={() => navigate("/order")} className="gap-2">
                <Plus className="h-4 w-4" />
                Đặt hàng ngay
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => {
              const StatusIcon = statusConfig[order.status]?.icon || Clock;
              return (
                <Card
                  key={order.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/track/${order.order_code}`)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-primary">
                            {order.order_code}
                          </span>
                          <Badge variant={statusConfig[order.status]?.variant || "secondary"}>
                            {statusConfig[order.status]?.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {order.product_link}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{new Date(order.created_at).toLocaleDateString("vi-VN")}</span>
                          {order.service_fee > 0 && (
                            <span className="font-semibold text-primary">
                              {order.service_fee.toLocaleString("vi-VN")} đ
                            </span>
                          )}
                        </div>
                      </div>
                      <StatusIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
