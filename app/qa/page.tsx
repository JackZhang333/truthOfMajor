import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/server";
import { Search, MessageCircle, Plus } from "lucide-react";

interface QuestionListItem {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  status: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  categories: {
    name: string;
  } | null;
  answers: Array<{ count: number }> | null;
}

export const metadata = {
  title: "问答广场 - 专业真相",
  description: "向行业专家提问，获取真实的专业选择建议。",
};

export default async function QAPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const statusFilter = params?.status;
  const searchQuery = params?.search;

  let query = supabase
    .from("questions")
    .select("*, profiles(full_name, avatar_url), answers(count), categories(name)")
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  if (searchQuery) {
    query = query.or(
      `title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`
    );
  }

  const { data: questions } = await query;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">问答广场</h1>
          <p className="text-muted-foreground">
            向行业专家提问，获取真实的专业选择建议
          </p>
        </div>
        <Link href="/qa/ask">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            我要提问
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <form className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            name="search"
            placeholder="搜索问题..."
            defaultValue={searchQuery}
            className="pl-10"
          />
        </form>
        <div className="flex gap-2">
          <Link href="/qa">
            <Badge
              variant={!statusFilter ? "default" : "secondary"}
              className="cursor-pointer px-4 py-2"
            >
              全部
            </Badge>
          </Link>
          <Link href="/qa?status=open">
            <Badge
              variant={statusFilter === "open" ? "default" : "secondary"}
              className="cursor-pointer px-4 py-2"
            >
              待回答
            </Badge>
          </Link>
          <Link href="/qa?status=answered">
            <Badge
              variant={statusFilter === "answered" ? "default" : "secondary"}
              className="cursor-pointer px-4 py-2"
            >
              已回答
            </Badge>
          </Link>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions && questions.length > 0 ? (
          (questions as QuestionListItem[]).map((question) => (
            <Link key={question.id} href={`/qa/${question.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={question.profiles?.avatar_url ?? undefined}
                        alt={question.profiles?.full_name || "匿名用户"}
                      />
                      <AvatarFallback>
                        {question.profiles?.full_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">
                          {question.title}
                        </h3>
                        {question.status === "answered" ? (
                          <Badge variant="default">已回答</Badge>
                        ) : (
                          <Badge variant="secondary">待回答</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground line-clamp-2 mb-3">
                        {question.content}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{question.profiles?.full_name || "匿名用户"}</span>
                        {question.categories?.name && (
                          <Badge variant="outline">
                            {question.categories.name}
                          </Badge>
                        )}
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {question.answers?.[0]?.count || 0} 回答
                        </span>
                        <span>
                          {new Date(question.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">暂无问题</h3>
            <p className="text-muted-foreground mb-4">
              成为第一个提问的人吧
            </p>
            <Link href="/qa/ask">
              <Button>去提问</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
