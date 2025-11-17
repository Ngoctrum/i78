import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle, ExternalLink } from "lucide-react";

const Support = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  const markAsResolved = async (id: string) => {
    try {
      const { error } = await supabase
        .from("support_tickets")
        .update({ status: "resolved", admin_notes: adminNotes })
        .eq("id", id);

      if (error) throw error;
      toast.success("Đã đánh dấu đã xử lý");
      setSelectedTicket(null);
      setAdminNotes("");
      fetchTickets();
    } catch (error: any) {
      toast.error(error.message || "Cập nhật thất bại");
    }
  };

  return (
    <div className="container py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Danh sách phiếu hỗ trợ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedTicket?.id === ticket.id ? "bg-accent" : "hover:bg-accent/50"
                  }`}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold">{ticket.order_code}</p>
                    <Badge variant={ticket.status === "resolved" ? "default" : "secondary"}>
                      {ticket.status === "resolved" ? "Đã xử lý" : "Chờ xử lý"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {ticket.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(ticket.created_at).toLocaleString("vi-VN")}
                  </p>
                </div>
              ))}
            </div>

            {tickets.length === 0 && (
              <p className="text-center text-muted-foreground py-8">Chưa có phiếu hỗ trợ</p>
            )}
          </CardContent>
        </Card>

        {selectedTicket && (
          <Card>
            <CardHeader>
              <CardTitle>Chi tiết phiếu hỗ trợ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Mã đơn hàng</Label>
                <p className="font-semibold">{selectedTicket.order_code}</p>
              </div>

              <div>
                <Label>Mô tả vấn đề</Label>
                <p className="text-sm whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>

              <div>
                <Label>Link liên hệ</Label>
                <a
                  href={selectedTicket.contact_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-2"
                >
                  {selectedTicket.contact_link}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              {selectedTicket.image_url && (
                <div>
                  <Label>Ảnh minh họa</Label>
                  <a
                    href={selectedTicket.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-2"
                  >
                    Xem ảnh
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}

              <div>
                <Label>Trạng thái</Label>
                <Badge variant={selectedTicket.status === "resolved" ? "default" : "secondary"}>
                  {selectedTicket.status === "resolved" ? "Đã xử lý" : "Chờ xử lý"}
                </Badge>
              </div>

              {selectedTicket.status === "pending" && (
                <>
                  <div>
                    <Label>Ghi chú xử lý</Label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Ghi chú kết quả xử lý..."
                      rows={4}
                    />
                  </div>

                  <Button
                    onClick={() => markAsResolved(selectedTicket.id)}
                    className="w-full"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Đánh dấu đã xử lý
                  </Button>
                </>
              )}

              {selectedTicket.admin_notes && (
                <div>
                  <Label>Ghi chú admin</Label>
                  <p className="text-sm whitespace-pre-wrap">{selectedTicket.admin_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Support;
