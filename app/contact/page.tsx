import type { Metadata } from "next";
import { ContentPage } from "@/components/site/content-page";

export const metadata: Metadata = {
  title: "联系我们 - 专业真相",
  description: "查看专业真的联系方式与合作沟通方式。",
};

export default function ContactPage() {
  return (
    <ContentPage
      title="联系我们"
      description="如果你在使用过程中遇到问题，或希望与我们交流合作、内容纠错、校园传播等事项，可以通过以下方式联系。"
      sections={[
        {
          title: "邮箱联系",
          body: [
            "通用联系邮箱：contact@zhuanyezhenxiang.com",
            "如果你需要反馈页面错误、申请内容纠正、咨询专家入驻或寻求合作，请在邮件标题中说明主题，便于我们更快处理。",
          ],
        },
        {
          title: "建议写清楚的信息",
          body: [
            "为了更高效地帮助你，建议在来信中附上相关页面链接、问题截图、复现步骤或你的预期结果。",
            "如果是合作或媒体沟通，请补充你的机构信息、合作方向和时间安排。",
          ],
        },
        {
          title: "响应说明",
          body: [
            "我们会尽量在 3 个工作日内回复有效邮件。若遇到高峰期，处理时间可能略有延长。",
            "对于涉及账号安全、隐私投诉和内容争议的事项，我们会优先处理。",
          ],
        },
      ]}
      note="当前平台仍在持续完善中，感谢你的耐心和反馈。每一条认真意见都会帮助我们把它做得更好。"
    />
  );
}
