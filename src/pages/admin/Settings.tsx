import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Save } from "lucide-react";

const Settings = () => {
  const [settings, setSettings] = useState({
    daily_order_limit: 100,
    banner_enabled: false,
    banner_text: "",
    banner_color: "#EE4D2D",
    maintenance_mode: false,
  });

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

          <Button onClick={handleSave} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Lưu cài đặt
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
