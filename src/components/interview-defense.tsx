import type { DefenseItem } from "@/lib/types";

type Props = {
  items: DefenseItem[];
  loading: boolean;
};

export function InterviewDefense({ items, loading }: Props) {
  return (
    <section
      data-print-hide
      className="interview-card rounded-xl bg-raised p-5 shadow-border sm:p-6"
      aria-labelledby="defense-heading"
    >
      <div className="mb-5">
        <p className="text-xs font-medium tracking-mark text-subtle uppercase">
          Not in the PDF
        </p>
        <h2
          id="defense-heading"
          className="mt-1 font-headline text-xl font-medium tracking-tight text-fg"
        >
          Interview defense cheat sheet
        </h2>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Tough questions a hiring manager will ask about this resume, with a
          30-second spoken answer. Practice out loud. This panel never prints.
        </p>
      </div>

      {loading ? (
        <p className="shimmer text-sm">Writing your defense questions…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted">
          Generate a resume first. We pull 3–4 questions from the bullets and
          gaps on that sheet.
        </p>
      ) : (
        <ol className="stagger-in grid gap-4">
          {items.map((item, index) => (
            <li
              key={item.question}
              className="rounded-lg bg-surface p-4 shadow-border"
            >
              <p className="flex gap-3 text-sm font-medium leading-snug text-fg">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-raised text-xs tabular-nums text-muted">
                  {index + 1}
                </span>
                <span>{item.question}</span>
              </p>
              {item.probe ? (
                <p className="mt-3 pl-10 text-sm text-muted">
                  <span className="text-subtle">They are probing </span>
                  {item.probe}
                </p>
              ) : null}
              <div className="mt-3 rounded-md bg-raised px-4 py-3 pl-10 shadow-border">
                <p className="text-xs font-medium tracking-mark text-subtle uppercase">
                  30-second answer
                </p>
                <p className="mt-2 text-sm leading-relaxed text-fg">
                  {item.answer}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
