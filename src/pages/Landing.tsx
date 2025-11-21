import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShoppingBag,
  Zap,
  Shield,
  Sparkles,
  ArrowRight,
  Gift,
  TrendingUp,
} from "lucide-react";
import Logo from "@/components/Layout/Logo";

const Landing = () => {
  const features = [
    {
      icon: Zap,
      title: "Nhanh chóng",
      description: "Đặt hàng chỉ trong vài phút, xử lý tức thì",
      gradient: "from-yellow-400 to-orange-500",
    },
    {
      icon: Shield,
      title: "Uy tín",
      description: "Cam kết bảo mật thông tin 100%",
      gradient: "from-blue-400 to-cyan-500",
    },
    {
      icon: Gift,
      title: "Ưu đãi",
      description: "Nhiều voucher giảm phí hấp dẫn",
      gradient: "from-pink-400 to-rose-500",
    },
    {
      icon: TrendingUp,
      title: "Minh bạch",
      description: "Theo dõi đơn hàng realtime mọi lúc",
      gradient: "from-green-400 to-emerald-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo />
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" className="gap-2">
                Đăng nhập
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity">
                Đăng ký ngay
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="flex flex-col items-center text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 animate-scale-in">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">
              Nền tảng order Shopee #1 Việt Nam
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
            Đặt hàng Shopee
            <br />
            Siêu dễ, siêu nhanh!
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
            Dịch vụ order Shopee chuyên nghiệp, uy tín. Hỗ trợ 24/7, phí thấp, giao
            hàng toàn quốc.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link to="/auth">
              <Button
                size="lg"
                className="gap-2 text-lg px-8 py-6 bg-gradient-to-r from-primary to-accent hover:shadow-2xl hover:scale-105 transition-all"
              >
                <ShoppingBag className="h-5 w-5" />
                Bắt đầu đặt hàng
              </Button>
            </Link>
            <Link to="/track">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 text-lg px-8 py-6 hover:bg-primary/10 transition-all"
              >
                Tra cứu đơn hàng
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20 bg-gradient-to-b from-transparent to-muted/30">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tại sao chọn{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Ani Shop
            </span>
            ?
          </h2>
          <p className="text-lg text-muted-foreground">
            Trải nghiệm dịch vụ order đỉnh cao cùng chúng tôi
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-2 hover:border-primary/50 animate-fade-in bg-gradient-to-br from-background to-muted/20"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="pt-6 space-y-4">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20">
        <Card className="bg-gradient-to-r from-primary to-accent text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-grid-white/10" />
          <CardContent className="py-16 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Sẵn sàng bắt đầu?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Đăng ký ngay để nhận ưu đãi đặc biệt cho đơn đầu tiên!
            </p>
            <Link to="/auth">
              <Button
                size="lg"
                variant="secondary"
                className="gap-2 text-lg px-8 py-6 hover:scale-105 transition-transform"
              >
                <Sparkles className="h-5 w-5" />
                Đăng ký miễn phí
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Ani Shop. Dịch vụ order Shopee uy tín, chuyên nghiệp.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
