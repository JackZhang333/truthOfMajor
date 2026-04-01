import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/server";
import {
  ChevronLeft,
  MessageCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { AnswerForm } from "./answer-form";
import { LikeButton } from "./like-button";

interface AnswerWithDetails {
  id: string;
  content: string;
  created_at: string;
  is_featured: boolean;
  likes: number | null;
  experts: {
    nickname: string | null;
    current_company: string | null;
    position: string | null;
    level: string | null;
  } | null;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface QuestionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function QuestionDetailPage({
  params,
}: QuestionDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // 获取当前用户
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 获取问题详情
  const { data: question } = await supabase
    .from("questions")
    .select("*, profiles(full_name, avatar_url), categories(name)")
    .eq("id", id)
    .eq("is_public", true)
    .single();

  if (!question) {
    notFound();
  }

  // 获取回答
  const { data: answers } = await supabase
    .from("answers")
    .select("*")
    .eq("question_id", id)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: true });

  // 获取回答相关的专家和用户信息
  const answersWithDetails = await Promise.all(
    (answers || []).map(async (answer) => {
      // 获取专家信息
      const { data: expert } = await supabase
        .from("experts")
        .select("nickname, current_company, position, level, user_id")
        .eq("id", answer.expert_id)
        .eq("status", "approved")
        .single();

      // 获取用户信息
      let profile = null;
      if (expert?.user_id) {
        const { data: p } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", expert.user_id)
          .single();
        profile = p;
      }

      return {
        ...answer,
        experts: expert || null,
        profiles: profile,
      };
    })
  );

  // 检查当前用户是否是认证专家
  let isExpert = false;
  let expertId: string | null = null;
  let hasAnswered = false;

  if (user) {
    const { data: expert } = await supabase
      .from("experts")
      .select("id, status")
      .eq("user_id", user.id)
      .single();

    if (expert?.status === "approved") {
      isExpert = true;
      expertId = expert.id;

      // 检查是否已经回答过这个问题
      const { data: existingAnswer } = await supabase
        .from("answers")
        .select("id")
        .eq("question_id", id)
        .eq("expert_id", expert.id)
        .single();

      hasAnswered = !!existingAnswer;
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
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

      {/* Question */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={question.profiles?.avatar_url ?? undefined}
                alt={question.profiles?.full_name || "匿名用户"}
              />
              <AvatarFallback>
                {question.profiles?.full_name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold">{question.title}</h1>
                {question.status === "answered" ? (
                  <Badge variant="default">已回答</Badge>
                ) : (
                  <Badge variant="secondary">待回答</Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span>{question.profiles?.full_name || "匿名用户"}</span>
                {question.categories?.name && (
                  <Badge variant="outline">{question.categories.name}</Badge>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(question.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-muted-foreground whitespace-pre-line">
                {question.content}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Answers */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            {answers?.length || 0} 个回答
          </h2>
        </div>

        {answersWithDetails && answersWithDetails.length > 0 ? (
          (answersWithDetails as AnswerWithDetails[]).map((answer) => (
            <Card
              key={answer.id}
              className={answer.is_featured ? "border-primary" : ""}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={answer.profiles?.avatar_url ?? undefined}
                      alt={
                        answer.experts?.nickname ||
                        answer.profiles?.full_name ||
                        "专家"
                      }
                    />
                    <AvatarFallback>
                      {answer.experts?.nickname?.charAt(0) ||
                        answer.profiles?.full_name?.charAt(0) ||
                        "专"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {answer.experts?.nickname ||
                          answer.profiles?.full_name ||
                          "专家"}
                      </span>
                      {answer.experts && (
                        <Badge variant="secondary">
                          {answer.experts.level === "bronze" && "铜牌专家"}
                          {answer.experts.level === "silver" && "银牌专家"}
                          {answer.experts.level === "gold" && "金牌专家"}
                          {answer.experts.level === "diamond" && "钻石专家"}
                        </Badge>
                      )}
                      {answer.is_featured && (
                        <Badge variant="default" className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          精选回答
                        </Badge>
                      )}
                    </div>
                    {answer.experts && (
                      <p className="text-sm text-muted-foreground">
                        {answer.experts.position} @ {answer.experts.current_company}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-muted-foreground">
                  {answer.content}
                </p>
                <div className="flex items-center gap-4 mt-6">
                  <LikeButton answerId={answer.id} initialLikes={answer.likes || 0} />
                  <span className="text-sm text-muted-foreground">
                    {new Date(answer.created_at).toLocaleDateString()} 回答
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">暂无回答</h3>
              <p className="text-muted-foreground">
                这个问题还没有专家回答，稍后再来看看吧
              </p>
            </CardContent>
          </Card>
        )}

        {/* Expert Answer Form */}
        {isExpert && !hasAnswered && (
          <Card className="border-primary">
            <CardHeader>
              <h3 className="text-lg font-semibold">作为专家回答</h3>
              <p className="text-sm text-muted-foreground">
                分享您的专业知识和经验，帮助提问者做出更好的选择
              </p>
            </CardHeader>
            <CardContent>
              <AnswerForm questionId={id} expertId={expertId!} />
            </CardContent>
          </Card>
        )}

        {isExpert && hasAnswered && (
          <Card className="bg-muted">
            <CardContent className="p-6 text-center">
              <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-muted-foreground">您已经回答过这个问题了</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
