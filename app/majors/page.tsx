import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, GraduationCap, Filter, Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "专业百科 - 专业真相",
  description: "浏览各专业真实信息，了解专业就业前景、学习内容、适合人群等。",
};

export default async function MajorsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const categorySlug = params?.category;
  const searchQuery = params?.search;

  // 获取所有分类
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  // 获取专业列表
  let query = supabase
    .from("majors")
    .select("*, categories(name, slug)")
    .eq("status", "published")
    .order("views", { ascending: false });

  if (categorySlug) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();
    if (category) {
      query = query.eq("category_id", category.id);
    }
  }

  if (searchQuery) {
    query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
  }

  const { data: majors } = await query;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">专业百科</h1>
        <p className="text-muted-foreground">
          了解各专业的真实情况，包括就业前景、学习内容、适合人群等
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <form className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            name="search"
            placeholder="搜索专业名称..."
            defaultValue={searchQuery}
            className="pl-10 pr-24"
          />
          <Button type="submit" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2">
            搜索
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar - Categories */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-4 w-4" />
                专业分类
              </CardTitle>
            </CardHeader>
            <CardContent>
              <nav className="space-y-1">
                <Link
                  href="/majors"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    !categorySlug
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <GraduationCap className="h-4 w-4" />
                  全部专业
                </Link>
                {categories?.map((category) => (
                  <Link
                    key={category.id}
                    href={`/majors?category=${category.slug}`}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                      categorySlug === category.slug
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    {category.name}
                  </Link>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Majors Grid */}
        <div className="lg:col-span-3">
          {majors && majors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {majors.map((major) => (
                <Link key={major.id} href={`/majors/${major.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">
                          {major.categories?.name}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {major.views}
                        </span>
                      </div>
                      <CardTitle className="mt-2">{major.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {major.description}
                      </p>
                      <div className="flex gap-2 mt-4">
                        {major.degree_type && (
                          <Badge variant="outline">{major.degree_type}</Badge>
                        )}
                        {major.duration && (
                          <Badge variant="outline">{major.duration}年制</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">暂无专业数据</h3>
              <p className="text-muted-foreground">
                该分类下暂时还没有专业信息，请查看其他分类
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
