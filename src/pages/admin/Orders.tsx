import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Search, Eye } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Chờ duyệt", color: "bg-yellow-500" },
  ordered: { label: "Đã đặt", color: "bg-blue-500" },
  shipping: { label: "Đang giao", color: "bg-purple-500" },
  completed: { label: "Thành công", color: "bg-green-500" },
  cancelled: { label: "Đã hủy", color: "bg-red-500" },
  awaiting_payment: { label: "Chờ thanh toán", color: "bg-orange-500" },
};

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, statusFilter, orders]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.order_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.recipient_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  if (loading) {
    return <div className="container py-12">Đang tải...</div>;
  }

  return (
    <div className="container py-12">
      <Card>
        <CardHeader>
          <CardTitle>Quản lý đơn hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo mã đơn hoặc tên người nhận..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Lọc trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-semibold">{order.order_code}</p>
                    <Badge className={statusConfig[order.status]?.color}>
                      {statusConfig[order.status]?.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {order.recipient_name} - {new Date(order.created_at).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admin/orders/${order.id}`)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Chi tiết
                </Button>
              </div>
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Không tìm thấy đơn hàng</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;
