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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/server";
import {
  Users,
  Award,
  MessageCircle,
  GraduationCap,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default async function AdminPage() {
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

  // 获取统计数据
  const { count: userCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: expertCount } = await supabase
    .from("experts")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved");

  const { count: pendingExpertCount } = await supabase
    .from("experts")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const { count: questionCount } = await supabase
    .from("questions")
    .select("*", { count: "exact", head: true });

  const { count: majorCount } = await supabase
    .from("majors")
    .select("*", { count: "exact", head: true });

  // 获取待审核的专家申请
  const { data: pendingExperts } = await supabase
    .from("experts")
    .select(`
      *,
      profiles:user_id (full_name, email)
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">管理后台</h1>
        <p className="text-muted-foreground">
          管理用户、专家和平台内容
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">总用户数</p>
                <p className="text-3xl font-bold">{userCount || 0}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">认证专家</p>
                <p className="text-3xl font-bold">{expertCount || 0}</p>
              </div>
              <Award className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">问题总数</p>
                <p className="text-3xl font-bold">{questionCount || 0}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">专业数量</p>
                <p className="text-3xl font-bold">{majorCount || 0}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Expert Applications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              待审核专家申请
              {pendingExpertCount > 0 && (
                <Badge variant="destructive">{pendingExpertCount}</Badge>
              )}
            </CardTitle>
            <CardDescription>
              审核新提交的专家入驻申请
            </CardDescription>
          </div>
          <Link href="/dashboard/admin/experts">
            <Button variant="outline" size="sm">
              查看全部 <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {pendingExperts && pendingExperts.length > 0 ? (
            <div className="space-y-4">
              {pendingExperts.map((expert) => (
                <div
                  key={expert.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {expert.profiles?.full_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {expert.profiles?.full_name || "未知用户"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {expert.current_company} · {expert.position}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        毕业于 {expert.university} {expert.major}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {new Date(expert.created_at).toLocaleDateString()} 申请
                    </span>
                    <Badge variant="secondary">待审核</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>暂无待审核的申请</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              用户管理
            </CardTitle>
            <CardDescription>管理平台用户，设置管理员权限</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/admin/users">
              <Button className="w-full" variant="outline">
                管理用户 <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              专家管理
            </CardTitle>
            <CardDescription>审核专家申请，管理专家信息</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/admin/experts">
              <Button className="w-full" variant="outline">
                管理专家 <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              专业管理
            </CardTitle>
            <CardDescription>管理专业信息，编辑专业内容</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/admin/majors">
              <Button className="w-full" variant="outline">
                管理专业 <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
