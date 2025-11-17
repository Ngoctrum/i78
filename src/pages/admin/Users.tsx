import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Shield, ShieldOff, Ban, CheckCircle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

const Users = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<Record<string, string>>({});
  const [bannedUsers, setBannedUsers] = useState<Set<string>>(new Set());
  const [banReason, setBanReason] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: profiles } = await supabase.from("profiles").select("*");
      const { data: userRoles } = await supabase.from("user_roles").select("*");
      const { data: banned } = await supabase.from("banned_users").select("user_id");

      if (profiles) setUsers(profiles);
      
      if (userRoles) {
        const rolesMap: Record<string, string> = {};
        userRoles.forEach((ur) => {
          rolesMap[ur.user_id] = ur.role;
        });
        setRoles(rolesMap);
      }

      if (banned) {
        setBannedUsers(new Set(banned.map((b) => b.user_id)));
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);

      if (error) throw error;
      setRoles({ ...roles, [userId]: newRole });
      toast.success(`Đã ${newRole === "admin" ? "nâng" : "hạ"} quyền thành công`);
    } catch (error: any) {
      toast.error(error.message || "Thay đổi quyền thất bại");
    }
  };

  const banUser = async (userId: string) => {
    if (!banReason.trim()) {
      toast.error("Vui lòng nhập lý do cấm");
      return;
    }

    try {
      const { error } = await supabase.from("banned_users").insert({
        user_id: userId,
        reason: banReason,
      });

      if (error) throw error;
      setBannedUsers(new Set([...bannedUsers, userId]));
      setBanReason("");
      toast.success("Đã cấm người dùng");
    } catch (error: any) {
      toast.error(error.message || "Cấm thất bại");
    }
  };

  const unbanUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("banned_users")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;
      const newBanned = new Set(bannedUsers);
      newBanned.delete(userId);
      setBannedUsers(newBanned);
      toast.success("Đã bỏ cấm người dùng");
    } catch (error: any) {
      toast.error(error.message || "Bỏ cấm thất bại");
    }
  };

  if (loading) return <div className="container py-12">Đang tải...</div>;

  return (
    <div className="container py-12">
      <Card>
        <CardHeader>
          <CardTitle>Quản lý người dùng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((user) => {
              const isBanned = bannedUsers.has(user.id);
              const isAdmin = roles[user.id] === "admin";

              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold">{user.full_name}</p>
                      {isAdmin && <Badge variant="default">Admin</Badge>}
                      {isBanned && <Badge variant="destructive">Đã cấm</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleRole(user.id, roles[user.id] || "user")}
                    >
                      {isAdmin ? (
                        <>
                          <ShieldOff className="h-4 w-4 mr-2" />
                          Hạ xuống User
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 mr-2" />
                          Nâng lên Admin
                        </>
                      )}
                    </Button>

                    {isBanned ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => unbanUser(user.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Bỏ cấm
                      </Button>
                    ) : (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Ban className="h-4 w-4 mr-2" />
                            Cấm
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cấm người dùng</AlertDialogTitle>
                            <AlertDialogDescription>
                              Nhập lý do cấm người dùng {user.full_name}:
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <Textarea
                            value={banReason}
                            onChange={(e) => setBanReason(e.target.value)}
                            placeholder="Vi phạm chính sách..."
                            rows={3}
                          />
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction onClick={() => banUser(user.id)}>
                              Cấm
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;
