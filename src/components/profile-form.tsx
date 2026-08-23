import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EXPERIENCE_LEVELS, PERSONAS, type Persona, type ProfileInput } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  value: ProfileInput;
  onChange: (next: ProfileInput) => void;
  onSubmit: () => void;
  onSample: () => void;
  onReset: () => void;
  loading: boolean;
  error: string | null;
};

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

export function ProfileForm({
  value,
  onChange,
  onSubmit,
  onSample,
  onReset,
  loading,
  error,
}: Props) {
  function patch<K extends keyof ProfileInput>(key: K, next: ProfileInput[K]) {
    onChange({ ...value, [key]: next });
  }

  function setPersona(persona: Persona) {
    const next: ProfileInput = { ...value, persona };
    if (persona === "student" && !["intern", "junior"].includes(value.experienceLevel)) {
      next.experienceLevel = "intern";
    }
    onChange(next);
  }

  const levelOptions =
    value.persona === "student"
      ? EXPERIENCE_LEVELS.filter(
          (level) => level.value === "intern" || level.value === "junior",
        )
      : EXPERIENCE_LEVELS;

  const isStudent = value.persona === "student";

  return (
    <form
      className="flex flex-col lg:min-h-0 lg:flex-1"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <fieldset
        disabled={loading}
        className="flex flex-col gap-5 px-4 py-6 disabled:opacity-70 sm:px-6 lg:min-h-0 lg:flex-1 lg:overflow-y-auto"
      >
        <div
          role="radiogroup"
          aria-label="Persona"
          className="grid grid-cols-2 gap-1 rounded-lg bg-raised p-1 shadow-border"
        >
          {PERSONAS.map((persona) => {
            const selected = value.persona === persona.value;
            return (
              <button
                key={persona.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setPersona(persona.value)}
                className={cn(
                  "h-11 rounded-md px-2 text-sm font-medium transition-[background-color,color,opacity] duration-150",
                  selected
                    ? "bg-accent text-accent-fg"
                    : "text-muted hover:text-fg",
                )}
              >
                {persona.value === "student"
                  ? "Student / Fresh grad"
                  : "Experienced"}
              </button>
            );
          })}
        </div>
        <Field id="name" label="Full name">
          <Input
            id="name"
            name="name"
            autoComplete="name"
            placeholder="Jordan Lee"
            value={value.name}
            onChange={(e) => patch("name", e.target.value)}
            required
          />
        </Field>

        <Field id="email" label="Email">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@email.com"
            value={value.email}
            onChange={(e) => patch("email", e.target.value)}
            required
          />
        </Field>

        <Field id="phone" label="Phone number">
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+1 (555) 0100"
            value={value.phone}
            onChange={(e) => patch("phone", e.target.value)}
            required
          />
        </Field>

        <Field id="links" label="Portfolio / Links">
          <Input
            id="links"
            name="links"
            placeholder="yoursite.dev, linkedin.com/in/you, github.com/you"
            value={value.links}
            onChange={(e) => patch("links", e.target.value)}
          />
        </Field>

        <Field id="location" label="Location">
          <Input
            id="location"
            name="location"
            autoComplete="address-level2"
            placeholder="Austin, TX"
            value={value.location}
            onChange={(e) => patch("location", e.target.value)}
          />
        </Field>

        <Field id="targetRole" label="Target role">
          <Input
            id="targetRole"
            name="targetRole"
            placeholder="Frontend Engineer"
            value={value.targetRole}
            onChange={(e) => patch("targetRole", e.target.value)}
          />
        </Field>

        <Field id="skills" label="Skills">
          <Input
            id="skills"
            name="skills"
            placeholder="TypeScript, React, Node.js, PostgreSQL"
            value={value.skills}
            onChange={(e) => patch("skills", e.target.value)}
            required
          />
        </Field>

        <Field id="experienceLevel" label="Experience level">
          <select
            id="experienceLevel"
            name="experienceLevel"
            value={value.experienceLevel}
            onChange={(e) =>
              patch(
                "experienceLevel",
                e.target.value as ProfileInput["experienceLevel"],
              )
            }
            className={cn(
              "flex h-11 w-full rounded-sm bg-raised px-3 text-sm text-fg shadow-border",
              "transition-[box-shadow] duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
            suppressHydrationWarning
          >
            {levelOptions.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </Field>

        <Field id="bio" label="Raw background">
          <Textarea
            id="bio"
            name="bio"
            placeholder={
              isStudent
                ? "Course projects, internships, hackathons, clubs. We reframe them as architecture, schema, APIs, and performance."
                : "Paste a rough bio, job history, or notes. We rewrite daily work into XYZ bullets — no need to polish first."
            }
            value={value.bio}
            onChange={(e) => patch("bio", e.target.value)}
            required
            minLength={20}
            maxLength={2500}
          />
          <p className="text-xs text-subtle tabular-nums">
            {value.bio.length}/2500
          </p>
        </Field>

        <Field id="jobDescription" label="Target job description">
          <Textarea
            id="jobDescription"
            name="jobDescription"
            className="min-h-48"
            placeholder="Paste the full job posting. We tailor bullets to the overlap and flag 2–3 skills you still need."
            value={value.jobDescription}
            onChange={(e) => patch("jobDescription", e.target.value)}
            required
            minLength={40}
            maxLength={6000}
          />
          <p className="text-xs text-subtle tabular-nums">
            {value.jobDescription.length}/6000
          </p>
        </Field>
      </fieldset>

      {error ? (
        <p
          role="alert"
          className="mx-4 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger shadow-border sm:mx-6"
        >
          {error}
        </p>
      ) : null}

      <div className="shrink-0 border-t border-line bg-bg px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-2">
          <Button type="submit" size="lg" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Comparing…
              </>
            ) : (
              "Close the gaps"
            )}
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={loading}
              onClick={onSample}
            >
              Load sample
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              disabled={loading}
              onClick={onReset}
            >
              Clear
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
