"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface ExpertActionsProps {
  expertId: string;
}

export function ExpertActions({ expertId }: ExpertActionsProps) {
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("experts")
        .update({ status: "approved" })
        .eq("id", expertId);

      if (error) throw error;

      // 同时更新用户角色为 expert
      const { data: expert } = await supabase
        .from("experts")
        .select("user_id")
        .eq("id", expertId)
        .single();

      if (expert) {
        await supabase
          .from("profiles")
          .update({ role: "expert" })
          .eq("id", expert.user_id);
      }

      router.refresh();
      setIsApproveOpen(false);
    } catch (error) {
      console.error("审核失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("experts")
        .update({ status: "rejected" })
        .eq("id", expertId);

      if (error) throw error;

      router.refresh();
      setIsRejectOpen(false);
    } catch (error) {
      console.error("拒绝失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="text-green-600 hover:bg-green-50"
          onClick={() => setIsApproveOpen(true)}
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          通过
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-red-600 hover:bg-red-50"
          onClick={() => setIsRejectOpen(true)}
        >
          <XCircle className="h-4 w-4 mr-1" />
          拒绝
        </Button>
      </div>

      {/* Approve Dialog */}
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认通过专家申请？</DialogTitle>
            <DialogDescription>
              通过申请后，该用户将成为平台认证专家，可以回答问题和分享专业经验。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  处理中...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  确认通过
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>拒绝专家申请</DialogTitle>
            <DialogDescription>
              请填写拒绝原因（可选），用户将收到通知。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="拒绝原因..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleReject}
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
                  <XCircle className="h-4 w-4 mr-2" />
                  确认拒绝
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
