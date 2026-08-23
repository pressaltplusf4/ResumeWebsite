export function contactParts(contact: {
  email: string;
  phone: string;
  location: string;
  links?: string;
  linkedin?: string;
  github?: string;
}): string[] {
  const parts: string[] = [];
  if (contact.email) parts.push(contact.email);
  if (contact.phone) parts.push(contact.phone);
  if (contact.location) parts.push(contact.location);

  const linkValues = splitLinks(contact.links);
  if (linkValues.length > 0) {
    for (const link of linkValues) parts.push(stripProtocol(link));
  } else {
    if (contact.linkedin) parts.push(stripProtocol(contact.linkedin));
    if (contact.github) parts.push(githubHandle(contact.github));
  }
  return parts;
}

export function splitLinks(value: string | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(/[\n,|]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function coalesceLinks(profile: {
  links?: string;
  linkedin?: string;
  github?: string;
}): string {
  if (profile.links?.trim()) return profile.links.trim();
  return [profile.linkedin, profile.github]
    .map((item) => item?.trim())
    .filter(Boolean)
    .join(", ");
}

export function stripProtocol(value: string): string {
  return value.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

export function githubHandle(value: string): string {
  const stripped = stripProtocol(value).replace(/^github\.com\//i, "");
  return stripped.startsWith("github.com") ? stripped : `github.com/${stripped}`;
}

export function printResume() {
  if (typeof window === "undefined") return;
  window.print();
}

export function jobSearchQuery(input: {
  targetRole?: string;
  headline?: string;
  jobDescription?: string;
}): string {
  const role = input.targetRole?.trim();
  if (role) return cleanJobTitle(role);
  const headline = input.headline?.trim();
  if (headline) return cleanJobTitle(headline);
  const firstLine = input.jobDescription?.split("\n").find((line) => line.trim());
  if (firstLine) return cleanJobTitle(firstLine);
  return "";
}

export function cleanJobTitle(value: string): string {
  return value
    .split(/[—–|]/)[0]
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

export function postedAgo(iso: string, now = Date.now()): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return "Posted recently";
  const minutes = Math.round((now - then) / 60_000);
  if (minutes < 60) return "Posted today";
  const days = Math.round(minutes / (60 * 24));
  if (days <= 0) return "Posted today";
  if (days === 1) return "Posted 1 day ago";
  if (days < 30) return `Posted ${days} days ago`;
  const months = Math.round(days / 30);
  if (months === 1) return "Posted 1 month ago";
  if (months < 12) return `Posted ${months} months ago`;
  return "Posted over a year ago";
}

export function postedLabel(job: {
  publishedAt: string;
  listedLabel?: string;
}): string {
  const listed = job.listedLabel?.trim();
  if (listed) {
    return /^posted\b/i.test(listed) ? listed : `Posted ${listed}`;
  }
  return postedAgo(job.publishedAt);
}

export function linkedInSearchUrl(query: string, location?: string): string {
  const url = new URL("https://www.linkedin.com/jobs/search/");
  url.searchParams.set("keywords", query);
  if (location?.trim()) url.searchParams.set("location", location.trim());
  url.searchParams.set("f_TPR", "r604800");
  return url.toString();
}
export function formatJobType(value: string): string {
  const map: Record<string, string> = {
    full_time: "Full-time",
    part_time: "Part-time",
    contract: "Contract",
    freelance: "Freelance",
    internship: "Internship",
  };
  if (map[value]) return map[value];
  const cleaned = value.replace(/_/g, " ").trim();
  if (!cleaned) return "Remote";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}
