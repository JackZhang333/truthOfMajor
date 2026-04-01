import type { Metadata } from "next";
import { ContentPage } from "@/components/site/content-page";

export const metadata: Metadata = {
  title: "意见反馈 - 专业真相",
  description: "向专业真相提交产品建议、问题反馈与内容纠错。",
};

export default function FeedbackPage() {
  return (
    <ContentPage
      title="意见反馈"
      description="我们欢迎任何帮助平台变得更好的建议，包括功能改进、内容纠错、体验问题和合作想法。"
      sections={[
        {
          title: "你可以反馈什么",
          body: [
            "包括但不限于页面显示异常、数据错误、专业内容过时、问答质量问题、功能建议、专家信息纠错等。",
            "如果你发现某条信息可能误导学生，也非常欢迎第一时间告诉我们。",
          ],
        },
        {
          title: "推荐反馈方式",
          body: [
            "请将反馈发送至 contact@zhuanyezhenxiang.com，并尽量附上相关链接、截图和问题描述。",
            "如果是产品建议，也欢迎说明你的使用场景和你理想中的解决方式，这会帮助我们更准确判断优先级。",
          ],
        },
        {
          title: "我们如何处理",
          body: [
            "我们会按问题严重程度、影响范围和修复成本评估处理顺序，优先解决影响使用和信息准确性的核心问题。",
            "对于高价值建议，我们可能会在后续版本中逐步落地。",
          ],
        },
      ]}
    />
  );
}
