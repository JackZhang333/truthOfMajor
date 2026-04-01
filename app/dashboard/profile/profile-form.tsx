"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Phone, Calendar, User, Camera } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Separator } from "@/components/ui/separator";

interface ProfileFormProps {
  userId: string;
  email: string;
  initialProfile: {
    username: string | null;
    full_name: string | null;
    phone: string | null;
    avatar_url: string | null;
    role: string | null;
    created_at: string | null;
  } | null;
}

const ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const MAX_FILE_SIZE = 2 * 1024 * 1024;

export function ProfileForm({
  userId,
  email,
  initialProfile,
}: ProfileFormProps) {
  const [formData, setFormData] = useState({
    username: initialProfile?.username ?? "",
    fullName: initialProfile?.full_name ?? "",
    phone: initialProfile?.phone ?? "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    initialProfile?.avatar_url ?? null
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!avatarFile) {
      return;
    }

    const objectUrl = URL.createObjectURL(avatarFile);
    setAvatarPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [avatarFile]);

  const displayName =
    formData.fullName.trim() ||
    formData.username.trim() ||
    email ||
    "U";

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
      setError("仅支持 JPG、PNG、WebP 或 GIF 格式的图片");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("头像图片不能超过 2MB");
      return;
    }

    setError(null);
    setSuccess(null);
    setAvatarFile(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      let avatarUrl = initialProfile?.avatar_url ?? null;

      if (avatarFile) {
        const extension = avatarFile.name.split(".").pop()?.toLowerCase() || "jpg";
        const filePath = `${userId}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, avatarFile, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) {
          throw uploadError;
        }

        avatarUrl = supabase.storage.from("avatars").getPublicUrl(filePath).data.publicUrl;
      }

      const updates = {
        username: formData.username.trim() || null,
        full_name: formData.fullName.trim() || null,
        phone: formData.phone.trim() || null,
        avatar_url: avatarUrl,
      };

      const { error: updateError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId);

      if (updateError) {
        throw updateError;
      }

      setAvatarFile(null);
      setAvatarPreview(avatarUrl);
      setSuccess("个人资料已更新");
      startTransition(() => {
        router.refresh();
      });
    } catch (saveError) {
      const message =
        saveError instanceof Error ? saveError.message : "保存失败，请稍后重试";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">个人资料</h1>
        <p className="text-muted-foreground">管理您的头像和个人信息</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
            <CardDescription>更新昵称、联系方式和个人头像</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            {success ? (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            ) : null}

            <div className="flex flex-col gap-4 rounded-2xl border bg-muted/20 p-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatarPreview ?? undefined} alt={displayName} />
                  <AvatarFallback className="text-2xl">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">个人头像</p>
                  <p className="text-sm text-muted-foreground">
                    支持 JPG、PNG、WebP、GIF，文件大小不超过 2MB
                  </p>
                </div>
              </div>
              <div>
                <Label
                  htmlFor="avatar"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <Camera className="h-4 w-4" />
                  选择头像
                </Label>
                <Input
                  id="avatar"
                  type="file"
                  accept={ACCEPTED_MIME_TYPES.join(",")}
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="mr-1 inline h-4 w-4" />
                  邮箱
                </Label>
                <Input id="email" value={email} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">
                  <User className="mr-1 inline h-4 w-4" />
                  用户名
                </Label>
                <Input
                  id="username"
                  value={formData.username}
                  placeholder="设置用户名"
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      username: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  <User className="mr-1 inline h-4 w-4" />
                  姓名
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  placeholder="您的真实姓名"
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      fullName: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  <Phone className="mr-1 inline h-4 w-4" />
                  手机号
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  placeholder="您的手机号"
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <Separator />
            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  "保存修改"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>账户信息</CardTitle>
            <CardDescription>账户相关信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  <Calendar className="mr-1 inline h-4 w-4" />
                  注册时间
                </Label>
                <p className="text-sm text-muted-foreground">
                  {initialProfile?.created_at
                    ? new Date(initialProfile.created_at).toLocaleString()
                    : "-"}
                </p>
              </div>
              <div className="space-y-2">
                <Label>用户角色</Label>
                <p className="text-sm text-muted-foreground capitalize">
                  {initialProfile?.role === "admin"
                    ? "管理员"
                    : initialProfile?.role === "expert"
                    ? "专家"
                    : "普通用户"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
