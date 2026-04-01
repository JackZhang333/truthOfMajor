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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/server";
import {
  Award,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  GraduationCap,
  Briefcase,
  Calendar,
} from "lucide-react";
import { ExpertActions } from "./expert-actions";

export default async function AdminExpertsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const status = params.status || "pending";

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

  // 获取专家申请列表
  const { data: experts } = await supabase
    .from("experts")
    .select(`
      *,
      profiles:user_id (full_name, email)
    `)
    .eq("status", status)
    .order("created_at", { ascending: false });

  // 获取各状态的数量
  const { count: pendingCount } = await supabase
    .from("experts")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const { count: approvedCount } = await supabase
    .from("experts")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved");

  const { count: rejectedCount } = await supabase
    .from("experts")
    .select("*", { count: "exact", head: true })
    .eq("status", "rejected");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/admin">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" /> 返回
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">专家管理</h1>
          <p className="text-muted-foreground">审核和管理专家申请</p>
        </div>
      </div>

      <Tabs defaultValue={status} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <Link href="/dashboard/admin/experts?status=pending">
            <TabsTrigger value="pending" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              待审核 ({pendingCount || 0})
            </TabsTrigger>
          </Link>
          <Link href="/dashboard/admin/experts?status=approved">
            <TabsTrigger value="approved" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              已通过 ({approvedCount || 0})
            </TabsTrigger>
          </Link>
          <Link href="/dashboard/admin/experts?status=rejected">
            <TabsTrigger value="rejected" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              已拒绝 ({rejectedCount || 0})
            </TabsTrigger>
          </Link>
        </TabsList>

        <TabsContent value={status} className="mt-6">
          {experts && experts.length > 0 ? (
            <div className="space-y-4">
              {experts.map((expert) => (
                <Card key={expert.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="text-lg">
                            {expert.profiles?.full_name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle>{expert.profiles?.full_name || "未知用户"}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            {expert.profiles?.email}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant={
                          expert.status === "approved"
                            ? "default"
                            : expert.status === "rejected"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {expert.status === "approved" && (
                          <><CheckCircle className="h-3 w-3 mr-1" /> 已通过</>
                        )}
                        {expert.status === "rejected" && (
                          <><XCircle className="h-3 w-3 mr-1" /> 已拒绝</>
                        )}
                        {expert.status === "pending" && (
                          <><Clock className="h-3 w-3 mr-1" /> 待审核</>
                        )}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          工作经历
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {expert.current_company} · {expert.position}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          工作年限：{expert.work_years} 年
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          教育背景
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {expert.university}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {expert.major} · {expert.education}
                        </p>
                      </div>
                    </div>

                    {expert.bio && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">个人简介</p>
                        <p className="text-sm text-muted-foreground">{expert.bio}</p>
                      </div>
                    )}

                    {expert.certifications && expert.certifications.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">资质证书</p>
                        <div className="flex flex-wrap gap-2">
                          {expert.certifications.map((cert: string, index: number) => (
                            <Badge key={index} variant="outline">{cert}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        申请时间：{new Date(expert.created_at).toLocaleString()}
                      </p>

                      {expert.status === "pending" && (
                        <ExpertActions expertId={expert.id} />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">暂无{status === "pending" ? "待审核" : status === "approved" ? "已通过" : "已拒绝"}的专家申请</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
