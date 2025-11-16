import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Package, CheckCircle2, Truck, Facebook, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Home = () => {
  const [orderCode, setOrderCode] = useState("");
  const navigate = useNavigate();

  const handleTrack = () => {
    if (orderCode.trim()) {
      navigate(`/track/${orderCode.trim()}`);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              <span className="bg-gradient-to-r from-primary to-shopee-red bg-clip-text text-transparent">
                Ani Shop
              </span>
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">
              Dịch vụ đặt đơn hộ Shopee nhanh - rẻ - uy tín
            </p>

            {/* Track Order Input */}
            <Card className="mx-auto max-w-md shadow-lg">
              <CardContent className="pt-6">
                <div className="flex gap-2">
                  <Input
                    placeholder="Nhập mã đơn hàng..."
                    value={orderCode}
                    onChange={(e) => setOrderCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                    className="flex-1"
                  />
                  <Button onClick={handleTrack} className="gap-2">
                    <Search className="h-4 w-4" />
                    Tra cứu
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 flex justify-center gap-4">
              <Button
                size="lg"
                onClick={() => navigate("/order")}
                className="gap-2 shadow-lg hover:shadow-xl transition-all"
              >
                <Package className="h-5 w-5" />
                Đặt hàng ngay
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold">Cách thức hoạt động</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-8">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Package className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">1. Điền thông tin</h3>
                <p className="text-muted-foreground">
                  Cung cấp link sản phẩm Shopee và thông tin nhận hàng của bạn
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-8">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                  <CheckCircle2 className="h-8 w-8 text-accent" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">2. Admin đặt hàng</h3>
                <p className="text-muted-foreground">
                  Chúng tôi sẽ kiểm tra và đặt đơn hàng cho bạn trên Shopee
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-8">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-green/10">
                  <Truck className="h-8 w-8 text-success-green" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">3. Nhận hàng</h3>
                <p className="text-muted-foreground">
                  Nhận hàng và thanh toán phí dịch vụ sau khi đơn thành công
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold">Liên hệ với chúng tôi</h2>
          <div className="mx-auto max-w-md">
            <div className="flex flex-col gap-4">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 justify-start"
                onClick={() => window.open("https://zalo.me/", "_blank")}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                </svg>
                Zalo
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 justify-start"
                onClick={() => window.open("https://facebook.com/", "_blank")}
              >
                <Facebook className="h-5 w-5" />
                Facebook
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 justify-start"
                onClick={() => (window.location.href = "mailto:support@anishop.com")}
              >
                <Mail className="h-5 w-5" />
                Email: support@anishop.com
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;