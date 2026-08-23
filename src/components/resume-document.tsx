import { coalesceLinks, contactParts } from "@/lib/format";
import type {
  ProfileInput,
  ResumeDocument as ResumeDocumentType,
} from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  resume: ResumeDocumentType | null;
  profile: ProfileInput;
  loading: boolean;
};

export function ResumeDocument({ resume, profile, loading }: Props) {
  if (loading) {
    return <ResumeSkeleton />;
  }

  const name = resume?.name || profile.name.trim() || "Your name";
  const headline = resume?.headline || profile.targetRole.trim();
  const contact = contactParts({
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
    links: coalesceLinks(profile),
  });

  if (!resume) {
    return <ResumeEmpty name={name} headline={headline} contact={contact} />;
  }

  return (
    <article id="resume-print-root" className="resume-sheet mx-auto">
      <header>
        <h1>{name}</h1>
        {headline ? <p className="headline">{headline}</p> : null}
        {contact.length > 0 ? (
          <p className="contact-line">{contact.join("  |  ")}</p>
        ) : null}
      </header>

      {resume.summary ? (
        <section>
          <h2>Summary</h2>
          <p>{resume.summary}</p>
        </section>
      ) : null}

      {resume.skills.length > 0 ? (
        <section>
          <h2>Skills</h2>
          {resume.skills.map((group) => (
            <p key={group.category} className="skill-row">
              <strong>{group.category}:</strong> {group.items.join(", ")}
            </p>
          ))}
        </section>
      ) : null}

      {resume.experience.length > 0 ? (
        <section>
          <h2>Experience</h2>
          {resume.experience.map((role, index) => (
            <div
              key={`${role.title}-${role.company}-${index}`}
              className="role-block"
            >
              <h3>{role.title}</h3>
              <p className="role-meta">
                {[role.company, role.location, role.dates]
                  .filter(Boolean)
                  .join("  |  ")}
              </p>
              <ul>
                {role.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ) : null}

      {resume.projects.length > 0 ? (
        <section>
          <h2>Projects</h2>
          {resume.projects.map((project) => (
            <div key={project.name} className="role-block">
              <h3>{project.name}</h3>
              {project.stack ? (
                <p className="role-meta">{project.stack}</p>
              ) : null}
              <ul>
                {project.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ) : null}

      {resume.education.length > 0 ? (
        <section>
          <h2>Education</h2>
          {resume.education.map((ed) => (
            <div key={`${ed.school}-${ed.degree}`} className="role-block">
              <h3>{ed.degree}</h3>
              <p className="role-meta">
                {[ed.school, ed.year].filter(Boolean).join("  |  ")}
              </p>
              {ed.details ? <p>{ed.details}</p> : null}
            </div>
          ))}
        </section>
      ) : null}
    </article>
  );
}

function ResumeEmpty({
  name,
  headline,
  contact,
}: {
  name: string;
  headline: string;
  contact: string[];
}) {
  const hasIdentity = name !== "Your name" || headline || contact.length > 0;

  return (
    <article
      id="resume-print-root"
      className={
        hasIdentity
          ? "resume-sheet mx-auto"
          : "resume-sheet mx-auto flex flex-col justify-center"
      }
    >
      {hasIdentity ? (
        <header>
          <h1>{name}</h1>
          {headline ? <p className="headline">{headline}</p> : null}
          {contact.length > 0 ? (
            <p className="contact-line">{contact.join("  |  ")}</p>
          ) : null}
        </header>
      ) : null}
      <div className={hasIdentity ? "mt-16" : ""}>
        <div className="mx-auto max-w-md text-center">
          <p className="font-headline text-2xl font-medium tracking-tight text-ink">
            {hasIdentity ? "Body copy appears after you generate." : "Your resume lands here."}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            Contact details update as you type. Generate to rewrite your
            background into action-oriented bullets. This sheet is what the
            PDF exports — single column, standard fonts, text-selectable.
          </p>
          <p className="mt-6 text-xs tracking-mark text-ink-muted uppercase">
            Single column · Arial · No tables
          </p>
        </div>
      </div>
    </article>
  );
}

function ResumeSkeleton() {
  return (
    <article
      id="resume-print-root"
      className="resume-sheet mx-auto"
      aria-busy="true"
      aria-label="Writing resume"
    >
      <Skeleton className="mb-2 h-8 w-64 bg-rule" />
      <Skeleton className="mb-4 h-4 w-48 bg-rule" />
      <Skeleton className="mb-8 h-3 w-full max-w-md bg-rule" />
      <Skeleton className="mb-3 h-3 w-24 bg-rule" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full bg-rule" />
        <Skeleton className="h-3 w-11/12 bg-rule" />
        <Skeleton className="h-3 w-4/5 bg-rule" />
      </div>
      <Skeleton className="mt-8 mb-3 h-3 w-20 bg-rule" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full bg-rule" />
        <Skeleton className="h-3 w-5/6 bg-rule" />
        <Skeleton className="h-3 w-2/3 bg-rule" />
      </div>
      <Skeleton className="mt-8 mb-3 h-3 w-28 bg-rule" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full bg-rule" />
        <Skeleton className="h-3 w-10/12 bg-rule" />
        <Skeleton className="h-3 w-9/12 bg-rule" />
        <Skeleton className="h-3 w-8/12 bg-rule" />
      </div>
    </article>
  );
}