import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface ContentPageSection {
  title: string;
  body: string[];
}

interface ContentPageProps {
  title: string;
  description: string;
  sections: ContentPageSection[];
  note?: string;
}

export function ContentPage({
  title,
  description,
  sections,
  note,
}: ContentPageProps) {
  return (
    <div className="bg-background">
      <section className="border-b bg-muted/30">
        <div className="container mx-auto max-w-4xl px-4 py-12">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Link>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            {description}
          </p>
        </div>
      </section>

      <section>
        <div className="container mx-auto max-w-4xl px-4 py-12">
          <div className="space-y-10">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="text-xl font-semibold">{section.title}</h2>
                <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {note ? (
            <div className="mt-12 rounded-2xl border bg-muted/40 p-5 text-sm leading-7 text-muted-foreground">
              {note}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
