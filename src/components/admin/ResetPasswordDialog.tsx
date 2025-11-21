import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { KeyRound, Mail } from "lucide-react";

interface ResetPasswordDialogProps {
  userEmail: string;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ResetPasswordDialog = ({
  userEmail,
  userName,
  isOpen,
  onClose,
}: ResetPasswordDialogProps) => {
  const [loading, setLoading] = useState(false);

  const handleSendResetEmail = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast.success(
        `Email đặt lại mật khẩu đã được gửi tới ${userEmail}`,
        {
          description: "Người dùng sẽ nhận được link đặt lại mật khẩu qua email",
        }
      );
      onClose();
    } catch (error: any) {
      toast.error("Gửi email thất bại", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            Đặt lại mật khẩu
          </DialogTitle>
          <DialogDescription>
            Gửi email đặt lại mật khẩu cho người dùng
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Người dùng</Label>
            <Input value={userName} disabled />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Input value={userEmail} disabled />
            </div>
          </div>

          <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
            <p className="text-sm text-muted-foreground">
              Người dùng sẽ nhận được email với link đặt lại mật khẩu. Link có hiệu lực
              trong 1 giờ.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleSendResetEmail} disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Đang gửi...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Gửi email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
