import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/server";
import {
  GraduationCap,
  Briefcase,
  BookOpen,
  Users,
  Clock,
  ChevronLeft,
  MessageCircle,
  Heart,
} from "lucide-react";

interface MajorDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: MajorDetailPageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: major } = await supabase
    .from("majors")
    .select("name, description")
    .eq("slug", slug)
    .single();

  return {
    title: `${major?.name || "专业详情"} - 专业真相`,
    description: major?.description,
  };
}

export default async function MajorDetailPage({ params }: MajorDetailPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // 获取专业详情
  const { data: major } = await supabase
    .from("majors")
    .select("*, categories(name, slug)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!major) {
    notFound();
  }

  // 更新浏览量
  await supabase
    .from("majors")
    .update({ views: (major.views || 0) + 1 })
    .eq("id", major.id);

  // 获取过来人经验
  const { data: experiences } = await supabase
    .from("major_experiences")
    .select("*, experts(nickname, current_company, position, level)")
    .eq("major_id", major.id)
    .eq("is_featured", true)
    .limit(3);

  // 获取相关问答
  const { data: questions } = await supabase
    .from("questions")
    .select("*, profiles(full_name), answers(count)")
    .contains("major_ids", [major.id])
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/majors"
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          返回专业列表
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary">{major.categories?.name}</Badge>
          <span className="text-sm text-muted-foreground">
            {major.code && `代码: ${major.code}`}
          </span>
        </div>
        <h1 className="text-4xl font-bold mb-4">{major.name}</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          {major.description}
        </p>
        <div className="flex gap-2 mt-4">
          {major.degree_type && <Badge variant="outline">{major.degree_type}</Badge>}
          {major.duration && <Badge variant="outline">{major.duration}年制</Badge>}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="courses">主要课程</TabsTrigger>
          <TabsTrigger value="career">就业前景</TabsTrigger>
          <TabsTrigger value="qa">相关问答</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Skills */}
              {major.skills && major.skills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BookOpen className="h-5 w-5" />
                      能力要求
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {(major.skills as string[]).map((skill: string) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Personality Match */}
              {major.personality_match && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="h-5 w-5" />
                      适合人群
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{major.personality_match}</p>
                  </CardContent>
                </Card>
              )}

              {/* Career Prospects */}
              {major.career_prospects && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Briefcase className="h-5 w-5" />
                      就业方向
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {major.career_prospects}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Actions */}
              <Card>
                <CardContent className="p-6 space-y-4">
                  <Link href="/qa/ask">
                    <Button className="w-full">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      问个问题
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full">
                    <Heart className="mr-2 h-4 w-4" />
                    收藏专业
                  </Button>
                </CardContent>
              </Card>

              {/* Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">专业数据</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">浏览量</span>
                    <span className="font-medium">{major.views}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">收藏数</span>
                    <span className="font-medium">{major.likes || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">相关问答</span>
                    <span className="font-medium">{questions?.length || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Expert Experiences */}
          {experiences && experiences.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">过来人经验</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {experiences.map((exp: any) => (
                  <Card key={exp.id} className="h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {exp.experts?.nickname?.charAt(0) || "专"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{exp.experts?.nickname}</p>
                          <p className="text-sm text-muted-foreground">
                            {exp.experts?.position} @ {exp.experts?.current_company}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h3 className="font-semibold mb-2">{exp.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-4">
                        {exp.content}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                主要课程
              </CardTitle>
            </CardHeader>
            <CardContent>
              {major.courses && major.courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(major.courses as string[]).map((course: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 rounded-lg bg-muted"
                    >
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                        {index + 1}
                      </span>
                      <span>{course}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">暂无课程信息</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Career Tab */}
        <TabsContent value="career">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                就业前景
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {major.career_prospects ? (
                <div className="prose max-w-none">
                  <p className="whitespace-pre-line text-muted-foreground">
                    {major.career_prospects}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">暂无就业信息</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Q&A Tab */}
        <TabsContent value="qa">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">相关问答</h2>
              <Link href="/qa/ask">
                <Button>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  提问
                </Button>
              </Link>
            </div>

            {questions && questions.length > 0 ? (
              <div className="space-y-4">
                {questions.map((question: any) => (
                  <Link key={question.id} href={`/qa/${question.id}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {question.profiles?.full_name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-2">{question.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {question.content}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{question.profiles?.full_name || "匿名用户"}</span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" />
                                {question.answers?.[0]?.count || 0} 回答
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(question.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
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
                  <h3 className="text-lg font-medium mb-2">暂无相关问答</h3>
                  <p className="text-muted-foreground mb-4">
                    成为第一个提问的人吧
                  </p>
                  <Link href="/qa/ask">
                    <Button>去提问</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
