import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { RemoteJob } from "./types";

const InputSchema = z.object({
  query: z.string().trim().min(1).max(120),
  location: z.string().trim().max(120).optional().catch(""),
});

const RemotiveJobSchema = z.object({
  id: z.number(),
  title: z.string().catch(""),
  company_name: z.string().catch(""),
  job_type: z.string().catch(""),
  publication_date: z.string().catch(""),
  salary: z.union([z.string(), z.number()]).optional().nullable().catch(""),
  url: z.string().catch(""),
});

export type JobsResult =
  | { ok: true; query: string; jobs: RemoteJob[] }
  | { ok: false; query: string; jobs: []; error: string };

function safeJobUrl(url: string): string | null {
  try {
    const parsed = new URL(url.replace(/&/g, "&"));
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function decodeHtml(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&/g, "&")
    .replace(/"/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(value: string): string {
  return decodeHtml(value.replace(/<[^>]+>/g, " "));
}

function fieldAfterClass(html: string, className: string): string {
  const escaped = className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = html.match(
    new RegExp(`class="[^"]*${escaped}[^"]*"[^>]*>([\\s\\S]*?)</(?:h3|h4|span|time|a|div)`),
  );
  return match ? stripTags(match[1]) : "";
}

function toSalary(value: string | number | null | undefined): string {
  if (value == null) return "";
  const text = String(value).trim();
  if (!text || text === "0") return "";
  return text;
}

function parseLinkedIn(html: string): RemoteJob[] {
  const jobs: RemoteJob[] = [];
  const seen = new Set<number>();
  const cards = html.split(/<div class="base-card/);
  for (const card of cards.slice(1)) {
    const idMatch = card.match(/urn:li:jobPosting:(\d+)/);
    if (!idMatch) continue;
    const id = Number(idMatch[1]);
    if (seen.has(id)) continue;
    const title = fieldAfterClass(card, "base-search-card__title");
    if (!title) continue;
    const datetime = card.match(/datetime="([^"]+)"/)?.[1] ?? "";
    seen.add(id);
    jobs.push({
      id,
      title,
      company: fieldAfterClass(card, "hidden-nested-link") ||
        fieldAfterClass(card, "base-search-card__subtitle") ||
        "Company",
      jobType: "",
      publishedAt: datetime,
      salary: "",
      url: `https://www.linkedin.com/jobs/view/${id}`,
      source: "linkedin",
      location: fieldAfterClass(card, "job-search-card__location"),
      listedLabel: fieldAfterClass(card, "job-search-card__listdate") ||
        fieldAfterClass(card, "job-search-card__listdate--new"),
    });
    if (jobs.length >= 8) break;
  }
  return jobs;
}

async function fetchWithRetry(url: string, init: RequestInit): Promise<Response | null> {
  let res: Response | null = null;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      res = await fetch(url, {
        ...init,
        signal: AbortSignal.timeout(12_000),
      });
      break;
    } catch {
      if (attempt === 0) continue;
    }
  }
  return res;
}

async function fetchLinkedIn(query: string, location: string): Promise<RemoteJob[]> {
  const endpoint = new URL(
    "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search",
  );
  endpoint.searchParams.set("keywords", query);
  if (location) endpoint.searchParams.set("location", location);
  endpoint.searchParams.set("f_TPR", "r604800");
  endpoint.searchParams.set("start", "0");
  endpoint.searchParams.set("position", "1");
  endpoint.searchParams.set("pageNum", "0");

  const res = await fetchWithRetry(endpoint.toString(), {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    },
  });
  if (!res?.ok) return [];
  const html = await res.text();
  return parseLinkedIn(html);
}

async function fetchRemotive(query: string): Promise<RemoteJob[]> {
  const endpoint = new URL("https://remotive.com/api/remote-jobs");
  endpoint.searchParams.set("search", query);
  endpoint.searchParams.set("limit", "5");

  const res = await fetchWithRetry(endpoint.toString(), {
    headers: { Accept: "application/json" },
  });
  if (!res?.ok) return [];

  const body = (await res.json()) as { jobs?: unknown };
  const parsed = z.array(RemotiveJobSchema).catch([]).parse(body.jobs ?? []);

  return parsed
    .slice()
    .sort((a, b) => {
      const aTime = Date.parse(a.publication_date) || 0;
      const bTime = Date.parse(b.publication_date) || 0;
      return bTime - aTime;
    })
    .reduce<RemoteJob[]>((list, job) => {
      const url = safeJobUrl(job.url);
      const title = job.title.trim();
      if (!url || !title) return list;
      list.push({
        id: job.id,
        title,
        company: job.company_name.trim() || "Company",
        jobType: job.job_type.trim(),
        publishedAt: job.publication_date,
        salary: toSalary(job.salary),
        url,
        source: "remotive",
        location: "Remote",
        listedLabel: "",
      });
      return list;
    }, [])
    .slice(0, 5);
}

export const fetchRemoteJobs = createServerFn({ method: "GET" })
  .validator((input) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<JobsResult> => {
    const location = data.location?.trim() ?? "";
    const [linkedin, remotive] = await Promise.all([
      fetchLinkedIn(data.query, location),
      fetchRemotive(data.query),
    ]);

    const jobs = [...linkedin, ...remotive];
    if (jobs.length === 0) {
      return {
        ok: true,
        query: data.query,
        jobs: [],
      };
    }

    return { ok: true, query: data.query, jobs };
  });
