import { ArrowUpRight, GitBranch } from "lucide-react";
import type { OssRecommendation } from "@/lib/types";

type Props = {
  items: OssRecommendation[];
  loading: boolean;
};

export function OssPanel({ items, loading }: Props) {
  return (
    <section
      data-print-hide
      className="oss-card mt-8 rounded-xl bg-raised p-5 shadow-border sm:p-6"
      aria-labelledby="oss-heading"
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-mark text-subtle uppercase">
            Not in the PDF
          </p>
          <h2
            id="oss-heading"
            className="mt-1 font-headline text-xl font-medium tracking-tight text-fg"
          >
            Recommended open source contributions
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Shown beside the resume, never exported. Each project is a place
            to contribute so you can learn a skill the job still needs.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-surface px-3 py-1 text-xs text-muted shadow-border">
          Excluded from print
        </span>
      </div>

      {loading ? (
        <p className="shimmer text-sm">Matching projects to your stack…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted">
          Generate a resume to see projects that close your skill gaps. This
          card is hidden when you download the PDF.
        </p>
      ) : (
        <ul className="stagger-in grid gap-3">
          {items.map((item) => (
            <li
              key={item.url}
              className="rounded-lg bg-surface p-4 shadow-border"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-medium text-fg">
                    <GitBranch className="size-3.5 shrink-0 text-muted" />
                    <span className="truncate">{item.name}</span>
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-subtle">
                    {item.repo}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-raised px-2.5 py-1 text-xs text-muted">
                  {item.closesGap || item.fit}
                </span>
              </div>
              {item.why ? (
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {item.why}
                </p>
              ) : null}
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm text-accent hover:underline"
              >
                Open on GitHub
                <ArrowUpRight className="size-3.5" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}