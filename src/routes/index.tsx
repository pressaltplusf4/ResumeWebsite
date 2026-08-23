import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, Download, FileText, Loader2, MessageSquare } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { InterviewDefense } from "@/components/interview-defense";
import { JobsPanel } from "@/components/jobs-panel";
import { OssPanel } from "@/components/oss-panel";
import { ProfileForm } from "@/components/profile-form";
import { ResumeDocument } from "@/components/resume-document";
import { SkillGaps } from "@/components/skill-gaps";
import { Button } from "@/components/ui/button";
import { fetchRemoteJobs } from "@/lib/fetch-jobs";
import { generateResume } from "@/lib/generate-resume";
import { coalesceLinks, jobSearchQuery, printResume } from "@/lib/format";
import { sampleForPersona } from "@/lib/sample-profile";
import {
  EMPTY_PROFILE,
  type GenerateSuccess,
  type ProfileInput,
  type RemoteJob,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const PROFILE_KEY = "northline:profile";
const RESULT_KEY = "northline:result";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [profile, setProfile] = useState<ProfileInput>(EMPTY_PROFILE);
  const [result, setResult] = useState<GenerateSuccess | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [previewTab, setPreviewTab] = useState<"resume" | "interview" | "jobs">(
    "resume",
  );
  const [jobs, setJobs] = useState<RemoteJob[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [jobsEmpty, setJobsEmpty] = useState(false);
  const [jobsFor, setJobsFor] = useState("");
  const jobsInflight = useRef<string | null>(null);

  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem(PROFILE_KEY);
      if (storedProfile) {
        const parsed = JSON.parse(storedProfile) as Partial<ProfileInput>;
        const merged = { ...EMPTY_PROFILE, ...parsed };
        if (!merged.links) {
          merged.links = coalesceLinks(merged);
        }
        setProfile(merged);
      }
      const storedResult = localStorage.getItem(RESULT_KEY);
      if (storedResult) {
        const parsed = JSON.parse(storedResult) as GenerateSuccess;
        if (parsed?.ok && parsed.resume) {
          setResult({
            ...parsed,
            gaps: parsed.gaps ?? [],
            defense: parsed.defense ?? [],
            recommendations: (parsed.recommendations ?? []).map((item) => ({
              ...item,
              closesGap: item.closesGap ?? "",
            })),
          });
        }
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }, [profile, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (result) localStorage.setItem(RESULT_KEY, JSON.stringify(result));
    else localStorage.removeItem(RESULT_KEY);
  }, [result, hydrated]);

  async function loadJobs(query: string) {
    const title = query.trim();
    const location = profile.location.trim();
    const next = `${title}|${location}`;
    if (!title) {
      setJobs([]);
      setJobsEmpty(false);
      setJobsError(null);
      setJobsFor("");
      return;
    }
    if (jobsInflight.current === next || jobsFor === next) return;
    jobsInflight.current = next;
    setJobsLoading(true);
    setJobsError(null);
    setJobsEmpty(false);
    try {
      const response = await fetchRemoteJobs({
        data: { query: title, location },
      });
      if (jobsInflight.current !== next) return;
      if (!response.ok) {
        setJobs([]);
        setJobsEmpty(false);
        setJobsError(response.error);
        return;
      }
      setJobs(response.jobs);
      setJobsEmpty(response.jobs.length === 0);
      setJobsError(null);
      setJobsFor(next);
    } catch {
      if (jobsInflight.current !== next) return;
      setJobs([]);
      setJobsEmpty(false);
      setJobsError("Could not load openings. Try again in a moment.");
    } finally {
      if (jobsInflight.current === next) {
        jobsInflight.current = null;
        setJobsLoading(false);
      }
    }
  }

  const searchQuery = jobSearchQuery({
    targetRole: profile.targetRole,
    headline: result?.resume.headline,
    jobDescription: profile.jobDescription,
  });

  useEffect(() => {
    if (previewTab !== "jobs") return;
    void loadJobs(searchQuery);
  }, [previewTab, searchQuery, jobsFor, profile.location]);

  async function handleGenerate() {
    if (loading) return;
    const name = profile.name.trim();
    const email = profile.email.trim();
    const phone = profile.phone.trim();
    const skills = profile.skills.trim();
    const bio = profile.bio.trim();
    const jobDescription = profile.jobDescription.trim();
    if (!name || !email || !phone || !skills || bio.length < 20 || jobDescription.length < 40) {
      setError(
        "Add contact details, skills, a short background, and a target job description.",
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await generateResume({
        data: {
          ...profile,
          name,
          email,
          phone,
          links: profile.links.trim() || coalesceLinks(profile),
          skills,
          bio,
          jobDescription,
        },
      });
      if (!response.ok) {
        setError(response.error);
        return;
      }
      setResult(response);
      setPreviewTab("resume");
      void loadJobs(
        jobSearchQuery({
          targetRole: profile.targetRole,
          headline: response.resume.headline,
          jobDescription,
        }),
      );
      if (window.matchMedia("(max-width: 1023px)").matches) {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        requestAnimationFrame(() => {
          document.getElementById("resume-print-root")?.scrollIntoView({
            behavior: reduce ? "auto" : "smooth",
            block: "start",
          });
        });
      }
    } catch {
      setError("Something went wrong while generating. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setProfile(EMPTY_PROFILE);
    setResult(null);
    setError(null);
    setPreviewTab("resume");
    setJobs([]);
    setJobsEmpty(false);
    setJobsError(null);
    setJobsFor("");
    jobsInflight.current = null;
  }

  return (
    <div className="app-frame flex min-h-dvh flex-col bg-bg text-fg lg:h-dvh lg:overflow-hidden">
      <header
        data-print-hide
        className="shrink-0 border-b border-line px-4 py-4 sm:px-6"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <NorthMark />
            <div>
              <p className="font-headline text-lg font-medium tracking-tight text-fg">
                Northline
              </p>
              <p className="text-xs text-muted">
                Resume gap closer
              </p>
            </div>
          </div>
          <p className="hidden text-xs tracking-mark text-subtle uppercase sm:block">
            Single column · Text selectable · Print to PDF
          </p>
        </div>
      </header>

      <div className="split-grid grid w-full lg:min-h-0 lg:flex-1 lg:grid-cols-5 lg:overflow-hidden">
        <aside
          data-print-hide
          className="flex flex-col border-b border-line lg:col-span-2 lg:min-h-0 lg:overflow-hidden lg:border-r lg:border-b-0"
        >
          <div className="shrink-0 px-4 pt-6 sm:px-6">
            <h1 className="font-headline text-2xl font-medium tracking-tight text-fg">
              Your details
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Choose student or experienced, paste a bio and the job you want.
              We tailor ATS bullets to that path, then prep you to defend them.
            </p>
          </div>
          <ProfileForm
            value={profile}
            onChange={setProfile}
            onSubmit={handleGenerate}
            onSample={() => {
              setProfile(sampleForPersona(profile.persona));
              setError(null);
            }}
            onReset={handleReset}
            loading={loading}
            error={error}
          />
        </aside>

        <section className="preview-column bg-surface px-4 py-6 sm:px-8 lg:col-span-3 lg:min-h-0 lg:overflow-y-auto">
          <div
            data-print-hide
            className="mb-5 flex flex-wrap items-center justify-between gap-3"
          >
            <div>
              <p className="text-xs font-medium tracking-mark text-subtle uppercase">
                Live preview
              </p>
              <h2 className="font-headline text-xl font-medium tracking-tight text-fg">
                {previewTab === "resume"
                  ? "Resume"
                  : previewTab === "interview"
                    ? "Interview prep"
                    : "Live jobs"}
              </h2>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={printResume}
              disabled={!result || loading}
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Download />
              )}
              Download resume
            </Button>
          </div>

          <div
            data-print-hide
            data-preview-tabs
            role="tablist"
            aria-label="Preview"
            className="mb-5 grid grid-cols-3 gap-1 rounded-lg bg-raised p-1 shadow-border"
          >
            <button
              type="button"
              role="tab"
              id="tab-resume"
              aria-selected={previewTab === "resume"}
              aria-controls="panel-resume"
              onClick={() => setPreviewTab("resume")}
              className={cn(
                "inline-flex h-11 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-medium transition-[background-color,color] duration-150 sm:text-sm",
                previewTab === "resume"
                  ? "bg-accent text-accent-fg"
                  : "text-muted hover:text-fg",
              )}
            >
              <FileText className="size-3.5 sm:size-4" />
              Resume
            </button>
            <button
              type="button"
              role="tab"
              id="tab-interview"
              aria-selected={previewTab === "interview"}
              aria-controls="panel-interview"
              onClick={() => setPreviewTab("interview")}
              className={cn(
                "inline-flex h-11 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-medium transition-[background-color,color] duration-150 sm:text-sm",
                previewTab === "interview"
                  ? "bg-accent text-accent-fg"
                  : "text-muted hover:text-fg",
              )}
            >
              <MessageSquare className="size-3.5 sm:size-4" />
              Interview
            </button>
            <button
              type="button"
              role="tab"
              id="tab-jobs"
              aria-selected={previewTab === "jobs"}
              aria-controls="panel-jobs"
              onClick={() => setPreviewTab("jobs")}
              className={cn(
                "inline-flex h-11 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-medium transition-[background-color,color] duration-150 sm:text-sm",
                previewTab === "jobs"
                  ? "bg-accent text-accent-fg"
                  : "text-muted hover:text-fg",
              )}
            >
              <Briefcase className="size-3.5 sm:size-4" />
              Jobs
            </button>
          </div>

          <p data-print-hide className="mb-5 max-w-xl text-sm text-muted">
            {previewTab === "resume"
              ? "Save as PDF from the print dialog. The sheet stays text-selectable. Gaps, matches, interview prep, and jobs never print."
              : previewTab === "interview"
                ? "Practice these answers out loud. Download resume still exports only the ATS sheet."
                : "LinkedIn and remote openings for your target title. View on LinkedIn or apply in a new tab."}
          </p>

          {loading ? (
            <p
              data-print-hide
              className="shimmer mb-4 text-sm"
              aria-live="polite"
            >
              Comparing your background to the job description…
            </p>
          ) : null}

          <div
            id="panel-resume"
            role="tabpanel"
            aria-labelledby="tab-resume"
            data-print="resume"
            className={cn(
              "preview-pane",
              previewTab !== "resume" && "is-inactive",
            )}
          >
            <div className="paper-stage">
              <ResumeDocument
                resume={result?.resume ?? null}
                profile={profile}
                loading={loading}
              />
            </div>

            <SkillGaps
              gaps={result?.gaps ?? []}
              loading={loading}
            />

            <OssPanel
              items={result?.recommendations ?? []}
              loading={loading}
            />
          </div>

          <div
            id="panel-interview"
            role="tabpanel"
            aria-labelledby="tab-interview"
            data-print="hide"
            data-print-hide
            className={cn(
              "preview-pane",
              previewTab !== "interview" && "is-inactive",
            )}
          >
            <InterviewDefense
              items={result?.defense ?? []}
              loading={loading}
            />
          </div>

          <div
            id="panel-jobs"
            role="tabpanel"
            aria-labelledby="tab-jobs"
            data-print="hide"
            data-print-hide
            className={cn(
              "preview-pane",
              previewTab !== "jobs" && "is-inactive",
            )}
          >
            <JobsPanel
              query={searchQuery}
              location={profile.location}
              jobs={jobs}
              loading={jobsLoading}
              empty={jobsEmpty}
              error={jobsError}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function NorthMark() {
  return (
    <svg
      viewBox="0 0 32 32"
      className="size-9 shrink-0"
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="var(--color-raised)" />
      <rect x="7" y="5" width="18" height="22" rx="1.2" fill="var(--color-paper)" />
      <polygon points="16,8 17.4,17.2 16,16.2 14.6,17.2" fill="var(--color-ink)" />
      <polygon points="16,24 17.2,16.8 16,17.6 14.8,16.8" fill="var(--color-muted)" />
    </svg>
  );
}
