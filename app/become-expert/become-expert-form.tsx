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
      setError("您的申请正在审核中，请前往个人中心查看进度");
      setLoading(false);
      return;
    }

    if (existingExpert?.status === "approved") {
      setError("您已经是认证专家，可直接前往专家中心");
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
            <h1 className="mb-4 text-2xl font-bold">申请已提交</h1>
            <p className="mb-6 text-muted-foreground">
              感谢您的申请！我们将在1-3个工作日内完成审核，审核结果将通过邮件通知您。
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
          登录完成后，填写申请信息即可开始专家入驻流程
        </p>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6 text-center">
              <Award className="mx-auto mb-3 h-8 w-8 text-primary" />
              <h3 className="mb-1 font-semibold">个人品牌建设</h3>
              <p className="text-sm text-muted-foreground">
                展示职业履历，建立个人品牌
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="mx-auto mb-3 h-8 w-8 text-primary" />
              <h3 className="mb-1 font-semibold">社会价值</h3>
              <p className="text-sm text-muted-foreground">
                帮助学弟学妹，获得成就感
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="mx-auto mb-3 h-8 w-8 text-primary" />
              <h3 className="mb-1 font-semibold">职业发展</h3>
              <p className="text-sm text-muted-foreground">
                拓展人脉，了解行业趋势
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>专家入驻申请</CardTitle>
          <CardDescription>
            请填写真实信息，我们会尽快完成审核
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
                  placeholder="对外展示的昵称"
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
                    <SelectValue placeholder="选择学历" />
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
                  placeholder="如：某互联网公司"
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
                  placeholder="如：高级软件工程师"
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
                  placeholder="如：5"
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
                  placeholder="如：清华大学"
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
                  placeholder="如：计算机科学与技术"
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
                  placeholder="请简要介绍您的学习、工作经历，以及可以帮助学生的方向"
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
                  提交中...
                </>
              ) : (
                "提交申请"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
