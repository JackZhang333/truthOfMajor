import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  GraduationCap,
  MessageCircle,
  Users,
  ArrowRight,
  Sparkles,
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
  ChevronRight,
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

  return (
    <div className="flex flex-col">
      {/* Hero Section - 重新设计，左对齐，去除渐变背景 */}
      <section className="relative overflow-hidden py-16 lg:py-24 motion-safe">
        {/* 背景装饰 */}
        <div className="absolute inset-0 -z-10">
          <div className="delight-drift absolute top-20 left-10 h-72 w-72 rounded-full bg-[color:oklch(0.82_0.13_92_/_0.28)] blur-3xl" />
          <div className="delight-float absolute bottom-20 right-10 h-96 w-96 rounded-full bg-[color:oklch(0.75_0.1_190_/_0.2)] blur-3xl" />
        </div>

        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* 左侧内容 */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-[color:oklch(0.95_0.037_96)] px-4 py-2 text-sm font-medium text-[color:oklch(0.49_0.1_80)] shadow-[0_12px_30px_-24px_color-mix(in_oklch,var(--brand-gold)_60%,transparent)] transition-transform duration-300 hover:-translate-y-0.5">
                <Sparkles className="h-4 w-4" />
                免费的公益答疑平台
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                高考选专业
                <br />
                <span className="text-primary">先看真相</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-lg">
                把想选的专业、担心的问题和未来方向说清楚，听听过来人的真实经验。这里不卖课、不导流，只帮你把专业看明白。
              </p>

              {/* 搜索框 */}
              <div className="flex gap-3 max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="搜专业名称、就业方向或你担心的问题"
                    className="h-12 rounded-xl border-white/70 bg-white/90 pl-12 shadow-[0_14px_40px_-24px_color-mix(in_oklch,var(--brand-teal)_45%,transparent)]"
                  />
                </div>
                <Button size="lg" className="delight-shimmer rounded-xl bg-primary px-5 shadow-[0_18px_40px_-22px_color-mix(in_oklch,var(--brand-warm)_65%,transparent)] hover:-translate-y-0.5 hover:bg-[color:oklch(0.62_0.19_34)]">
                  开始查专业
                </Button>
              </div>

              {/* 特性标签 */}
              <div className="flex flex-wrap gap-3">
                {[
                  { label: "完全免费", note: "放心先问" },
                  { label: "真实客观", note: "少一点滤镜" },
                  { label: "多元视角", note: "不只一种答案" },
                  { label: "无利益冲突", note: "不推课不带货" },
                ].map((item) => (
                  <span
                    key={item.label}
                    className="group inline-flex items-center gap-2 rounded-lg bg-white/75 px-3 py-1.5 text-sm text-[color:oklch(0.42_0.04_44)] ring-1 ring-[color:oklch(0.91_0.02_63)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_16px_28px_-22px_color-mix(in_oklch,var(--brand-teal)_35%,transparent)]"
                    title={item.note}
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-[color:oklch(0.68_0.12_190)] transition-transform duration-300 group-hover:scale-150" />
                    <span>{item.label}</span>
                    <span className="max-w-0 overflow-hidden whitespace-nowrap text-xs text-[color:oklch(0.47_0.03_44)] transition-all duration-300 group-hover:max-w-24">
                      {item.note}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* 右侧视觉区域 - 使用装饰性元素代替数据指标 */}
            <div className="hidden lg:block relative">
              <div className="relative h-[400px] rounded-3xl bg-[linear-gradient(145deg,oklch(0.97_0.025_52),oklch(0.955_0.03_188))] p-8 ring-1 ring-white/70">
                <div className="absolute right-14 top-12 h-14 w-14 rounded-full border border-white/50 bg-white/20 backdrop-blur-[2px]" />
                <div className="delight-drift absolute right-24 top-20 h-3 w-3 rounded-full bg-[color:oklch(0.82_0.13_92)]" />
                {/* 浮动卡片 - 专家 */}
                <div className="delight-float absolute top-8 left-8 rounded-2xl bg-white/95 p-4 shadow-lg shadow-[color:oklch(0.68_0.12_190_/_0.14)]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:oklch(0.68_0.12_190)] font-bold text-white">
                      李
                    </div>
                    <div>
                      <p className="font-medium text-sm">李专家</p>
                      <p className="text-xs text-muted-foreground">软件工程师 @ 大厂</p>
                    </div>
                  </div>
                </div>

                {/* 浮动卡片 - 专业 */}
                <div className="delight-drift absolute top-24 right-8 rounded-2xl bg-white/95 p-4 shadow-lg shadow-[color:oklch(0.67_0.18_38_/_0.14)]">
                  <div className="flex items-center gap-2 text-primary">
                    <GraduationCap className="h-5 w-5" />
                    <span className="font-medium">计算机科学</span>
                  </div>
                </div>

                {/* 浮动卡片 - 问答 */}
                <div className="delight-float absolute bottom-16 left-12 max-w-[200px] rounded-2xl bg-white/95 p-4 shadow-lg shadow-[color:oklch(0.82_0.13_92_/_0.16)]">
                  <p className="text-sm font-medium mb-1">&ldquo;计算机专业适合我吗？&rdquo;</p>
                  <p className="text-xs text-muted-foreground">已有 12 位专家回答</p>
                </div>

                {/* 装饰元素 */}
                <div className="absolute bottom-8 right-12">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-8 w-8 rounded-full border-2 border-white bg-[linear-gradient(145deg,oklch(0.8_0.13_92),oklch(0.67_0.18_38))]"
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    今天也有 {expertCount || 100}+ 位专家在线
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section - 使用列表式布局替代卡片网格 */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">专业分类</h2>
              <p className="text-muted-foreground mt-1">先按方向缩小范围，再继续看具体专业</p>
            </div>
            <Link href="/majors">
              <Button variant="ghost" size="sm">
                看全部分类 <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories?.map((category, index) => {
              const IconComponent = iconMap[category.icon] || GraduationCap;
              const bgColors = [
                "bg-[color:oklch(0.965_0.025_40)] text-[color:oklch(0.48_0.11_34)] hover:bg-[color:oklch(0.94_0.04_40)]",
                "bg-[color:oklch(0.955_0.03_188)] text-[color:oklch(0.39_0.08_202)] hover:bg-[color:oklch(0.93_0.042_188)]",
                "bg-[color:oklch(0.97_0.028_92)] text-[color:oklch(0.48_0.09_82)] hover:bg-[color:oklch(0.945_0.045_92)]",
                "bg-[color:oklch(0.962_0.023_28)] text-[color:oklch(0.5_0.1_26)] hover:bg-[color:oklch(0.938_0.04_28)]",
                "bg-[color:oklch(0.955_0.025_168)] text-[color:oklch(0.4_0.08_168)] hover:bg-[color:oklch(0.93_0.04_168)]",
                "bg-[color:oklch(0.962_0.03_70)] text-[color:oklch(0.42_0.08_60)] hover:bg-[color:oklch(0.94_0.045_70)]",
              ];
              const colorClass = bgColors[index % bgColors.length];

              return (
                <Link
                  key={category.id}
                  href={`/majors/category/${category.slug}`}
                  className={`group flex flex-col items-center gap-3 rounded-2xl p-5 ring-1 ring-white/70 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-26px_color-mix(in_oklch,var(--brand-teal)_35%,transparent)] ${colorClass}`}
                >
                  <IconComponent className="h-8 w-8 transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110" />
                  <span className="font-medium text-sm">{category.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Majors Section - 使用横向滚动卡片 */}
      <section className="bg-[color:oklch(0.968_0.018_78)] py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">热门专业</h2>
              <p className="text-muted-foreground mt-1">看看大家最常比较的专业，也顺手了解它们毕业后能做什么</p>
            </div>
            <Link href="/majors">
              <Button variant="ghost" size="sm">
                看全部专业 <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {majors?.map((major) => (
              <Link
                key={major.id}
                href={`/majors/${major.slug}`}
                className="group rounded-2xl border border-[color:oklch(0.91_0.02_63)] bg-white/95 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[color:oklch(0.83_0.06_52)] hover:shadow-[0_22px_46px_-28px_color-mix(in_oklch,var(--brand-warm)_35%,transparent)]"
              >
                <div className="flex items-start justify-between mb-3">
                  <Badge
                    variant="secondary"
                    className="border-0 bg-[color:oklch(0.955_0.03_188)] text-[color:oklch(0.39_0.08_202)]"
                  >
                    {major.categories?.name}
                  </Badge>
                  <span className="text-xs text-muted-foreground transition-colors duration-300 group-hover:text-[color:oklch(0.48_0.08_80)]">
                    {major.views} 浏览
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2 transition-colors group-hover:text-primary">
                  {major.name}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                  {major.description}
                </p>
                {major.degree_type && (
                  <span className="inline-block rounded bg-[color:oklch(0.965_0.025_40)] px-2 py-1 text-xs text-[color:oklch(0.48_0.11_34)] transition-transform duration-300 group-hover:translate-x-0.5">
                    {major.degree_type}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Q&A Section - 使用对话式布局 */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">最新问答</h2>
              <p className="text-muted-foreground mt-1">先看看别人问过什么，很多你在纠结的问题已经有人认真回答过</p>
            </div>
            <div className="flex gap-2">
              <Link href="/qa">
                <Button variant="ghost" size="sm">
                  进入问答广场 <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="space-y-4 max-w-4xl">
            {(questions as HomeQuestion[] | null)?.map((question) => (
              <Link
                key={question.id}
                href={`/qa/${question.id}`}
                className="group flex items-start gap-4 rounded-2xl border border-[color:oklch(0.91_0.02_63)] bg-white/95 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[color:oklch(0.86_0.05_46)] hover:shadow-[0_20px_44px_-28px_color-mix(in_oklch,var(--brand-teal)_30%,transparent)]"
              >
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarImage
                    src={question.profiles?.avatar_url ?? undefined}
                    alt={question.profiles?.full_name || "匿名用户"}
                    loading="lazy"
                  />
                  <AvatarFallback>
                    {question.profiles?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-1 line-clamp-1 transition-colors group-hover:text-primary">
                    {question.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                    {question.content}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{question.profiles?.full_name || "匿名用户"}</span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {question.answers?.[0]?.count || 0} 位专家回答
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-all duration-300 group-hover:translate-x-1.5 group-hover:text-primary" />
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/qa/ask">
              <Button size="lg" className="rounded-full bg-primary px-6 hover:bg-[color:oklch(0.62_0.19_34)]">
                <MessageCircle className="mr-2 h-4 w-4" />
                提一个自己的问题
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Become Expert CTA - 更简洁的设计 */}
      <section className="bg-[color:oklch(0.968_0.018_78)] py-16">
        <div className="container mx-auto px-4">
          <div className="rounded-3xl bg-[linear-gradient(135deg,oklch(0.67_0.18_38),oklch(0.7_0.12_190))] p-8 text-white md:p-12">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">你是过来人？</h2>
              <p className="text-white/90 text-lg mb-8">
                分享你读专业、找方向和进入行业的真实经历，让学弟学妹少走一些弯路。通过审核后，你可以持续回答相关问题。
              </p>
              <Link href="/become-expert">
                <Button
                  size="lg"
                  variant="secondary"
                  className="rounded-full border-0 bg-[color:oklch(0.975_0.02_88)] text-[color:oklch(0.45_0.09_52)] hover:bg-[color:oklch(0.96_0.03_88)]"
                >
                  <Users className="mr-2 h-4 w-4" />
                  申请成为专家
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
