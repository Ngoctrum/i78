import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Shield, ShieldOff, Ban, CheckCircle, Search, Eye, KeyRound, Users as UsersIcon, Filter } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { UserDetailDialog } from "@/components/admin/UserDetailDialog";
import { ResetPasswordDialog } from "@/components/admin/ResetPasswordDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Users = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<Record<string, string>>({});
  const [bannedUsers, setBannedUsers] = useState<Set<string>>(new Set());
  const [banReason, setBanReason] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Dialog states
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, roleFilter, statusFilter]);

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

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.full_name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => roles[user.id] === roleFilter);
    }

    // Status filter
    if (statusFilter === "banned") {
      filtered = filtered.filter((user) => bannedUsers.has(user.id));
    } else if (statusFilter === "active") {
      filtered = filtered.filter((user) => !bannedUsers.has(user.id));
    }

    setFilteredUsers(filtered);
  };

  const openDetailDialog = (user: any) => {
    setSelectedUser({
      id: user.id,
      name: user.full_name,
      email: user.email,
    });
    setShowDetailDialog(true);
  };

  const openResetDialog = (user: any) => {
    setSelectedUser({
      id: user.id,
      name: user.full_name,
      email: user.email,
    });
    setShowResetDialog(true);
  };

  if (loading) return <div className="container py-12">Đang tải...</div>;

  return (
    <div className="container py-12">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UsersIcon className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">Quản lý người dùng</CardTitle>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {filteredUsers.length} người dùng
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Search & Filters */}
          <div className="space-y-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-3 items-center flex-wrap">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Vai trò" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="all">Tất cả vai trò</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="banned">Đã cấm</SelectItem>
                </SelectContent>
              </Select>

              {(searchQuery || roleFilter !== "all" || statusFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setRoleFilter("all");
                    setStatusFilter("all");
                  }}
                >
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          </div>

          {/* Users List */}
          <div className="space-y-3">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <UsersIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Không tìm thấy người dùng nào</p>
              </div>
            ) : (
              filteredUsers.map((user) => {
              const isBanned = bannedUsers.has(user.id);
              const isAdmin = roles[user.id] === "admin";

                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-all duration-200 animate-fade-in bg-gradient-to-r from-background to-muted/20"
                  >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold">{user.full_name}</p>
                      {isAdmin && <Badge variant="default">Admin</Badge>}
                      {isBanned && <Badge variant="destructive">Đã cấm</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDetailDialog(user)}
                      className="hover:bg-accent/10"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Chi tiết
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openResetDialog(user)}
                      className="hover:bg-warning-yellow/10"
                    >
                      <KeyRound className="h-4 w-4 mr-2" />
                      Đặt lại MK
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleRole(user.id, roles[user.id] || "user")}
                      className="hover:bg-primary/10"
                    >
                      {isAdmin ? (
                        <>
                          <ShieldOff className="h-4 w-4 mr-2" />
                          Hạ User
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 mr-2" />
                          Nâng Admin
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
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      {selectedUser && (
        <>
          <UserDetailDialog
            userId={selectedUser.id}
            userName={selectedUser.name}
            userEmail={selectedUser.email}
            isOpen={showDetailDialog}
            onClose={() => {
              setShowDetailDialog(false);
              setSelectedUser(null);
            }}
          />

          <ResetPasswordDialog
            userEmail={selectedUser.email}
            userName={selectedUser.name}
            isOpen={showResetDialog}
            onClose={() => {
              setShowResetDialog(false);
              setSelectedUser(null);
            }}
          />
        </>
      )}
    </div>
  );
};

export default Users;
