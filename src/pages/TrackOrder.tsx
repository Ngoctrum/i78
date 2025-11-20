import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Package, CheckCircle2, Truck, XCircle, Clock, DollarSign } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PaymentQRCode from "@/components/PaymentQRCode";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Chờ duyệt", color: "bg-yellow-500", icon: Clock },
  ordered: { label: "Đã đặt", color: "bg-blue-500", icon: Package },
  shipping: { label: "Đang giao", color: "bg-purple-500", icon: Truck },
  completed: { label: "Thành công", color: "bg-green-500", icon: CheckCircle2 },
  cancelled: { label: "Đã hủy", color: "bg-red-500", icon: XCircle },
  awaiting_payment: { label: "Chờ thanh toán", color: "bg-orange-500", icon: DollarSign },
};

const TrackOrder = () => {
  const { orderCode } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [voucher, setVoucher] = useState<any>(null);
  const [bankSettings, setBankSettings] = useState<any>({ bank_name: "", bank_account_number: "", bank_account_name: "" });

  useEffect(() => {
    if (orderCode) {
      fetchOrder();
    }
  }, [orderCode]);

  const fetchOrder = async () => {
    try {
      const { data: orderData, error } = await supabase
        .from("orders")
        .select("*")
        .eq("order_code", orderCode)
        .single();

      if (error) throw error;

      setOrder(orderData);

      if (orderData.voucher_id) {
        const { data: voucherData } = await supabase
          .from("vouchers")
          .select("*")
          .eq("id", orderData.voucher_id)
          .single();

        setVoucher(voucherData);
      }

      // Fetch bank settings
      const { data: settingsData } = await supabase
        .from("site_settings")
        .select("*");
      
      if (settingsData) {
        const settingsMap: any = {};
        settingsData.forEach((setting) => {
          settingsMap[setting.key] = setting.value;
        });
        setBankSettings({
          bank_name: settingsMap.bank_name || "MBank",
          bank_account_number: settingsMap.bank_account_number || "",
          bank_account_name: settingsMap.bank_account_name || "",
        });
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  const maskPhone = (phone: string) => {
    if (phone.length <= 4) return phone;
    const visible = Math.ceil(phone.length * 0.4);
    return phone.slice(0, visible) + "*".repeat(phone.length - visible);
  };

  const maskAddress = (address: string) => {
    const parts = address.split(",");
    const visibleCount = Math.ceil(parts.length * 0.5);
    return parts.slice(0, visibleCount).join(",") + ", ***";
  };

  if (loading) {
    return (
      <div className="container py-20 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-20">
        <Alert>
          <AlertDescription>Không tìm thấy đơn hàng với mã: {orderCode}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const StatusIcon = statusConfig[order.status]?.icon || Clock;

  return (
    <div className="container py-12">
      <Card className="mx-auto max-w-3xl shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Chi tiết đơn hàng</CardTitle>
            <Badge className={statusConfig[order.status]?.color}>
              {statusConfig[order.status]?.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Order Timeline */}
          <div className="flex items-center justify-between px-4">
            {Object.entries(statusConfig).slice(0, 4).map(([key, config], index) => {
              const isActive = Object.keys(statusConfig).indexOf(order.status) >= index;
              const Icon = config.icon;
              
              return (
                <div key={key} className="flex flex-col items-center flex-1">
                  <div
                    className={`rounded-full p-3 ${
                      isActive ? config.color : "bg-gray-200"
                    } text-white mb-2`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs text-center">{config.label}</span>
                </div>
              );
            })}
          </div>

          {/* Order Details */}
          <div className="space-y-3 border-t pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Mã đơn</p>
                <p className="font-semibold">{order.order_code}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ngày tạo</p>
                <p className="font-semibold">
                  {new Date(order.created_at).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Link sản phẩm</p>
              <a
                href={order.product_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {order.product_link}
              </a>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Số lượng</p>
                <p className="font-semibold">{order.quantity}</p>
              </div>
              {voucher && (
                <div>
                  <p className="text-sm text-muted-foreground">Voucher</p>
                  <p className="font-semibold">{voucher.code}</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Người nhận</p>
              <p className="font-semibold">{order.recipient_name}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Số điện thoại</p>
              <p className="font-semibold">{maskPhone(order.phone_or_contact)}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Địa chỉ</p>
              <p className="font-semibold">{maskAddress(order.address)}</p>
            </div>

            {order.tracking_code && (
              <div>
                <p className="text-sm text-muted-foreground">Mã vận đơn</p>
                <p className="font-semibold">{order.tracking_code}</p>
              </div>
            )}

            {order.notes && (
              <div>
                <p className="text-sm text-muted-foreground">Ghi chú</p>
                <p className="font-semibold">{order.notes}</p>
              </div>
            )}

            {order.service_fee > 0 && (
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-1">Phí dịch vụ</p>
                <p className="font-bold text-lg text-primary">
                  {order.service_fee.toLocaleString('vi-VN')} đ
                </p>
              </div>
            )}
          </div>

          {/* Payment QR Code - Show when tracking code exists and unpaid */}
          {order.tracking_code && order.service_fee > 0 && order.payment_status === "unpaid" && (
            <div className="border-t pt-6">
              <PaymentQRCode
                bankName={bankSettings.bank_name}
                accountNumber={bankSettings.bank_account_number}
                accountName={bankSettings.bank_account_name}
                amount={order.service_fee}
                orderCode={order.order_code}
              />
            </div>
          )}

          {order.status === "pending" && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate(`/edit-request/${order.id}`)}
            >
              Yêu cầu chỉnh sửa đơn
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TrackOrder;