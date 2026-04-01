import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/server";
import { Search, Users, Award, MessageCircle, Medal } from "lucide-react";

export const metadata = {
  title: "专家团队 - 专业真相",
  description: "来自各行各业的专家，为你提供真实的专业建议。",
};

export default async function ExpertsPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string; search?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const levelFilter = params?.level;
  const searchQuery = params?.search;

  let query = supabase
    .from("experts")
    .select("*, profiles(avatar_url)")
    .eq("status", "approved")
    .order("answer_count", { ascending: false });

  if (levelFilter) {
    query = query.eq("level", levelFilter);
  }

  if (searchQuery) {
    query = query.or(
      `nickname.ilike.%${searchQuery}%,current_company.ilike.%${searchQuery}%,position.ilike.%${searchQuery}%`
    );
  }

  const { data: experts } = await query;

  const levelFilters = [
    { value: "diamond", label: "钻石专家", icon: Medal },
    { value: "gold", label: "金牌专家", icon: Award },
    { value: "silver", label: "银牌专家", icon: Award },
    { value: "bronze", label: "铜牌专家", icon: Award },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">专家团队</h1>
          <p className="text-muted-foreground">
            来自各行各业的专家，为你提供真实的专业建议
          </p>
        </div>
        <Link href="/become-expert">
          <Button>
            <Users className="mr-2 h-4 w-4" />
            成为专家
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <form className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            name="search"
            placeholder="搜索专家..."
            defaultValue={searchQuery}
            className="pl-10"
          />
        </form>
        <div className="flex gap-2 flex-wrap">
          <Link href="/experts">
            <Badge
              variant={!levelFilter ? "default" : "secondary"}
              className="cursor-pointer px-4 py-2"
            >
              全部
            </Badge>
          </Link>
          {levelFilters.map((filter) => (
            <Link key={filter.value} href={`/experts?level=${filter.value}`}>
              <Badge
                variant={levelFilter === filter.value ? "default" : "secondary"}
                className="cursor-pointer px-4 py-2"
              >
                <filter.icon className="mr-1 h-3 w-3" />
                {filter.label}
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      {/* Experts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {experts && experts.length > 0 ? (
          experts.map((expert) => (
            <Link key={expert.id} href={`/experts/${expert.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        src={expert.profiles?.avatar_url ?? undefined}
                        alt={expert.nickname || "专家"}
                      />
                      <AvatarFallback className="text-xl">
                        {expert.nickname?.charAt(0) || "专"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{expert.nickname}</h3>
                        <ExpertLevelBadge level={expert.level} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {expert.position} @ {expert.current_company}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {expert.bio}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {expert.answer_count} 回答
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {expert.helpful_count} 有用
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">暂无专家</h3>
            <p className="text-muted-foreground mb-4">
              该分类下暂时还没有专家
            </p>
            <Link href="/become-expert">
              <Button>成为第一个专家</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function ExpertLevelBadge({ level }: { level: string }) {
  const variants: Record<string, string> = {
    bronze: "bg-amber-700",
    silver: "bg-slate-400",
    gold: "bg-yellow-500",
    diamond: "bg-blue-500",
  };

  const labels: Record<string, string> = {
    bronze: "铜牌",
    silver: "银牌",
    gold: "金牌",
    diamond: "钻石",
  };

  return (
    <Badge className={variants[level] || variants.bronze}>
      {labels[level] || "铜牌"}
    </Badge>
  );
}
