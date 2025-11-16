import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Banner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [text, setText] = useState("");
  const [color, setColor] = useState("#EE4D2D");

  useEffect(() => {
    fetchBannerSettings();

    const channel = supabase
      .channel("site_settings_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "site_settings",
        },
        () => {
          fetchBannerSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBannerSettings = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["banner_enabled", "banner_text", "banner_color"]);

    if (data) {
      const enabled = data.find((s) => s.key === "banner_enabled")?.value === "true";
      const bannerText = data.find((s) => s.key === "banner_text")?.value || "";
      const bannerColor = data.find((s) => s.key === "banner_color")?.value || "#EE4D2D";

      setIsVisible(enabled);
      setText(bannerText);
      setColor(bannerColor);
    }
  };

  if (!isVisible || !text) return null;

  return (
    <div
      className="relative flex items-center justify-center px-4 py-3 text-white"
      style={{ backgroundColor: color }}
    >
      <p className="text-sm font-medium text-center">{text}</p>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 h-6 w-6 text-white hover:bg-white/20"
        onClick={() => setIsVisible(false)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};