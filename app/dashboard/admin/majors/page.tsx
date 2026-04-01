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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import {
  GraduationCap,
  ArrowLeft,
  Plus,
  Edit,
  Eye,
} from "lucide-react";

export default async function AdminMajorsPage() {
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

  // 获取所有专业
  const { data: majors } = await supabase
    .from("majors")
    .select(`
      *,
      categories (*)
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" /> 返回
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">专业管理</h1>
            <p className="text-muted-foreground">管理平台专业信息</p>
          </div>
        </div>
        <Link href="/dashboard/admin/majors/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            添加专业
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            专业列表
          </CardTitle>
          <CardDescription>
            共 {majors?.length || 0} 个专业
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>专业名称</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>浏览量</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {majors && majors.length > 0 ? (
                majors.map((major) => (
                  <TableRow key={major.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{major.name}</p>
                        {major.code && (
                          <p className="text-sm text-muted-foreground">代码: {major.code}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {major.categories?.name || "未分类"}
                    </TableCell>
                    <TableCell>
                      {major.status === "published" ? (
                        <Badge variant="default">已发布</Badge>
                      ) : major.status === "reviewing" ? (
                        <Badge variant="secondary">审核中</Badge>
                      ) : (
                        <Badge variant="outline">草稿</Badge>
                      )}
                    </TableCell>
                    <TableCell>{major.views || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/majors/${major.slug}`} target="_blank">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/dashboard/admin/majors/${major.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    暂无专业数据
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
