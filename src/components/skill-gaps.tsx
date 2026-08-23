import type { SkillGap } from "@/lib/types";

type Props = {
  gaps: SkillGap[];
  loading: boolean;
};

export function SkillGaps({ gaps, loading }: Props) {
  return (
    <section
      data-print-hide
      className="gap-card oss-card mt-8 rounded-xl bg-raised p-5 shadow-border sm:p-6"
      aria-labelledby="gaps-heading"
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-mark text-subtle uppercase">
            Not in the PDF
          </p>
          <h2
            id="gaps-heading"
            className="mt-1 font-headline text-xl font-medium tracking-tight text-fg"
          >
            Skill gaps and action plan
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Technical skills the job description asks for that your background
            does not yet show — and how to close each one.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-surface px-3 py-1 text-xs text-muted shadow-border">
          Excluded from print
        </span>
      </div>

      {loading ? (
        <p className="shimmer text-sm">Comparing your background to the job…</p>
      ) : gaps.length === 0 ? (
        <p className="text-sm text-muted">
          Paste a target job description and generate. We will list 2–3 missing
          skills and a plan to learn them in the open. This card is hidden
          when you download the PDF.
        </p>
      ) : (
        <ol className="stagger-in grid gap-3">
          {gaps.map((gap, index) => (
            <li key={gap.skill} className="rounded-lg bg-surface p-4 shadow-border">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-raised text-xs font-medium tabular-nums text-muted">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-fg">{gap.skill}</p>
                  {gap.why ? (
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {gap.why}
                    </p>
                  ) : null}
                  {gap.action ? (
                    <p className="mt-2 text-sm leading-relaxed text-fg">
                      <span className="text-muted">Next: </span>
                      {gap.action}
                    </p>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
