import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import {
  GraduationCap,
  ArrowLeft,
} from "lucide-react";
import { NewMajorForm } from "./new-major-form";

export default async function NewMajorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 检查是否是管理员
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  // 获取所有分类
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/admin/majors">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" /> 返回
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">添加专业</h1>
            <p className="text-muted-foreground">创建新的专业信息</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            专业信息
          </CardTitle>
          <CardDescription>
            填写新专业的详细信息
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewMajorForm categories={categories || []} />
        </CardContent>
      </Card>
    </div>
  );
}
