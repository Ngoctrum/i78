import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Không thể tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          recipient_name: order.recipient_name,
          phone_or_contact: order.phone_or_contact,
          address: order.address,
          status: order.status,
          payment_status: order.payment_status,
          tracking_code: order.tracking_code,
          admin_notes: order.admin_notes,
          service_fee: order.service_fee,
        })
        .eq("id", id);

      if (error) throw error;
      toast.success("Cập nhật đơn hàng thành công");
    } catch (error: any) {
      toast.error(error.message || "Cập nhật thất bại");
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase.from("orders").delete().eq("id", id);

      if (error) throw error;
      toast.success("Xóa đơn hàng thành công");
      navigate("/admin/orders");
    } catch (error: any) {
      toast.error(error.message || "Xóa thất bại");
    }
  };

  if (loading) return <div className="container py-12">Đang tải...</div>;
  if (!order) return <div className="container py-12">Không tìm thấy đơn hàng</div>;

  return (
    <div className="container py-12">
      <Button variant="ghost" onClick={() => navigate("/admin/orders")} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Quay lại
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Chi tiết đơn hàng: {order.order_code}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Mã đơn</Label>
              <Input value={order.order_code} disabled />
            </div>
            <div>
              <Label>Ngày tạo</Label>
              <Input value={new Date(order.created_at).toLocaleString("vi-VN")} disabled />
            </div>
          </div>

          <div>
            <Label>Link sản phẩm</Label>
            <Input value={order.product_link} disabled />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Số lượng</Label>
              <Input type="number" value={order.quantity} disabled />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={order.email || ""} disabled />
            </div>
          </div>

          <div>
            <Label>Tên người nhận</Label>
            <Input
              value={order.recipient_name}
              onChange={(e) => setOrder({ ...order, recipient_name: e.target.value })}
            />
          </div>

          <div>
            <Label>Số điện thoại</Label>
            <Input
              value={order.phone_or_contact}
              onChange={(e) => setOrder({ ...order, phone_or_contact: e.target.value })}
            />
          </div>

          <div>
            <Label>Địa chỉ</Label>
            <Textarea
              value={order.address}
              onChange={(e) => setOrder({ ...order, address: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Trạng thái đơn</Label>
              <Select value={order.status} onValueChange={(value) => setOrder({ ...order, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Chờ duyệt</SelectItem>
                  <SelectItem value="ordered">Đã đặt</SelectItem>
                  <SelectItem value="shipping">Đang giao</SelectItem>
                  <SelectItem value="completed">Thành công</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                  <SelectItem value="awaiting_payment">Chờ thanh toán</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Thanh toán</Label>
              <Select value={order.payment_status} onValueChange={(value) => setOrder({ ...order, payment_status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">Chưa thanh toán</SelectItem>
                  <SelectItem value="paid">Đã thanh toán</SelectItem>
                  <SelectItem value="refunded">Đã hoàn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Mã vận đơn</Label>
              <Input
                value={order.tracking_code || ""}
                onChange={(e) => setOrder({ ...order, tracking_code: e.target.value })}
                placeholder="Nhập mã vận đơn..."
              />
            </div>
            <div>
              <Label>Phí dịch vụ (đ)</Label>
              <Input
                type="number"
                value={order.service_fee || 0}
                onChange={(e) => setOrder({ ...order, service_fee: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div>
            <Label>Ghi chú của admin</Label>
            <Textarea
              value={order.admin_notes || ""}
              onChange={(e) => setOrder({ ...order, admin_notes: e.target.value })}
              placeholder="Ghi chú nội bộ..."
              rows={3}
            />
          </div>

          {order.notes && (
            <div>
              <Label>Ghi chú của khách</Label>
              <Textarea value={order.notes} disabled rows={2} />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button onClick={handleUpdate} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Lưu thay đổi
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa đơn
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn có chắc muốn xóa đơn hàng này? Hành động này không thể hoàn tác.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Xóa</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetail;
