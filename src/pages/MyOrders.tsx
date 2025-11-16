import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Chờ duyệt", color: "bg-yellow-500" },
  ordered: { label: "Đã đặt", color: "bg-blue-500" },
  shipping: { label: "Đang giao", color: "bg-purple-500" },
  completed: { label: "Thành công", color: "bg-green-500" },
  cancelled: { label: "Đã hủy", color: "bg-red-500" },
  awaiting_payment: { label: "Chờ thanh toán", color: "bg-orange-500" },
};

const MyOrders = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      fetchOrders(session.user.id);
    });
  }, [navigate]);

  const fetchOrders = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-20 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-12">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Đơn hàng của tôi</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <Alert>
              <AlertDescription>
                Bạn chưa có đơn hàng nào.{" "}
                <Button variant="link" className="p-0 h-auto" onClick={() => navigate("/order")}>
                  Đặt hàng ngay
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card
                  key={order.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/track/${order.order_code}`)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-semibold">{order.order_code}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString("vi-VN")}
                        </p>
                        <p className="text-sm">
                          {order.recipient_name} - SL: {order.quantity}
                        </p>
                      </div>
                      <Badge className={statusConfig[order.status]?.color}>
                        {statusConfig[order.status]?.label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyOrders;