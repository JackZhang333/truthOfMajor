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
import { createClient } from "@/lib/supabase/server";
import {
  Award,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Calendar,
} from "lucide-react";

export default async function BecomeExpertStatusPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 获取专家申请信息
  const { data: expert } = await supabase
    .from("experts")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // 如果已经是认证专家，跳转到专家中心
  if (expert?.status === "approved") {
    redirect("/dashboard/expert");
  }

  // 如果没有申请，引导去申请页面
  if (!expert) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">成为专家</h1>
          <p className="text-muted-foreground">分享您的专业经历，帮助学弟学妹</p>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <Award className="h-16 w-16 mx-auto mb-6 text-primary" />
            <h2 className="text-xl font-semibold mb-2">申请成为专家</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              作为专家，您可以回答学生关于专业选择的问题，分享您的学习和工作经历，帮助他们做出更明智的决定。
            </p>
            <Link href="/become-expert">
              <Button size="lg">
                开始申请 <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 显示申请状态
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">专家申请状态</h1>
        <p className="text-muted-foreground">查看您的专家申请进度</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {expert.status === "pending" && (
                  <>
                    <Clock className="h-5 w-5 text-yellow-500" />
                    审核中
                  </>
                )}
                {expert.status === "rejected" && (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    申请被拒绝
                  </>
                )}
              </CardTitle>
              <CardDescription>
                提交时间：{new Date(expert.created_at).toLocaleString()}
              </CardDescription>
            </div>
            <Badge
              variant={
                expert.status === "pending"
                  ? "secondary"
                  : expert.status === "approved"
                  ? "default"
                  : "destructive"
              }
            >
              {expert.status === "pending" && "审核中"}
              {expert.status === "approved" && "已通过"}
              {expert.status === "rejected" && "已拒绝"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {expert.status === "pending" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <Clock className="h-4 w-4 inline mr-2" />
                您的申请正在审核中，请耐心等待。管理员通常会在 1-3 个工作日内完成审核。
              </p>
            </div>
          )}

          {expert.status === "rejected" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <XCircle className="h-4 w-4 inline mr-2" />
                很遗憾，您的申请未通过审核。您可以完善信息后重新申请。
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <p className="text-sm text-muted-foreground">{expert.university}</p>
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
        </CardContent>
      </Card>
    </div>
  );
}
