import type { ProfileInput } from "./types";

export const SAMPLE_PROFESSIONAL: ProfileInput = {
  persona: "professional",
  name: "Priya Sharma",
  email: "priya.sharma@email.com",
  phone: "+1 (415) 555-0142",
  links: "priyasharma.dev, linkedin.com/in/priyasharma, github.com/priyasharma",
  location: "San Francisco, CA",
  linkedin: "linkedin.com/in/priyasharma",
  github: "priyasharma",
  targetRole: "Full-Stack Engineer",
  skills:
    "TypeScript, React, Node.js, PostgreSQL, Python, Git, REST APIs, automated testing, technical writing",
  experienceLevel: "mid",
  bio: "I spent four years at a fintech startup building the customer dashboard in React and TypeScript, then moved to a climate-tech company where I owned the API layer in Node and Postgres. I mentor juniors, write tests, and care about clear docs. Recently I built an internal CLI that cut deploy time in half. I want to join a team that ships carefully and contributes upstream.",
  jobDescription: `Senior Full-Stack Engineer — Climate Platform

We are hiring a full-stack engineer to own customer-facing product and the services behind it.

Requirements:
- 4+ years with TypeScript, React, and Node.js
- Strong PostgreSQL and REST API design
- Production experience with AWS (ECS or EKS) and infrastructure-as-code
- GraphQL (Apollo) for the customer dashboard
- Kubernetes and container orchestration
- Automated testing and mentoring
- Comfortable writing design docs and reviewing PRs

Nice to have: Python, technical writing, open-source contributions.

You will ship the dashboard, the billing API, and help the team move workloads onto Kubernetes.`,
};

export const SAMPLE_STUDENT: ProfileInput = {
  persona: "student",
  name: "Alex Chen",
  email: "alex.chen@email.com",
  phone: "+1 (617) 555-0194",
  links: "alexchen.dev, github.com/alexchen, linkedin.com/in/alexchen",
  location: "Boston, MA",
  linkedin: "linkedin.com/in/alexchen",
  github: "alexchen",
  targetRole: "New Grad Software Engineer",
  skills:
    "Python, Java, JavaScript, React, SQL, Git, REST APIs, data structures",
  experienceLevel: "intern",
  bio: "CS junior at a state university. Built a campus lost-and-found web app in a software engineering course with three classmates using React and a Flask API plus SQLite. Won a weekend hackathon with a study-planner that used OpenAI to summarize lecture notes. Summer intern at a local clinic where I updated their appointment spreadsheet into a small Python script. TA for intro CS, help students with homework and git.",
  jobDescription: `Software Engineer, New Grad — Product Platform

We hire new graduates who can ship production web services.

Requirements:
- Coursework or internships with a typed language (Java, Python, or TypeScript)
- Understanding of REST APIs, relational databases, and testing
- Ability to discuss system design for a small service: data model, failure modes, performance
- Git, code review, and working in a team
- Bonus: React, cloud (AWS/GCP), Docker, or open-source

You will join a squad that owns an internal API used by the customer dashboard.`,
};

export const SAMPLE_PROFILE = SAMPLE_PROFESSIONAL;

export function sampleForPersona(
  persona: ProfileInput["persona"],
): ProfileInput {
  return persona === "student" ? SAMPLE_STUDENT : SAMPLE_PROFESSIONAL;
}
