"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/client";
import { Loader2, ChevronLeft } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

export default function AskQuestionPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });
      setCategories(data || []);
    };
    loadCategories();
  }, []);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("请先登录后再提问，这样你可以收到后续回答和提醒。");
      setLoading(false);
      return;
    }

    const { data, error: submitError } = await supabase
      .from("questions")
      .insert({
        title,
        content,
        user_id: user.id,
        category_id: categoryId || null,
        status: "open",
      })
      .select()
      .single();

    if (submitError) {
      setError(submitError.message);
      setLoading(false);
      return;
    }

    router.push(`/qa/${data.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/qa"
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          返回问答广场
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">提出你的问题</CardTitle>
          <CardDescription>
            把分数段、兴趣、顾虑和想了解的方向写具体一点，专家会更容易给出有用建议。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">
                问题标题 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="例如：女生适合学土木工程吗？就业会不会太辛苦？"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">问题分类</Label>
              <Select value={categoryId} onValueChange={(v) => setCategoryId(v || "")}>
                <SelectTrigger>
                  <SelectValue placeholder="选一个最接近的问题方向" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">
                问题详情 <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="content"
                placeholder="可以补充你的选科、成绩区间、城市偏好、家庭顾虑，以及你最想避免的情况。信息越具体，回答越有针对性。"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                required
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    正在发布问题...
                  </>
                ) : (
                  "发布问题"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/qa")}
              >
                取消
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
