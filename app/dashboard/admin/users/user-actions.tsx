"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoreHorizontal, Shield, User, Award, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface UserActionsProps {
  userId: string;
  currentRole: string;
}

export function UserActions({ userId, currentRole }: UserActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRoleChange = async (role: string) => {
    if (role === "admin") {
      setIsAdminDialogOpen(true);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", userId);

      if (error) throw error;

      router.refresh();
    } catch (error) {
      console.error("修改角色失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetAdmin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", userId);

      if (error) throw error;

      router.refresh();
      setIsAdminDialogOpen(false);
    } catch (error) {
      console.error("设置管理员失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="sm" />}>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => handleRoleChange("user")}
            disabled={currentRole === "user" || isLoading}
          >
            <User className="h-4 w-4 mr-2" />
            设为普通用户
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleRoleChange("expert")}
            disabled={currentRole === "expert" || isLoading}
          >
            <Award className="h-4 w-4 mr-2" />
            设为专家
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleRoleChange("admin")}
            disabled={currentRole === "admin" || isLoading}
            className="text-destructive"
          >
            <Shield className="h-4 w-4 mr-2" />
            设为管理员
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认设置管理员？</DialogTitle>
            <DialogDescription>
              管理员拥有平台的最高权限，可以管理用户、专家和内容。请确认此操作。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdminDialogOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleSetAdmin}
              disabled={isLoading}
              variant="destructive"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  处理中...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  确认设置
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
