import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, MessageSquare, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface UserDetailDialogProps {
  userId: string | null;
  userName: string;
  userEmail: string;
  isOpen: boolean;
  onClose: () => void;
}

export const UserDetailDialog = ({
  userId,
  userName,
  userEmail,
  isOpen,
  onClose,
}: UserDetailDialogProps) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    completedOrders: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId && isOpen) {
      fetchUserData();
    }
  }, [userId, isOpen]);

  const fetchUserData = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      // Fetch orders
      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      // Fetch support tickets by matching order codes
      let ticketsData = null;
      if (ordersData && ordersData.length > 0) {
        const orderCodes = ordersData.map((o) => o.order_code);
        const { data } = await supabase
          .from("support_tickets")
          .select("*")
          .in("order_code", orderCodes)
          .order("created_at", { ascending: false });
        ticketsData = data;
      }

      if (ordersData) {
        setOrders(ordersData);
        const completed = ordersData.filter((o) => o.status === "completed");
        const totalSpent = ordersData.reduce(
          (sum, o) => sum + (o.service_fee || 0),
          0
        );
        setStats({
          totalOrders: ordersData.length,
          totalSpent,
          completedOrders: completed.length,
        });
      }

      if (ticketsData) setTickets(ticketsData);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: "secondary",
      ordered: "default",
      shipping: "default",
      completed: "default",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            Chi tiết người dùng
          </DialogTitle>
          <DialogDescription>
            <div className="space-y-1 text-left mt-2">
              <p className="font-semibold text-lg text-foreground">{userName}</p>
              <p className="text-sm text-muted-foreground">{userEmail}</p>
            </div>
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    Tổng đơn hàng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary">{stats.totalOrders}</p>
                </CardContent>
              </Card>

              <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-accent" />
                    Tổng chi tiêu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-accent">
                    {stats.totalSpent.toLocaleString("vi-VN")} đ
                  </p>
                </CardContent>
              </Card>

              <Card className="border-success-green/20 bg-gradient-to-br from-success-green/5 to-transparent">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Package className="h-4 w-4 text-success-green" />
                    Hoàn thành
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-success-green">
                    {stats.completedOrders}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="orders" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="orders">
                  <Package className="h-4 w-4 mr-2" />
                  Đơn hàng ({orders.length})
                </TabsTrigger>
                <TabsTrigger value="tickets">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Ticket hỗ trợ ({tickets.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="orders" className="space-y-3 mt-4">
                {orders.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    Chưa có đơn hàng nào
                  </p>
                ) : (
                  orders.map((order) => (
                    <Card key={order.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-semibold text-primary">
                                {order.order_code}
                              </span>
                              {getStatusBadge(order.status)}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {order.product_link}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(order.created_at), "dd/MM/yyyy", {
                                  locale: vi,
                                })}
                              </span>
                              <span className="font-semibold text-primary">
                                {(order.service_fee || 0).toLocaleString("vi-VN")} đ
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="tickets" className="space-y-3 mt-4">
                {tickets.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    Chưa có ticket hỗ trợ nào
                  </p>
                ) : (
                  tickets.map((ticket) => (
                    <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-semibold">
                              {ticket.order_code}
                            </span>
                            <Badge
                              variant={
                                ticket.status === "resolved" ? "default" : "secondary"
                              }
                            >
                              {ticket.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {ticket.description}
                          </p>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(ticket.created_at), "dd/MM/yyyy HH:mm", {
                              locale: vi,
                            })}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
