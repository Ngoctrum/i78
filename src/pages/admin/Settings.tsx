import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Save, Eye, EyeOff, Mail, Server } from "lucide-react";

const Settings = () => {
  const [settings, setSettings] = useState({
    daily_order_limit: 100,
    banner_enabled: false,
    banner_text: "",
    banner_color: "#EE4D2D",
    maintenance_mode: false,
    bank_name: "MBank",
    bank_account_number: "",
    bank_account_name: "",
    smtp_host: "",
    smtp_port: "587",
    smtp_username: "",
    smtp_password: "",
  });
  
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from("site_settings").select("*");
      if (error) throw error;

      if (data) {
        const settingsMap: any = {};
        data.forEach((setting) => {
          settingsMap[setting.key] = setting.value;
        });

        setSettings({
          daily_order_limit: parseInt(settingsMap.daily_order_limit || "100"),
          banner_enabled: settingsMap.banner_enabled === "true",
          banner_text: settingsMap.banner_text || "",
          banner_color: settingsMap.banner_color || "#EE4D2D",
          maintenance_mode: settingsMap.maintenance_mode === "true",
          bank_name: settingsMap.bank_name || "MBank",
          bank_account_number: settingsMap.bank_account_number || "",
          bank_account_name: settingsMap.bank_account_name || "",
          smtp_host: settingsMap.smtp_host || "",
          smtp_port: settingsMap.smtp_port || "587",
          smtp_username: settingsMap.smtp_username || "",
          smtp_password: settingsMap.smtp_password || "",
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ key, value }, { onConflict: "key" });

      if (error) throw error;
    } catch (error) {
      throw error;
    }
  };

  const handleSave = async () => {
    try {
      await Promise.all([
        updateSetting("daily_order_limit", settings.daily_order_limit.toString()),
        updateSetting("banner_enabled", settings.banner_enabled.toString()),
        updateSetting("banner_text", settings.banner_text),
        updateSetting("banner_color", settings.banner_color),
        updateSetting("maintenance_mode", settings.maintenance_mode.toString()),
        updateSetting("bank_name", settings.bank_name),
        updateSetting("bank_account_number", settings.bank_account_number),
        updateSetting("bank_account_name", settings.bank_account_name),
        updateSetting("smtp_host", settings.smtp_host),
        updateSetting("smtp_port", settings.smtp_port),
        updateSetting("smtp_username", settings.smtp_username),
        updateSetting("smtp_password", settings.smtp_password),
      ]);

      toast.success("Lưu cài đặt thành công");
    } catch (error: any) {
      toast.error(error.message || "Lưu thất bại");
    }
  };

  return (
    <div className="container py-12 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Cài đặt hệ thống</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Giới hạn đơn hàng mỗi ngày</Label>
            <Input
              type="number"
              value={settings.daily_order_limit}
              onChange={(e) =>
                setSettings({ ...settings, daily_order_limit: parseInt(e.target.value) || 0 })
              }
            />
            <p className="text-sm text-muted-foreground mt-1">
              Khi đạt giới hạn, form đặt hàng sẽ bị khóa
            </p>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <Label>Bật banner thông báo</Label>
              <Switch
                checked={settings.banner_enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, banner_enabled: checked })}
              />
            </div>

            {settings.banner_enabled && (
              <div className="space-y-4">
                <div>
                  <Label>Nội dung banner</Label>
                  <Input
                    value={settings.banner_text}
                    onChange={(e) => setSettings({ ...settings, banner_text: e.target.value })}
                    placeholder="Thông báo quan trọng..."
                  />
                </div>

                <div>
                  <Label>Màu banner</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.banner_color}
                      onChange={(e) => setSettings({ ...settings, banner_color: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={settings.banner_color}
                      onChange={(e) => setSettings({ ...settings, banner_color: e.target.value })}
                      placeholder="#EE4D2D"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Chế độ bảo trì</Label>
                <p className="text-sm text-muted-foreground">
                  Khi bật, người dùng sẽ thấy trang bảo trì. Admin vẫn truy cập được.
                </p>
              </div>
              <Switch
                checked={settings.maintenance_mode}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, maintenance_mode: checked })
                }
              />
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold">Thông tin ngân hàng</h3>
            <div>
              <Label>Tên ngân hàng</Label>
              <Input
                value={settings.bank_name}
                onChange={(e) => setSettings({ ...settings, bank_name: e.target.value })}
                placeholder="MBank"
              />
            </div>
            <div>
              <Label>Số tài khoản</Label>
              <Input
                value={settings.bank_account_number}
                onChange={(e) => setSettings({ ...settings, bank_account_number: e.target.value })}
                placeholder="Nhập số tài khoản"
              />
            </div>
            <div>
              <Label>Tên chủ tài khoản</Label>
              <Input
                value={settings.bank_account_name}
                onChange={(e) => setSettings({ ...settings, bank_account_name: e.target.value })}
                placeholder="Nhập tên chủ tài khoản"
              />
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Cấu hình Email SMTP</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Cấu hình SMTP để gửi email thông báo tự động (reset mật khẩu, xác nhận đơn...)
            </p>
            
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>SMTP Host</Label>
                  <div className="relative">
                    <Server className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      value={settings.smtp_host}
                      onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                </div>
                <div>
                  <Label>SMTP Port</Label>
                  <Input
                    type="number"
                    value={settings.smtp_port}
                    onChange={(e) => setSettings({ ...settings, smtp_port: e.target.value })}
                    placeholder="587"
                  />
                </div>
              </div>
              
              <div>
                <Label>Email / Username</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-10"
                    type="email"
                    value={settings.smtp_username}
                    onChange={(e) => setSettings({ ...settings, smtp_username: e.target.value })}
                    placeholder="your-email@gmail.com"
                  />
                </div>
              </div>
              
              <div>
                <Label>Password / App Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={settings.smtp_password}
                    onChange={(e) => setSettings({ ...settings, smtp_password: e.target.value })}
                    placeholder="••••••••••••"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Với Gmail, sử dụng App Password thay vì mật khẩu thường
                </p>
              </div>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90">
            <Save className="h-4 w-4" />
            Lưu tất cả cài đặt
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
