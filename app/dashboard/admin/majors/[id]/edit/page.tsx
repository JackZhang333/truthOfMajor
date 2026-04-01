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
import { createClient } from "@/lib/supabase/server";
import {
  GraduationCap,
  ArrowLeft,
  Save,
} from "lucide-react";
import { MajorForm } from "./major-form";

interface EditMajorPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMajorPage({ params }: EditMajorPageProps) {
  const { id } = await params;

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

  // 获取专业信息
  const { data: major } = await supabase
    .from("majors")
    .select(`
      *,
      categories (*)
    `)
    .eq("id", id)
    .single();

  if (!major) {
    redirect("/dashboard/admin/majors");
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
            <h1 className="text-2xl font-bold">编辑专业</h1>
            <p className="text-muted-foreground">编辑 {major.name} 的信息</p>
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
            编辑专业的详细信息
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MajorForm major={major} categories={categories || []} />
        </CardContent>
      </Card>
    </div>
  );
}
