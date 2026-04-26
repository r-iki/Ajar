import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import { codeToHtml } from "shiki";

type ArticleRendererProps = {
  markdown: string;
};

const marked = new Marked(
  markedHighlight({
    async: true,
    highlight(code, lang) {
      return codeToHtml(code, {
        lang: lang || "ts",
        theme: "github-dark",
      });
    },
  }),
);

export async function ArticleRenderer({ markdown }: ArticleRendererProps) {
  const rendered = await marked.parse(markdown);

  return (
    <article
      className="max-w-none space-y-6 text-lg leading-relaxed text-foreground/90 
        [&_h1]:text-3xl [&_h1]:font-black [&_h1]:tracking-tight [&_h1]:mt-8 [&_h1]:mb-4
        [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:mt-8 [&_h2]:mb-4
        [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-6 [&_h3]:mb-3
        [&_p]:mb-4 [&_p]:leading-8
        [&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:rounded-2xl [&_pre]:border [&_pre]:bg-muted/50 [&_pre]:p-6 [&_pre]:shadow-inner
        [&_code]:rounded-md [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_code]:font-mono
        [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ul]:mb-6
        [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_ol]:mb-6
        [&_li]:pl-2
        [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-6 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-6
        [&_img]:rounded-2xl [&_img]:border [&_img]:my-8 [&_img]:shadow-2xl"
      dangerouslySetInnerHTML={{ __html: rendered }}
    />
  );
}
