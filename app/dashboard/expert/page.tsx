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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/server";
import {
  Award,
  MessageCircle,
  ArrowRight,
  Clock,
  CheckCircle,
} from "lucide-react";

export default async function ExpertDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 获取专家信息
  const { data: expert } = await supabase
    .from("experts")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!expert || expert.status !== "approved") {
    redirect("/dashboard");
  }

  // 获取待回答的问题（与该专家专业相关且尚未回答的公开问题）
  const { data: pendingQuestions } = await supabase
    .from("questions")
    .select(`
      *,
      profiles:user_id (full_name)
    `)
    .eq("status", "open")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(10);

  // 获取该专家已回答的问题
  const { data: myAnswers } = await supabase
    .from("answers")
    .select(`
      *,
      questions:question_id (*)
    `)
    .eq("expert_id", expert.id)
    .order("created_at", { ascending: false })
    .limit(10);

  // 获取统计数据
  const { count: totalAnswers } = await supabase
    .from("answers")
    .select("*", { count: "exact", head: true })
    .eq("expert_id", expert.id);

  const { count: totalLikes } = await supabase
    .from("answers")
    .select("likes", { count: "exact" })
    .eq("expert_id", expert.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Award className="h-6 w-6" />
          专家中心
        </h1>
        <p className="text-muted-foreground">
          回答问题，分享您的专业经验
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">我的回答</p>
                <p className="text-3xl font-bold">{totalAnswers || 0}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">获得点赞</p>
                <p className="text-3xl font-bold">
                  {myAnswers?.reduce((sum, a) => sum + (a.likes || 0), 0) || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">专家等级</p>
                <p className="text-lg font-bold capitalize">{expert.level || "bronze"}</p>
              </div>
              <Award className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="pending">待回答问题</TabsTrigger>
          <TabsTrigger value="answered">我的回答</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingQuestions && pendingQuestions.length > 0 ? (
            <div className="space-y-4">
              {pendingQuestions.map((question) => (
                <Card key={question.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{question.title}</CardTitle>
                        <CardDescription>
                          提问者: {question.profiles?.full_name || "匿名用户"} · {" "}
                          {new Date(question.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        待回答
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {question.content}
                    </p>
                    <Link href={`/qa/${question.id}`}>
                      <Button>
                        去回答 <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p className="text-muted-foreground">暂无待回答的问题</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="answered" className="mt-6">
          {myAnswers && myAnswers.length > 0 ? (
            <div className="space-y-4">
              {myAnswers.map((answer) => (
                <Card key={answer.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {answer.questions?.title}
                        </CardTitle>
                        <CardDescription>
                          回答于 {new Date(answer.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge variant="default">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        已回答
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {answer.content}
                    </p>
                    <div className="flex items-center gap-4">
                      <Link href={`/qa/${answer.question_id}`}>
                        <Button variant="outline" size="sm">
                          查看详情 <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                      <span className="text-sm text-muted-foreground">
                        {answer.likes || 0} 赞
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">您还没有回答任何问题</p>
                <Link href="/qa" className="mt-4 inline-block">
                  <Button variant="outline">去回答问题</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
