"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { createClient } from "@/lib/supabase/client";
import { Save, Loader2 } from "lucide-react";

interface NewMajorFormProps {
  categories: Array<{
    id: string;
    name: string;
  }>;
}

export function NewMajorForm({ categories }: NewMajorFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    category_id: "",
    degree_type: "",
    duration: 4,
    description: "",
    career_prospects: "",
    status: "draft",
    slug: "",
  });
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

      const { error } = await supabase
        .from("majors")
        .insert({
          name: formData.name,
          code: formData.code || null,
          category_id: formData.category_id || null,
          degree_type: formData.degree_type || null,
          duration: formData.duration,
          description: formData.description || null,
          career_prospects: formData.career_prospects || null,
          status: formData.status,
          slug: slug,
        });

      if (error) throw error;

      router.push("/dashboard/admin/majors");
      router.refresh();
    } catch (error) {
      console.error("创建专业失败:", error);
      alert("创建失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">专业名称 *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="请输入专业名称"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">专业代码</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="请输入专业代码"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">URL 标识</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="用于 URL 的唯一标识，留空将自动生成"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">分类</Label>
          <Select
            value={formData.category_id}
            onValueChange={(value) =>
              setFormData({ ...formData, category_id: value ?? "" })
            }
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="选择分类">
                {categories.find(c => c.id === formData.category_id)?.name || "选择分类"}
              </SelectValue>
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
          <Label htmlFor="degree_type">学位类型</Label>
          <Select
            value={formData.degree_type}
            onValueChange={(value) =>
              setFormData({ ...formData, degree_type: value ?? "" })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="选择学位类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="学士">学士</SelectItem>
              <SelectItem value="硕士">硕士</SelectItem>
              <SelectItem value="博士">博士</SelectItem>
              <SelectItem value="专科">专科</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">学制（年）</Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 4 })}
            min={1}
            max={10}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">状态 *</Label>
          <Select
            value={formData.status}
            onValueChange={(value) =>
              setFormData({ ...formData, status: value ?? "draft" })
            }
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="选择状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">草稿</SelectItem>
              <SelectItem value="reviewing">审核中</SelectItem>
              <SelectItem value="published">已发布</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">专业描述</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="请输入专业描述"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="career_prospects">就业前景</Label>
        <Textarea
          id="career_prospects"
          value={formData.career_prospects}
          onChange={(e) => setFormData({ ...formData, career_prospects: e.target.value })}
          placeholder="请输入就业前景"
          rows={4}
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/admin/majors")}
          disabled={isLoading}
        >
          取消
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              创建中...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              创建
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
