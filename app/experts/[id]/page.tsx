import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/server";
import {
  ChevronLeft,
  GraduationCap,
  Briefcase,
  MessageCircle,
  Award,
  Medal,
  Users,
} from "lucide-react";

interface ExpertSpecialty {
  majors: {
    name: string;
    slug: string;
  };
}

interface ExpertAnswer {
  id: string;
  content: string;
  created_at: string;
  is_featured: boolean;
  questions: {
    id: string;
    title: string;
  };
}

interface ExpertDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ExpertDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: expert } = await supabase
    .from("experts")
    .select("nickname, bio")
    .eq("id", id)
    .eq("status", "approved")
    .single();

  return {
    title: `${expert?.nickname || "专家详情"} - 专业真相`,
    description: expert?.bio,
  };
}

export default async function ExpertDetailPage({ params }: ExpertDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // 获取专家详情
  const { data: expert } = await supabase
    .from("experts")
    .select("*, profiles(avatar_url)")
    .eq("id", id)
    .eq("status", "approved")
    .single();

  if (!expert) {
    notFound();
  }

  // 获取专家回答
  const { data: answers } = await supabase
    .from("answers")
    .select("*, questions(title, id)")
    .eq("expert_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  // 获取专家擅长专业
  const { data: specialties } = await supabase
    .from("expert_specialties")
    .select("majors(name, slug)")
    .eq("expert_id", id);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/experts"
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          返回专家列表
        </Link>
      </div>

      {/* Expert Header */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={expert.profiles?.avatar_url ?? undefined}
                alt={expert.nickname || "专家"}
              />
              <AvatarFallback className="text-3xl">
                {expert.nickname?.charAt(0) || "专"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{expert.nickname}</h1>
                <ExpertLevelBadge level={expert.level} />
              </div>
              <p className="text-muted-foreground mb-4">
                {expert.position} @ {expert.current_company}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  {expert.university} · {expert.education}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {expert.work_years}年工作经验
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  {expert.answer_count} 回答
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {expert.helpful_count} 有用
                </span>
              </div>
            </div>
          </div>

          {expert.bio && (
            <>
              <Separator className="my-6" />
              <p className="text-muted-foreground">{expert.bio}</p>
            </>
          )}

          {specialties && specialties.length > 0 && (
            <>
              <Separator className="my-6" />
              <div>
                <h3 className="font-medium mb-3">擅长专业</h3>
                <div className="flex flex-wrap gap-2">
                  {(specialties as ExpertSpecialty[]).map((spec) => (
                    <Link key={spec.majors.slug} href={`/majors/${spec.majors.slug}`}>
                      <Badge variant="secondary">{spec.majors.name}</Badge>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="answers">
        <TabsList>
          <TabsTrigger value="answers">
            <MessageCircle className="mr-2 h-4 w-4" />
            回答 ({answers?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="answers" className="mt-6">
          {answers && answers.length > 0 ? (
            <div className="space-y-4">
              {(answers as ExpertAnswer[]).map((answer) => (
                <Link key={answer.id} href={`/qa/${answer.questions.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-2">{answer.questions.title}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-3 mb-3">
                        {answer.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{new Date(answer.created_at).toLocaleDateString()} 回答</span>
                        {answer.is_featured && (
                          <Badge variant="default">精选回答</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">暂无回答</h3>
                <p className="text-muted-foreground">这位专家还没有发布回答</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ExpertLevelBadge({ level }: { level: string }) {
  const variants: Record<string, { class: string; icon: React.ComponentType<{ className?: string }>; label: string }> = {
    bronze: { class: "bg-amber-700", icon: Award, label: "铜牌专家" },
    silver: { class: "bg-slate-400", icon: Award, label: "银牌专家" },
    gold: { class: "bg-yellow-500", icon: Medal, label: "金牌专家" },
    diamond: { class: "bg-blue-500", icon: Medal, label: "钻石专家" },
  };

  const config = variants[level] || variants.bronze;
  const Icon = config.icon;

  return (
    <Badge className={config.class}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  );
}
