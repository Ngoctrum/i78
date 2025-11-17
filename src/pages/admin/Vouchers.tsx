import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const Vouchers = () => {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    voucher_type: "free",
    fee_amount: 0,
  });

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const { data, error } = await supabase
        .from("vouchers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVouchers(data || []);
    } catch (error) {
      console.error("Error fetching vouchers:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from("vouchers").insert([{
        code: formData.code.toUpperCase(),
        description: formData.description,
        voucher_type: formData.voucher_type as "free" | "paid",
        fee_amount: formData.voucher_type === "paid" ? formData.fee_amount : null,
      }]);

      if (error) throw error;

      toast.success("Thêm voucher thành công");
      setFormData({ code: "", description: "", voucher_type: "free", fee_amount: 0 });
      setShowForm(false);
      fetchVouchers();
    } catch (error: any) {
      toast.error(error.message || "Thêm voucher thất bại");
    }
  };

  const deleteVoucher = async (id: string) => {
    try {
      const { error } = await supabase.from("vouchers").delete().eq("id", id);

      if (error) throw error;
      toast.success("Xóa voucher thành công");
      fetchVouchers();
    } catch (error: any) {
      toast.error(error.message || "Xóa thất bại");
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("vouchers")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      toast.success(`Đã ${!currentStatus ? "kích hoạt" : "vô hiệu hóa"} voucher`);
      fetchVouchers();
    } catch (error: any) {
      toast.error(error.message || "Cập nhật thất bại");
    }
  };

  return (
    <div className="container py-12">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Quản lý Voucher</CardTitle>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm voucher
          </Button>
        </CardHeader>
        <CardContent>
          {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Mã voucher *</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="FREESHIP"
                    required
                  />
                </div>
                <div>
                  <Label>Loại voucher</Label>
                  <Select
                    value={formData.voucher_type}
                    onValueChange={(value) => setFormData({ ...formData, voucher_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Miễn phí</SelectItem>
                      <SelectItem value="paid">Có phí</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.voucher_type === "paid" && (
                <div>
                  <Label>Phí dịch vụ (đ)</Label>
                  <Input
                    type="number"
                    value={formData.fee_amount}
                    onChange={(e) => setFormData({ ...formData, fee_amount: parseFloat(e.target.value) })}
                    required
                  />
                </div>
              )}

              <div>
                <Label>Mô tả</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Miễn phí vận chuyển..."
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">Thêm</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Hủy
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {vouchers.map((voucher) => (
              <div
                key={voucher.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-semibold">{voucher.code}</p>
                    <Badge variant={voucher.voucher_type === "free" ? "default" : "secondary"}>
                      {voucher.voucher_type === "free" ? "Miễn phí" : `${voucher.fee_amount?.toLocaleString()}đ`}
                    </Badge>
                    <Badge variant={voucher.is_active ? "default" : "outline"}>
                      {voucher.is_active ? "Kích hoạt" : "Vô hiệu"}
                    </Badge>
                  </div>
                  {voucher.description && (
                    <p className="text-sm text-muted-foreground">{voucher.description}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(voucher.id, voucher.is_active)}
                  >
                    {voucher.is_active ? "Vô hiệu hóa" : "Kích hoạt"}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bạn có chắc muốn xóa voucher này?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteVoucher(voucher.id)}>
                          Xóa
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>

          {vouchers.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Chưa có voucher nào</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Vouchers;
