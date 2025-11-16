import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const Support = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    orderCode: "",
    description: "",
    contactLink: "",
    imageUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("support_tickets").insert({
        order_code: formData.orderCode,
        description: formData.description,
        contact_link: formData.contactLink,
        image_url: formData.imageUrl || null,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Đã gửi yêu cầu hỗ trợ thành công!");
      setFormData({
        orderCode: "",
        description: "",
        contactLink: "",
        imageUrl: "",
      });
      
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || "Gửi yêu cầu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-12">
      <Card className="mx-auto max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle>Gửi yêu cầu hỗ trợ</CardTitle>
          <CardDescription>
            Gặp vấn đề với đơn hàng? Hãy cho chúng tôi biết!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orderCode">Mã đơn hàng *</Label>
              <Input
                id="orderCode"
                placeholder="ANI123456"
                value={formData.orderCode}
                onChange={(e) => setFormData({ ...formData, orderCode: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả vấn đề *</Label>
              <Textarea
                id="description"
                placeholder="Vui lòng mô tả chi tiết vấn đề bạn gặp phải..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactLink">Link liên hệ (Zalo/Facebook) *</Label>
              <Input
                id="contactLink"
                placeholder="zalo.me/... hoặc facebook.com/..."
                value={formData.contactLink}
                onChange={(e) => setFormData({ ...formData, contactLink: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Link ảnh minh họa (không bắt buộc)</Label>
              <Input
                id="imageUrl"
                placeholder="https://..."
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Gửi yêu cầu
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Support;