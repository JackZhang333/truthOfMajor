import type { Metadata } from "next";
import { ContentPage } from "@/components/site/content-page";

export const metadata: Metadata = {
  title: "隐私政策 - 专业真相",
  description: "了解专业真相如何收集、使用和保护你的个人信息。",
};

export default function PrivacyPage() {
  return (
    <ContentPage
      title="隐私政策"
      description="我们重视你的个人信息与数据安全，并会以合法、正当、必要的方式处理你在使用平台过程中提供的信息。"
      sections={[
        {
          title: "我们收集的信息",
          body: [
            "当你注册、登录、提问、申请成为专家或与我们联系时，我们可能收集你的邮箱、昵称、个人资料、提问内容及相关操作记录。",
            "为了保障服务稳定运行，我们也可能记录必要的设备信息、访问日志和异常诊断信息。",
          ],
        },
        {
          title: "我们如何使用信息",
          body: [
            "这些信息主要用于账号识别、内容展示、服务改进、风控审核、问题排查和与用户沟通。",
            "未经你的同意，我们不会将你的个人信息出售给第三方。除法律法规要求或服务必要协作外，我们不会超范围使用你的信息。",
          ],
        },
        {
          title: "信息保护",
          body: [
            "我们会采取合理的技术与管理措施保护你的信息安全，尽量避免未经授权的访问、披露、篡改或丢失。",
            "尽管如此，互联网环境不存在绝对安全，我们也建议你妥善保管自己的账号和密码信息。",
          ],
        },
        {
          title: "你的权利",
          body: [
            "你有权访问、更正或删除你在平台中的部分个人资料，也可以在适用范围内申请注销账号。",
            "如你对隐私处理存在疑问、投诉或申诉，可以通过 contact@zhuanyezhenxiang.com 联系我们。",
          ],
        },
      ]}
    />
  );
}
