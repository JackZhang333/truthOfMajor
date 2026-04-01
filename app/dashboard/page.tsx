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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import {
  MessageCircle,
  Award,
  TrendingUp,
  Clock,
  ArrowRight,
  Shield,
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 获取用户信息
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // 获取专家信息
  const { data: expert } = await supabase
    .from("experts")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // 获取我的提问数量
  const { count: questionCount } = await supabase
    .from("questions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  // 获取我的回答数量（如果是专家）
  const { count: answerCount } = await supabase
    .from("answers")
    .select("*", { count: "exact", head: true })
    .eq("expert_id", expert?.id);

  const isAdmin = profile?.role === "admin";
  const isExpert = expert?.status === "approved";

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.full_name ?? user.email} />
              <AvatarFallback className="text-xl">
                {profile?.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">
                欢迎回来，{profile?.full_name || "用户"}
              </h1>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex gap-2 mt-2">
                {isAdmin && (
                  <Badge variant="destructive">
                    <Shield className="mr-1 h-3 w-3" />
                    管理员
                  </Badge>
                )}
                {isExpert && (
                  <Badge variant="default">
                    <Award className="mr-1 h-3 w-3" />
                    认证专家
                  </Badge>
                )}
                {expert?.status === "pending" && (
                  <Badge variant="secondary">专家申请审核中</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">我的提问</p>
                <p className="text-3xl font-bold">{questionCount || 0}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        {isExpert && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">我的回答</p>
                  <p className="text-3xl font-bold">{answerCount || 0}</p>
                </div>
                <Award className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">注册时间</p>
                <p className="text-lg font-bold">
                  {new Date(profile?.created_at).toLocaleDateString()}
                </p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              快速提问
            </CardTitle>
            <CardDescription>
              有专业选择方面的困惑？向专家提问获取帮助
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/qa/ask">
              <Button className="w-full">
                去提问 <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {!isExpert && !expert && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                成为专家
              </CardTitle>
              <CardDescription>
                分享您的专业经历，帮助学弟学妹做出更好的选择
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/become-expert">
                <Button className="w-full" variant="outline">
                  申请入驻 <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {isExpert && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                待回答问题
              </CardTitle>
              <CardDescription>查看等待您回答的问题</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/expert">
                <Button className="w-full" variant="outline">
                  去回答 <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                管理后台
              </CardTitle>
              <CardDescription>管理用户、专家和平台内容</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/admin">
                <Button className="w-full" variant="outline">
                  进入管理后台 <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
