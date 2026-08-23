import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type {
  ExperienceLevel,
  GenerateResult,
  OssRecommendation,
  ResumeDocument,
  SkillGap,
  DefenseItem,
} from "./types";

const InputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().max(200),
  phone: z.string().trim().max(80),
  links: z.string().trim().max(400).optional().catch(""),
  location: z.string().trim().max(120),
  linkedin: z.string().trim().max(200).optional().catch(""),
  github: z.string().trim().max(200).optional().catch(""),
  targetRole: z.string().trim().max(120),
  skills: z.string().trim().min(1).max(600),
  experienceLevel: z.enum(["intern", "junior", "mid", "senior", "staff"]),
  persona: z.enum(["student", "professional"]).catch("professional"),
  bio: z.string().trim().min(20).max(2500),
  jobDescription: z.string().trim().min(40).max(6000),
});

const ResumeSchema = z.object({
  name: z.string().optional(),
  headline: z.string().catch(""),
  summary: z.string().catch(""),
  skills: z
    .array(
      z.object({
        category: z.string(),
        items: z.array(z.string()),
      }),
    )
    .catch([]),
  experience: z
    .array(
      z.object({
        title: z.string(),
        company: z.string().catch(""),
        location: z.string().catch(""),
        dates: z.string().catch(""),
        bullets: z.array(z.string()).catch([]),
      }),
    )
    .catch([]),
  education: z
    .array(
      z.object({
        degree: z.string(),
        school: z.string().catch(""),
        year: z.string().catch(""),
        details: z.string().catch(""),
      }),
    )
    .catch([]),
  projects: z
    .array(
      z.object({
        name: z.string(),
        stack: z.string().catch(""),
        bullets: z.array(z.string()).catch([]),
      }),
    )
    .catch([]),
});

const GapSchema = z.object({
  skill: z.string(),
  why: z.string().catch(""),
  action: z.string().catch(""),
});

const RecSchema = z.object({
  name: z.string(),
  repo: z.string().catch(""),
  url: z.string().catch(""),
  fit: z.string().catch(""),
  why: z.string().catch(""),
  closesGap: z.string().catch(""),
});

const DefenseSchema = z.object({
  question: z.string(),
  probe: z.string().catch(""),
  answer: z.string().catch(""),
});

const OutputSchema = z.object({
  resume: ResumeSchema,
  gaps: z.array(GapSchema).catch([]),
  recommendations: z.array(RecSchema).catch([]),
  defense: z.array(DefenseSchema).catch([]),
});

const LEVEL_LABEL: Record<ExperienceLevel, string> = {
  intern: "Student / Intern",
  junior: "Junior (0–2 years)",
  mid: "Mid-level (2–5 years)",
  senior: "Senior (5–10 years)",
  staff: "Staff / Principal (10+ years)",
};

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fence?.[1] ?? trimmed;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) {
    throw new Error("Model did not return JSON");
  }
  return JSON.parse(raw.slice(start, end + 1));
}

function githubUrl(repo: string, url: string): string | null {
  const candidate = (url || repo).trim();
  if (!candidate) return null;
  try {
    if (candidate.startsWith("http")) {
      const parsed = new URL(candidate);
      if (parsed.hostname !== "github.com" && parsed.hostname !== "www.github.com") {
        return null;
      }
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts.length < 2) return null;
      return `https://github.com/${parts[0]}/${parts[1]}`;
    }
  } catch {
    return null;
  }
  const handle = candidate.replace(/^github\.com\//i, "").replace(/^\/+/, "");
  const parts = handle.split("/").filter(Boolean);
  if (parts.length < 2) return null;
  return `https://github.com/${parts[0]}/${parts[1]}`;
}

function passThroughContact(
  input: z.infer<typeof InputSchema>,
  resume: z.infer<typeof ResumeSchema>,
): ResumeDocument {
  return {
    name: input.name,
    headline: resume.headline.trim() || input.targetRole || "Professional",
    contact: {
      email: input.email,
      phone: input.phone,
      location: input.location,
      links: input.links || [input.linkedin, input.github].filter(Boolean).join(", "),
      linkedin: input.linkedin || "",
      github: input.github || "",
    },
    summary: resume.summary.trim(),
    skills: resume.skills
      .map((group) => ({
        category: group.category.trim(),
        items: group.items.map((item) => item.trim()).filter(Boolean),
      }))
      .filter((group) => group.category && group.items.length > 0),
    experience: resume.experience
      .map((role) => ({
        title: role.title.trim(),
        company: role.company.trim(),
        location: role.location.trim(),
        dates: role.dates.trim(),
        bullets: role.bullets.map((b) => b.trim()).filter(Boolean),
      }))
      .filter((role) => role.title && role.bullets.length > 0),
    education: resume.education
      .map((ed) => ({
        degree: ed.degree.trim(),
        school: ed.school.trim(),
        year: ed.year.trim(),
        details: ed.details.trim(),
      }))
      .filter((ed) => ed.degree && ed.school),
    projects: resume.projects
      .map((project) => ({
        name: project.name.trim(),
        stack: project.stack.trim(),
        bullets: project.bullets.map((b) => b.trim()).filter(Boolean),
      }))
      .filter((project) => project.name && project.bullets.length > 0),
  };
}

const SYSTEM_PROMPT = `You are an expert ATS resume writer, career gap closer, and interview coach.
Return ONLY valid JSON. No markdown, no commentary.

Work in this order:
1. Read the persona: "student" (student / fresh graduate) or "professional" (experienced employee).
2. Compare the candidate's raw background + listed skills against the Target Job Description (JD).
3. Write an ATS resume that highlights genuine overlaps with the JD.
4. Identify 2–3 technical skills the JD requires that the candidate is MISSING.
5. Recommend real open-source projects where contributing would teach those exact missing skills.
6. Write an Interview Defense cheat sheet: 3–4 tough questions a recruiter or hiring manager will ask based on THIS resume, each with a 30-second spoken answer.

JSON shape:
{
  "resume": {
    "headline": string,
    "summary": string,
    "skills": [{ "category": string, "items": string[] }],
    "experience": [{ "title": string, "company": string, "location": string, "dates": string, "bullets": string[] }],
    "education": [{ "degree": string, "school": string, "year": string, "details": string }],
    "projects": [{ "name": string, "stack": string, "bullets": string[] }]
  },
  "gaps": [
    { "skill": string, "why": string, "action": string }
  ],
  "recommendations": [
    {
      "name": string,
      "repo": "owner/name",
      "url": "https://github.com/owner/name",
      "fit": string,
      "why": string,
      "closesGap": string
    }
  ],
  "defense": [
    { "question": string, "probe": string, "answer": string }
  ]
}

Persona — student:
- Treat academic, hackathon, course, club, and internship work as real engineering.
- Put substantial work under Projects (and internships under Experience when named).
- Reframe each project in production-grade language: system architecture, data model / database schema, API design, performance, failure modes, collaboration.
- Do not inflate into fake full-time jobs. Do not invent employers.

Persona — professional:
- Transform routine daily tasks into Google XYZ bullets: Accomplished [X], measured by [Y], by doing [Z].
- If the bio has no numbers, add estimated metrics in square brackets for the user to customize, e.g. "[~25% latency reduction]", "[~40 hours/month saved]". Never present an estimate as a verified fact.
- Prefer 3–5 XYZ bullets per role.

Shared resume rules:
- Tailor bullets to the JD. Mirror JD language only when the bio supports it.
- Start bullets with strong verbs.
- Do NOT invent employers, schools, dates, job titles, credentials, or tools the candidate did not mention.
- Do NOT claim the missing skills as experience.
- headline should align with the target role / JD title.
- summary: 3–4 sentences in resume voice (no "I").
- education/projects: empty arrays when unsupported.

Gap rules:
- Exactly 2 or 3 items. "skill" is a specific technical skill from the JD.
- "why": one sentence. "action": one concrete next step at their persona and level.

Open-source rules:
- 3–5 REAL GitHub repos. URLs must be https://github.com/{owner}/{repo}.
- Each recommendation closes one gap ("closesGap" matches a gaps.skill). Cover every gap at least once.
- Do not invent repositories.

Interview defense rules:
- Exactly 3 or 4 items in "defense".
- Questions must be grounded in THIS resume (a project, a metric, an architecture choice, a gap they still have).
- Mix: one deep-dive on a listed project/system, one "how would you handle X in production", one question that probes a gap honestly, optional fourth on collaboration or tradeoffs.
- "probe": one short clause on what the interviewer is testing.
- "answer": a spoken 30-second template (4–6 sentences, first person). Students: architecture and schema of their project. Professionals: walk the XYZ metric. For estimates, the answer should say the figure is an estimate they can refine.
- Do not invent facts beyond the resume.`;

export const generateResume = createServerFn({ method: "POST" })
  .validator((input) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<GenerateResult> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return {
        ok: false,
        code: "unavailable",
        error: "Resume generation is unavailable in this environment.",
      };
    }

    const userPayload = {
      persona: data.persona,
      name: data.name,
      targetRole: data.targetRole || null,
      skills: data.skills,
      experienceLevel: LEVEL_LABEL[data.experienceLevel],
      location: data.location || null,
      bio: data.bio,
      jobDescription: data.jobDescription,
    };

    let res: Response | null = null;
    let lastNetworkError = false;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        res = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "grok-4.5",
            temperature: 0.35,
            max_tokens: 4200,
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              {
                role: "user",
                content: `Compare this candidate to the target JD. Persona is "${data.persona}". Write the tailored ATS resume, skill gaps, open-source action plan, and interview defense cheat sheet.\n${JSON.stringify(userPayload)}`,
              },
            ],
          }),
          signal: AbortSignal.timeout(75_000),
        });
        lastNetworkError = false;
        break;
      } catch {
        lastNetworkError = true;
        if (attempt === 0) continue;
      }
    }
    if (!res || lastNetworkError) {
      return {
        ok: false,
        code: "unknown",
        error: "Could not reach the generator. Check your connection and try again.",
      };
    }

    if (res.status === 429) {
      return {
        ok: false,
        code: "rate_limit",
        error:
          "The generator is busy right now. Wait about a minute, then try again.",
      };
    }
    if (res.status === 401 || res.status === 403) {
      return {
        ok: false,
        code: "unavailable",
        error: "Resume generation is unavailable right now.",
      };
    }
    if (!res.ok) {
      return {
        ok: false,
        code: "unknown",
        error: "The generator returned an error. Try again in a moment.",
      };
    }

    const body = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = body.choices?.[0]?.message?.content ?? "";
    if (!text) {
      return {
        ok: false,
        code: "invalid",
        error: "The generator returned an empty response. Try again.",
      };
    }

    try {
      const parsed = OutputSchema.parse(extractJson(text));
      const resume = passThroughContact(data, parsed.resume);
      if (!resume.summary && resume.experience.length === 0 && resume.projects.length === 0) {
        return {
          ok: false,
          code: "invalid",
          error: "The generator could not shape that background. Add a bit more detail and retry.",
        };
      }

      const gaps: SkillGap[] = parsed.gaps
        .map((gap) => ({
          skill: gap.skill.trim(),
          why: gap.why.trim(),
          action: gap.action.trim(),
        }))
        .filter((gap) => gap.skill)
        .slice(0, 3);

      const seen = new Set<string>();
      const recommendations: OssRecommendation[] = [];
      for (const rec of parsed.recommendations) {
        const url = githubUrl(rec.repo, rec.url);
        if (!url || seen.has(url)) continue;
        seen.add(url);
        const repo =
          rec.repo.trim() ||
          url.replace("https://github.com/", "");
        recommendations.push({
          name: rec.name.trim() || repo,
          repo,
          url,
          fit: rec.fit.trim() || "Contribution",
          why: rec.why.trim(),
          closesGap: rec.closesGap.trim(),
        });
        if (recommendations.length >= 5) break;
      }

      const defense: DefenseItem[] = parsed.defense
        .map((item) => ({
          question: item.question.trim(),
          probe: item.probe.trim(),
          answer: item.answer.trim(),
        }))
        .filter((item) => item.question && item.answer)
        .slice(0, 4);

      return { ok: true, resume, gaps, recommendations, defense };
    } catch {
      return {
        ok: false,
        code: "invalid",
        error: "Could not parse the generated resume. Try generating again.",
      };
    }
  });
