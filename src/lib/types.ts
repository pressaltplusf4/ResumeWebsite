export const PERSONAS = [
  { value: "student", label: "Student / Fresh graduate" },
  { value: "professional", label: "Experienced professional" },
] as const;

export type Persona = (typeof PERSONAS)[number]["value"];

export const EXPERIENCE_LEVELS = [
  { value: "intern", label: "Student / Intern" },
  { value: "junior", label: "Junior (0–2 years)" },
  { value: "mid", label: "Mid-level (2–5 years)" },
  { value: "senior", label: "Senior (5–10 years)" },
  { value: "staff", label: "Staff / Principal (10+ years)" },
] as const;

export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number]["value"];

export type ProfileInput = {
  persona: Persona;
  name: string;
  email: string;
  phone: string;
  links: string;
  location: string;
  linkedin: string;
  github: string;
  targetRole: string;
  skills: string;
  experienceLevel: ExperienceLevel;
  bio: string;
  jobDescription: string;
};

export type ResumeContact = {
  email: string;
  phone: string;
  location: string;
  links: string;
  linkedin: string;
  github: string;
};

export type ResumeSkillGroup = {
  category: string;
  items: string[];
};

export type ResumeExperience = {
  title: string;
  company: string;
  location: string;
  dates: string;
  bullets: string[];
};

export type ResumeEducation = {
  degree: string;
  school: string;
  year: string;
  details: string;
};

export type ResumeProject = {
  name: string;
  stack: string;
  bullets: string[];
};

export type ResumeDocument = {
  name: string;
  headline: string;
  contact: ResumeContact;
  summary: string;
  skills: ResumeSkillGroup[];
  experience: ResumeExperience[];
  education: ResumeEducation[];
  projects: ResumeProject[];
};

export type OssRecommendation = {
  name: string;
  repo: string;
  url: string;
  fit: string;
  why: string;
  closesGap: string;
};

export type SkillGap = {
  skill: string;
  why: string;
  action: string;
};

export type DefenseItem = {
  question: string;
  probe: string;
  answer: string;
};

export type RemoteJob = {
  id: number;
  title: string;
  company: string;
  jobType: string;
  publishedAt: string;
  salary: string;
  url: string;
  source: "linkedin" | "remotive";
  location: string;
  listedLabel: string;
};

export type GenerateSuccess = {
  ok: true;
  resume: ResumeDocument;
  gaps: SkillGap[];
  recommendations: OssRecommendation[];
  defense: DefenseItem[];
};

export type GenerateErrorCode =
  | "rate_limit"
  | "unavailable"
  | "invalid"
  | "unknown";

export type GenerateFailure = {
  ok: false;
  code: GenerateErrorCode;
  error: string;
};

export type GenerateResult = GenerateSuccess | GenerateFailure;

export const EMPTY_PROFILE: ProfileInput = {
  persona: "professional",
  name: "",
  email: "",
  phone: "",
  links: "",
  location: "",
  linkedin: "",
  github: "",
  targetRole: "",
  skills: "",
  experienceLevel: "mid",
  bio: "",
  jobDescription: "",
};
