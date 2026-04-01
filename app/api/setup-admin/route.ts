import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// 注意：这是一个示例 API，仅用于首次设置管理员
// 生产环境建议添加更多安全措施（如验证码、仅允许特定 IP 等）
export async function POST(_request: Request) {
  const supabase = await createClient();

  // 获取当前用户
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "请先登录" },
      { status: 401 }
    );
  }

  // 检查是否已有管理员（防止未授权提升）
  const { data: existingAdmin } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin")
    .limit(1)
    .single();

  // 如果已有管理员，需要现有管理员授权
  if (existingAdmin && existingAdmin.id !== user.id) {
    return NextResponse.json(
      { error: "需要现有管理员授权" },
      { status: 403 }
    );
  }

  // 设置为管理员
  const { error } = await supabase
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "已设置为管理员",
  });
}
