"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Heart, Loader2 } from "lucide-react";

interface LikeButtonProps {
  answerId: string;
  initialLikes: number;
}

export function LikeButton({ answerId, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const supabase = createClient();

  // 检查用户是否已点赞
  useEffect(() => {
    const checkLikeStatus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsChecking(false);
        return;
      }

      const { data } = await supabase
        .from("likes")
        .select("id")
        .eq("user_id", user.id)
        .eq("target_type", "answer")
        .eq("target_id", answerId)
        .single();

      setIsLiked(!!data);
      setIsChecking(false);
    };

    checkLikeStatus();
  }, [answerId, supabase]);

  const handleLike = async () => {
    // 乐观更新：先获取当前状态
    const previousLiked = isLiked;
    const previousLikes = likes;

    // 立即更新 UI
    const newLiked = !isLiked;
    const newLikes = newLiked ? likes + 1 : likes - 1;
    setIsLiked(newLiked);
    setLikes(newLikes);
    setIsLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // 未登录，回滚状态
        setIsLiked(previousLiked);
        setLikes(previousLikes);
        alert("请先登录");
        setIsLoading(false);
        return;
      }

      if (previousLiked) {
        // 取消点赞
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("user_id", user.id)
          .eq("target_type", "answer")
          .eq("target_id", answerId);

        if (error) throw error;

        // 更新点赞数
        await supabase
          .from("answers")
          .update({ likes: previousLikes - 1 })
          .eq("id", answerId);
      } else {
        // 添加点赞
        const { error } = await supabase.from("likes").insert({
          user_id: user.id,
          target_type: "answer",
          target_id: answerId,
        });

        if (error) throw error;

        // 更新点赞数
        await supabase
          .from("answers")
          .update({ likes: previousLikes + 1 })
          .eq("id", answerId);
      }
    } catch (error) {
      // 出错时回滚状态
      console.error("点赞失败:", error);
      setIsLiked(previousLiked);
      setLikes(previousLikes);
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Heart className="mr-1 h-4 w-4" />
        {likes}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      disabled={isLoading}
      className={isLiked ? "text-red-500 hover:text-red-600" : ""}
    >
      {isLoading ? (
        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
      ) : (
        <Heart className={`mr-1 h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
      )}
      {likes}
    </Button>
  );
}
