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
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";
import {
  User,
  MessageCircle,
  Heart,
  Users,
  Award,
  Settings,
  Shield,
  LayoutDashboard,
} from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 获取用户信息
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // 获取专家信息（如果是专家）
  const { data: expert } = await supabase
    .from("experts")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";
  const isExpert = expert?.status === "approved";
  const hasExpertApplication = !!expert;

  const navItems = [
    {
      href: "/dashboard",
      label: "概览",
      icon: LayoutDashboard,
      show: true,
    },
    {
      href: "/dashboard/profile",
      label: "个人资料",
      icon: User,
      show: true,
    },
    {
      href: "/dashboard/my-questions",
      label: "我的提问",
      icon: MessageCircle,
      show: true,
    },
    {
      href: "/dashboard/expert",
      label: "专家中心",
      icon: Award,
      show: isExpert,
    },
    {
      href: "/dashboard/become-expert",
      label: hasExpertApplication ? "申请状态" : "成为专家",
      icon: Award,
      show: !isExpert,
    },
    {
      href: "/dashboard/admin",
      label: "管理后台",
      icon: Shield,
      show: isAdmin,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">个人中心</CardTitle>
              <CardDescription>
                管理您的账户和个人信息
              </CardDescription>
            </CardHeader>
            <CardContent>
              <nav className="space-y-1">
                {navItems
                  .filter((item) => item.show)
                  .map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors hover:bg-muted"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  ))}
                <Separator className="my-4" />
                <div className="px-1">
                  <LogoutButton />
                </div>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">{children}</div>
      </div>
    </div>
  );
}
