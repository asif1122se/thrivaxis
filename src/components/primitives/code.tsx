import type { BundledLanguage, BundledTheme } from 'shiki';
import { codeToHtml } from 'shiki';
import { cn } from '@/lib/cn';

interface CodeProps {
  code: string;
  lang?: BundledLanguage;
  theme?: BundledTheme;
  className?: string;
  title?: string;
}

/**
 * Server component — renders Shiki-highlighted code at build time.
 * Marked with `'use cache'` because Shiki output is deterministic for given
 * inputs — Next.js memoizes the rendered HTML across requests.
 */
export async function Code({ code, lang = 'tsx', theme = 'vesper', className, title }: CodeProps) {
  'use cache';
  const html = await codeToHtml(code.trim(), {
    lang,
    theme,
    transformers: [
      {
        pre(node) {
          node.properties.class =
            'm-0 overflow-x-auto bg-transparent p-5 font-mono text-caption leading-relaxed';
        },
      },
    ],
  });

  return (
    <figure
      className={cn('overflow-hidden rounded-lg bg-bg ring-1 ring-border ring-inset', className)}
    >
      {title && (
        <figcaption className="flex items-center justify-between border-border border-b bg-surface px-5 py-2.5 font-mono text-label text-muted uppercase">
          <span>{title}</span>
          <span>{lang}</span>
        </figcaption>
      )}
      <div
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki output is server-rendered + sanitized at build time
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </figure>
  );
}
