import Link from "next/link";
import Image from "next/image";
import { Mail, MessageCircle } from "lucide-react";

export function Footer() {
  const footerLinks = {
    product: {
      title: "产品",
      links: [
        { label: "专业百科", href: "/majors" },
        { label: "问答广场", href: "/qa" },
        { label: "专家团队", href: "/experts" },
        { label: "成为专家", href: "/become-expert" },
      ],
    },
    about: {
      title: "关于",
      links: [
        { label: "关于我们", href: "/about" },
        { label: "使用指南", href: "/guide" },
        { label: "联系我们", href: "/contact" },
        { label: "意见反馈", href: "/feedback" },
      ],
    },
    legal: {
      title: "法律",
      links: [
        { label: "用户协议", href: "/terms" },
        { label: "隐私政策", href: "/privacy" },
        { label: "免责声明", href: "/disclaimer" },
      ],
    },
  };

  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <Image
                src="/logo.svg"
                alt="专业真相"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span>专业真相</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs mb-4">
              免费、真实、无利益冲突的高考专业选择指导平台。连接学生与行业专家，帮助做出更好的专业选择。
            </p>
            <div className="flex items-center gap-4">
              <a
                href="mailto:contact@zhuanyezhenxiang.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} 专业真相. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            免费公益平台，助力高考学子
          </p>
        </div>
      </div>
    </footer>
  );
}
