import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "专业真相 - 高考专业选择指导平台",
  description: "免费、真实、无利益冲突的高考专业选择指导平台。连接高考学生与各行业专家，帮助获取真实的专业信息，做出更适合自己的选择。",
  keywords: ["高考", "专业选择", "大学专业", "职业规划", "志愿填报"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userData = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    userData = profile;
  }

  return (
    <html
      lang="zh-CN"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <Navbar user={userData} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
