import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  GraduationCap,
  MessageCircle,
  Users,
  ArrowRight,
  CheckCircle2,
  Brain,
  TrendingUp,
  Scale,
  BookOpen,
  Cpu,
  Heart,
  Briefcase,
  Clock,
  Atom,
  Leaf,
  Palette,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Input } from "@/components/ui/input";

interface HomeQuestion {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  answers: Array<{ count: number }> | null;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Brain,
  TrendingUp,
  Scale,
  BookOpen,
  Clock,
  Atom,
  Cpu,
  Leaf,
  Heart,
  Briefcase,
  Palette,
};

export default async function HomePage() {
  const supabase = await createClient();

  // 获取专业分类
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  // 获取热门专业
  const { data: majors } = await supabase
    .from("majors")
    .select("*, categories(name)")
    .eq("status", "published")
    .order("views", { ascending: false })
    .limit(6);

  // 获取最新问答
  const { data: questions } = await supabase
    .from("questions")
    .select("*, profiles(full_name, avatar_url), answers(count)")
    .eq("is_public", true)
    .eq("status", "answered")
    .order("created_at", { ascending: false })
    .limit(4);

  // 获取专家数量统计
  const { count: expertCount } = await supabase
    .from("experts")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved");

  // 获取专业数量
  const { count: majorCount } = await supabase
    .from("majors")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");

  // 获取问答数量
  const { count: questionCount } = await supabase
    .from("questions")
    .select("*", { count: "exact", head: true });

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              免费公益平台
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              高考选专业
              <br />
              <span className="text-primary">先看真相</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
              连接高考学生与各行业专家，获取真实、客观的专业信息。
              <br className="hidden sm:block" />
              完全免费，无利益冲突，帮助你做出更好的专业选择。
            </p>

            {/* Search Bar */}
            <div className="relative w-full max-w-lg mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="搜索专业、职业方向..."
                className="pl-12 pr-4 py-6 text-lg rounded-full shadow-lg"
              />
              <Button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full" size="sm">
                搜索
              </Button>
            </div>

            {/* Features */}
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>完全免费</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>真实客观</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>多元视角</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>无利益冲突</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">专业分类</h2>
            <Link href="/majors">
              <Button variant="ghost" size="sm">
                查看全部 <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories?.map((category) => {
              const IconComponent = iconMap[category.icon] || GraduationCap;
              return (
                <Link key={category.id} href={`/majors/category/${category.slug}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold">{category.name}</h3>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Majors Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">热门专业</h2>
              <p className="text-muted-foreground mt-1">最受关注的大学专业</p>
            </div>
            <Link href="/majors">
              <Button variant="ghost" size="sm">
                查看全部 <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {majors?.map((major) => (
              <Link key={major.id} href={`/majors/${major.slug}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{major.categories?.name}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {major.views} 浏览
                      </span>
                    </div>
                    <CardTitle className="mt-2">{major.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {major.description}
                    </p>
                    {major.degree_type && (
                      <Badge variant="outline" className="mt-3">
                        {major.degree_type}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Q&A Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">最新问答</h2>
              <p className="text-muted-foreground mt-1">专家正在回答的热门问题</p>
            </div>
            <div className="flex gap-2">
              <Link href="/qa">
                <Button variant="ghost" size="sm">
                  查看全部 <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(questions as HomeQuestion[] | null)?.map((question) => (
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
                        <h3 className="font-semibold line-clamp-2 mb-2">
                          {question.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {question.content}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{question.profiles?.full_name || "匿名用户"}</span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {question.answers?.[0]?.count || 0} 回答
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/qa/ask">
              <Button size="lg">
                <MessageCircle className="mr-2 h-4 w-4" />
                我要提问
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Become Expert CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-2xl p-8 md:p-12 text-primary-foreground">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold mb-4">你是过来人？</h2>
                <p className="text-primary-foreground/80 text-lg max-w-xl">
                  分享你的专业经历，帮助学弟学妹做出更好的选择。
                  成为专家，建立个人品牌，收获成就感。
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/become-expert">
                  <Button variant="secondary" size="lg">
                    <Users className="mr-2 h-4 w-4" />
                    成为专家
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">
                {majorCount || 0}+
              </div>
              <div className="text-muted-foreground">专业覆盖</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">
                {expertCount || 0}+
              </div>
              <div className="text-muted-foreground">认证专家</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">
                {questionCount || 0}+
              </div>
              <div className="text-muted-foreground">问题解答</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">100%</div>
              <div className="text-muted-foreground">免费服务</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
