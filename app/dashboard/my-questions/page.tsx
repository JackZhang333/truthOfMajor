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
  MessageCircle,
  ArrowRight,
  Clock,
  CheckCircle,
  Eye,
} from "lucide-react";

export default async function MyQuestionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 获取我的提问
  const { data: questions } = await supabase
    .from("questions")
    .select(`
      *,
      answers:answers (count)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">我的提问</h1>
          <p className="text-muted-foreground">查看和管理您的问题</p>
        </div>
        <Link href="/qa/ask">
          <Button>
            <MessageCircle className="h-4 w-4 mr-2" />
            去提问
          </Button>
        </Link>
      </div>

      {questions && questions.length > 0 ? (
        <div className="space-y-4">
          {questions.map((question) => (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{question.title}</CardTitle>
                    <CardDescription>
                      提问于 {new Date(question.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      question.status === "answered"
                        ? "default"
                        : question.status === "closed"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {question.status === "open" && (
                      <><Clock className="h-3 w-3 mr-1" /> 待回答</>
                    )}
                    {question.status === "answered" && (
                      <><CheckCircle className="h-3 w-3 mr-1" /> 已回答</>
                    )}
                    {question.status === "closed" && "已关闭"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {question.content}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{question.answers?.[0]?.count || 0} 个回答</span>
                    <span>{question.views || 0} 次浏览</span>
                  </div>
                  <Link href={`/qa/${question.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      查看详情
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">您还没有提过问题</p>
            <Link href="/qa/ask">
              <Button>
                去提问 <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
