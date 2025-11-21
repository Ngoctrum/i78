import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const TrackSearch = () => {
  const [orderCode, setOrderCode] = useState("");
  const navigate = useNavigate();

  const handleTrack = () => {
    if (orderCode.trim()) {
      navigate(`/track/${orderCode.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 flex items-center justify-center">
      <div className="container max-w-xl animate-fade-in">
        <Card className="shadow-lg border-primary/20 bg-gradient-to-br from-background to-muted/30">
          <CardContent className="pt-8 pb-8 space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Tra cứu đơn hàng
              </h1>
              <p className="text-sm text-muted-foreground">
                Nhập mã đơn (ví dụ: ANI123456) để xem trạng thái chi tiết
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nhập mã đơn hàng..."
                  value={orderCode}
                  onChange={(e) => setOrderCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                  className="pl-10"
                />
              </div>
              <Button
                size="lg"
                className="sm:w-auto w-full gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                onClick={handleTrack}
              >
                <Search className="h-4 w-4" />
                Tra cứu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrackSearch;
