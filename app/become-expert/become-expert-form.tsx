"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/client";
import {
  Loader2,
  CheckCircle2,
  Award,
  Users,
  TrendingUp,
} from "lucide-react";

interface BecomeExpertFormProps {
  userId: string;
}

export function BecomeExpertForm({ userId }: BecomeExpertFormProps) {
  const [formData, setFormData] = useState({
    nickname: "",
    currentCompany: "",
    position: "",
    workYears: "",
    university: "",
    major: "",
    education: "",
    bio: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: existingExpert } = await supabase
      .from("experts")
      .select("id, status")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingExpert?.status === "pending") {
      setError("你的申请还在审核中，暂时不需要重复提交。你可以去个人中心查看最新进度。");
      setLoading(false);
      return;
    }

    if (existingExpert?.status === "approved") {
      setError("你已经通过审核，可以直接前往专家中心回答问题。");
      setLoading(false);
      return;
    }

    const payload = {
      nickname: formData.nickname,
      current_company: formData.currentCompany,
      position: formData.position,
      work_years: parseInt(formData.workYears, 10) || 0,
      university: formData.university,
      major: formData.major,
      education: formData.education,
      bio: formData.bio,
      status: "pending",
      level: "bronze",
    };

    if (existingExpert?.status === "rejected") {
      const { error: updateError } = await supabase
        .from("experts")
        .update(payload)
        .eq("id", existingExpert.id)
        .eq("user_id", userId);

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      setSubmitted(true);
      setLoading(false);
      return;
    }

    const { error: submitError } = await supabase.from("experts").insert({
      user_id: userId,
      ...payload,
    });

    if (submitError) {
      setError(submitError.message);
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16">
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle2 className="mx-auto mb-6 h-16 w-16 text-green-500" />
            <h1 className="mb-4 text-2xl font-bold">申请已提交，等待审核</h1>
            <p className="mb-6 text-muted-foreground">
              我们会在 1 到 3 个工作日内完成审核。审核结果会通过邮件通知，你也可以在个人中心随时查看状态。
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/">
                <Button variant="outline">返回首页</Button>
              </Link>
              <Link href="/dashboard">
                <Button>查看申请状态</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-center text-3xl font-bold">成为专家</h1>
        <p className="mb-8 text-center text-muted-foreground">
          填写你的学习和工作经历，通过审核后就能以专家身份回答学生问题。
        </p>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6 text-center">
              <Award className="mx-auto mb-3 h-8 w-8 text-primary" />
              <h3 className="mb-1 font-semibold">个人品牌建设</h3>
              <p className="text-sm text-muted-foreground">
                展示真实经历，让更多学生认识你
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="mx-auto mb-3 h-8 w-8 text-primary" />
              <h3 className="mb-1 font-semibold">社会价值</h3>
              <p className="text-sm text-muted-foreground">
                帮助学弟学妹少走弯路
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="mx-auto mb-3 h-8 w-8 text-primary" />
              <h3 className="mb-1 font-semibold">职业发展</h3>
              <p className="text-sm text-muted-foreground">
                在答疑中沉淀影响力和行业观察
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>专家入驻申请</CardTitle>
          <CardDescription>
            请尽量填写真实、可核验的信息，这会直接影响审核速度。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nickname">
                  昵称 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nickname"
                  placeholder="这是学生在平台上看到的名字"
                  value={formData.nickname}
                  onChange={(e) =>
                    setFormData({ ...formData, nickname: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="education">
                  学历 <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.education}
                  onValueChange={(value) =>
                    setFormData({ ...formData, education: value || "" })
                  }
                >
                  <SelectTrigger id="education">
                    <SelectValue placeholder="选择你的最高学历" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="本科">本科</SelectItem>
                    <SelectItem value="硕士">硕士</SelectItem>
                    <SelectItem value="博士">博士</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentCompany">
                  当前公司 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="currentCompany"
                  placeholder="例如：字节跳动、某三甲医院、某会计师事务所"
                  value={formData.currentCompany}
                  onChange={(e) =>
                    setFormData({ ...formData, currentCompany: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">
                  职位 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="position"
                  placeholder="例如：产品经理、结构工程师、临床医生"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workYears">
                  工作年限 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="workYears"
                  type="number"
                  min="0"
                  max="50"
                  placeholder="填数字，例如 5"
                  value={formData.workYears}
                  onChange={(e) =>
                    setFormData({ ...formData, workYears: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="university">
                  毕业院校 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="university"
                  placeholder="填写你的毕业院校全称"
                  value={formData.university}
                  onChange={(e) =>
                    setFormData({ ...formData, university: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="major">
                  所学专业 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="major"
                  placeholder="填写你的本科或最相关专业，例如计算机科学与技术"
                  value={formData.major}
                  onChange={(e) =>
                    setFormData({ ...formData, major: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio">
                  个人简介 <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="bio"
                  placeholder="请写清楚你的学习经历、工作路径，以及你最适合回答哪些问题，例如就业方向、读研选择、行业现实等。"
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  rows={5}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  正在提交申请...
                </>
              ) : (
                "提交专家申请"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
