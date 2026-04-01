"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Send } from "lucide-react";

interface AnswerFormProps {
  questionId: string;
  expertId: string;
}

export function AnswerForm({ questionId, expertId }: AnswerFormProps) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!content.trim()) {
      setError("请输入回答内容");
      setIsLoading(false);
      return;
    }

    try {
      // 插入回答
      const { error: insertError } = await supabase.from("answers").insert({
        question_id: questionId,
        expert_id: expertId,
        content: content.trim(),
      });

      if (insertError) throw insertError;

      // 更新问题状态为已回答
      const { error: updateError } = await supabase
        .from("questions")
        .update({ status: "answered" })
        .eq("id", questionId);

      if (updateError) throw updateError;

      // 刷新页面
      router.refresh();
      setContent("");
    } catch (err: any) {
      setError(err.message || "提交失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Textarea
        placeholder="请详细回答用户的问题，分享您的专业知识和经验..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={8}
        disabled={isLoading}
      />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          提示：回答应客观真实，帮助用户做出更好的专业选择
        </p>
        <Button type="submit" disabled={isLoading || !content.trim()}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              提交中...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              提交回答
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
