import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Voucher {
  id: string;
  code: string;
  voucher_type: string;
  fee_amount: number;
  description: string | null;
}

const Order = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    productLink: "",
    quantity: 1,
    voucherId: "",
    recipientName: "",
    phoneOrContact: "",
    address: "",
    email: "",
    notes: "",
  });

  useEffect(() => {
    fetchVouchers();
    checkDailyLimit();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const fetchVouchers = async () => {
    const { data } = await supabase
      .from("vouchers")
      .select("*")
      .eq("is_active", true);
    
    if (data) {
      setVouchers(data);
    }
  };

  const checkDailyLimit = async () => {
    const { data: settings } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "daily_order_limit")
      .single();

    if (settings) {
      const limit = parseInt(settings.value);
      const today = new Date().toISOString().split("T")[0];

      const { count } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .gte("created_at", `${today}T00:00:00`)
        .lte("created_at", `${today}T23:59:59`);

      setIsLimitReached((count || 0) >= limit);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderCode = await generateOrderCode();
      
      const selectedVoucher = vouchers.find(v => v.id === formData.voucherId);
      const serviceFee = selectedVoucher?.voucher_type === "paid" ? selectedVoucher.fee_amount : 0;

      const { error } = await supabase.from("orders").insert({
        order_code: orderCode,
        user_id: user?.id || null,
        product_link: formData.productLink,
        quantity: formData.quantity,
        voucher_id: formData.voucherId || null,
        recipient_name: formData.recipientName,
        phone_or_contact: formData.phoneOrContact,
        address: formData.address,
        email: formData.email || null,
        notes: formData.notes || null,
        service_fee: serviceFee,
        status: "pending",
        payment_status: serviceFee > 0 ? "unpaid" : "paid",
      });

      if (error) throw error;

      toast.success(`Đặt hàng thành công! Mã đơn: ${orderCode}`);
      navigate(`/track/${orderCode}`);
    } catch (error: any) {
      toast.error(error.message || "Đặt hàng thất bại");
    } finally {
      setLoading(false);
    }
  };

  const generateOrderCode = async () => {
    const { data, error } = await supabase.rpc("generate_order_code");
    if (error) throw error;
    return data;
  };

  if (isLimitReached) {
    return (
      <div className="container py-20">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Đã đạt giới hạn đơn hàng trong ngày. Vui lòng quay lại vào ngày mai.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <Card className="mx-auto max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle>Đặt đơn hàng mới</CardTitle>
          <CardDescription>
            Điền đầy đủ thông tin để chúng tôi đặt đơn hộ bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productLink">Link sản phẩm Shopee *</Label>
              <Input
                id="productLink"
                placeholder="https://shopee.vn/..."
                value={formData.productLink}
                onChange={(e) => setFormData({ ...formData, productLink: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Số lượng *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="voucher">Voucher</Label>
              <Select value={formData.voucherId} onValueChange={(value) => setFormData({ ...formData, voucherId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn voucher (không bắt buộc)" />
                </SelectTrigger>
                <SelectContent>
                  {vouchers.map((voucher) => (
                    <SelectItem key={voucher.id} value={voucher.id}>
                      {voucher.code} - {voucher.voucher_type === "free" ? "Miễn phí" : `${voucher.fee_amount}đ`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipientName">Tên người nhận *</Label>
              <Input
                id="recipientName"
                placeholder="Nguyễn Văn A"
                value={formData.recipientName}
                onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneOrContact">SĐT hoặc Link Zalo/Facebook *</Label>
              <Input
                id="phoneOrContact"
                placeholder="0123456789 hoặc facebook.com/..."
                value={formData.phoneOrContact}
                onChange={(e) => setFormData({ ...formData, phoneOrContact: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ *</Label>
              <Textarea
                id="address"
                placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (không bắt buộc)</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea
                id="notes"
                placeholder="Thông tin bổ sung cho đơn hàng..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Đặt hàng
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Order;