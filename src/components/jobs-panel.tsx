import { ArrowUpRight, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatJobType, linkedInSearchUrl, postedLabel } from "@/lib/format";
import type { RemoteJob } from "@/lib/types";

type Props = {
  query: string;
  location: string;
  jobs: RemoteJob[];
  loading: boolean;
  empty: boolean;
  error: string | null;
};

function LinkedInMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" aria-hidden="true">
      <rect width="24" height="24" rx="4" fill="currentColor" />
      <path
        fill="var(--color-raised)"
        d="M7.2 9.4H9.5V17H7.2V9.4ZM8.35 6C9.1 6 9.7 6.6 9.7 7.35C9.7 8.1 9.1 8.7 8.35 8.7C7.6 8.7 7 8.1 7 7.35C7 6.6 7.6 6 8.35 6ZM11.2 9.4H13.4V10.45H13.43C13.74 9.87 14.5 9.25 15.62 9.25C17.95 9.25 18.4 10.78 18.4 12.72V17H16.1V13.18C16.1 12.27 16.08 11.1 14.83 11.1C13.56 11.1 13.37 12.09 13.37 13.11V17H11.07L11.2 9.4Z"
      />
    </svg>
  );
}

function JobCard({ job }: { job: RemoteJob }) {
  const isLinkedIn = job.source === "linkedin";
  return (
    <li className="rounded-lg bg-surface p-4 shadow-border">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-raised text-muted">
          {isLinkedIn ? <LinkedInMark /> : <Briefcase className="size-3.5" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug text-fg">{job.title}</p>
          <p className="mt-1 text-sm text-muted">{job.company}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-raised px-2.5 py-1 text-xs text-muted">
              {isLinkedIn ? "LinkedIn" : "Remote"}
            </span>
            {job.location && !(isLinkedIn ? false : job.location === "Remote") ? (
              <span className="rounded-full bg-raised px-2.5 py-1 text-xs text-muted">
                {job.location}
              </span>
            ) : null}
            {job.jobType ? (
              <span className="rounded-full bg-raised px-2.5 py-1 text-xs text-muted">
                {formatJobType(job.jobType)}
              </span>
            ) : null}
            <span className="rounded-full bg-raised px-2.5 py-1 text-xs text-muted">
              {postedLabel(job)}
            </span>
            {job.salary ? (
              <span className="rounded-full bg-raised px-2.5 py-1 text-xs text-muted">
                {job.salary}
              </span>
            ) : null}
          </div>
          <Button asChild variant="secondary" className="mt-4">
            <a href={job.url} target="_blank" rel="noopener noreferrer">
              {isLinkedIn ? "View on LinkedIn" : "Apply now"}
              <ArrowUpRight />
            </a>
          </Button>
        </div>
      </div>
    </li>
  );
}

export function JobsPanel({
  query,
  location,
  jobs,
  loading,
  empty,
  error,
}: Props) {
  const linkedin = jobs.filter((job) => job.source === "linkedin");
  const remotive = jobs.filter((job) => job.source === "remotive");
  const searchUrl = query ? linkedInSearchUrl(query, location) : "";

  return (
    <section
      data-print-hide
      className="jobs-card rounded-xl bg-raised p-5 shadow-border sm:p-6"
      aria-labelledby="jobs-heading"
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-mark text-subtle uppercase">
            Not in the PDF
          </p>
          <h2
            id="jobs-heading"
            className="mt-1 font-headline text-xl font-medium tracking-tight text-fg"
          >
            Live job search
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted">
            {query
              ? `LinkedIn openings for “${query}”${location ? ` near ${location}` : ""}, plus remote matches. This list never prints.`
              : "Add a target role or generate a resume. We search LinkedIn and remote boards for live openings."}
          </p>
        </div>
        {searchUrl ? (
          <Button asChild variant="outline">
            <a href={searchUrl} target="_blank" rel="noopener noreferrer">
              Search LinkedIn
              <ArrowUpRight />
            </a>
          </Button>
        ) : null}
      </div>

      {!query ? (
        <p className="text-sm text-muted">
          Enter a target role on the left, or generate so we can use the
          extracted title.
        </p>
      ) : loading ? (
        <ul className="grid gap-3" aria-busy="true" aria-label="Loading jobs">
          {Array.from({ length: 5 }).map((_, index) => (
            <li
              key={index}
              className="shimmer rounded-lg bg-surface p-4 shadow-border"
            >
              <div className="h-4 w-3/4 rounded-sm bg-rule/80" />
              <div className="mt-3 h-3 w-1/2 rounded-sm bg-rule/80" />
              <div className="mt-4 flex gap-2">
                <div className="h-6 w-20 rounded-full bg-rule/80" />
                <div className="h-6 w-28 rounded-full bg-rule/80" />
              </div>
              <div className="mt-4 h-11 w-36 rounded-md bg-rule/80" />
            </li>
          ))}
        </ul>
      ) : error ? (
        <p role="status" className="text-sm text-muted">
          {error}
        </p>
      ) : empty || jobs.length === 0 ? (
        <p role="status" className="text-sm text-muted">
          No jobs found for this exact title today. Try broadening your skills!
          {searchUrl ? (
            <>
              {" "}
              <a
                href={searchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                Search LinkedIn instead
              </a>
              .
            </>
          ) : null}
        </p>
      ) : (
        <div className="grid gap-8">
          {linkedin.length > 0 ? (
            <div>
              <h3 className="mb-3 text-xs font-medium tracking-mark text-subtle uppercase">
                LinkedIn
              </h3>
              <ul className="stagger-in grid gap-3">
                {linkedin.map((job) => (
                  <JobCard key={`li-${job.id}`} job={job} />
                ))}
              </ul>
            </div>
          ) : null}
          {remotive.length > 0 ? (
            <div>
              <h3 className="mb-3 text-xs font-medium tracking-mark text-subtle uppercase">
                Also remote
              </h3>
              <ul className="stagger-in grid gap-3">
                {remotive.map((job) => (
                  <JobCard key={`rm-${job.id}`} job={job} />
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
