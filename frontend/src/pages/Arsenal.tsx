interface Skill {
  name: string;
  /** Shown with a dashed outline so the list stays honest about what's in progress. */
  learning?: boolean;
}

interface SkillGroup {
  id: string;
  label: string;
  skills: Skill[];
}

// Edit this list to match what you can confidently talk about in an interview.
const SKILL_GROUPS: SkillGroup[] = [
  {
    id: "frontend",
    label: "Frontend",
    skills: [
      { name: "TypeScript" },
      { name: "JavaScript" },
      { name: "React" },
      { name: "Tailwind CSS" },
    ],
  },
  {
    id: "backend",
    label: "Backend",
    skills: [
      { name: "C#" },
      { name: "ASP.NET Core" },
      { name: "Go" },
      { name: "Spring Boot", learning: true },
    ],
  },
  {
    id: "data",
    label: "Data and tooling",
    skills: [{ name: "PostgreSQL" }, { name: "Docker" }, { name: "Git" }],
  },
  {
    id: "sites",
    label: "Websites and design",
    skills: [{ name: "WordPress" }, { name: "Wix" }, { name: "Figma" }],
  },
];

const hasLearning = SKILL_GROUPS.some((g) => g.skills.some((s) => s.learning));

export default function TechnicalArsenal() {
  return (
    <section id="skills"
      aria-labelledby="arsenal-heading"
      className="border-y-[6px] border-black bg-white px-5 py-20 sm:px-8 lg:px-16"
    >
      <h2
        id="arsenal-heading"
        className="text-center font-['Bungee',sans-serif] text-4xl uppercase tracking-wide text-black sm:text-6xl"
      >
        Technical arsenal
      </h2>

      {/* Grouped rows: the label column tells a visitor what each cluster is for,
          so the section reads as a map of your skills, not a pile of tags. */}
      <div className="mx-auto mt-14 max-w-4xl">
        {SKILL_GROUPS.map((group) => (
          <section
            key={group.id}
            aria-labelledby={`skills-${group.id}`}
            className="grid gap-4 border-t-2 border-black py-8 first:border-t-0 sm:grid-cols-[11rem_1fr] sm:gap-8"
          >
            <h3
              id={`skills-${group.id}`}
              className="font-['Open_Sans',sans-serif] text-lg font-bold text-black"
            >
              {group.label}
            </h3>

            <ul className="flex flex-wrap gap-x-5 gap-y-6">
              {group.skills.map((skill) => (
                <li
                  key={skill.name}
                  className={[
                    "px-4 py-2 font-['Open_Sans',sans-serif] text-sm font-bold uppercase tracking-wide text-black",
                    skill.learning
                      ? "border-2 border-dashed border-black bg-white"
                      : "border-2 border-black bg-gray-100 shadow-[4px_4px_0_#000]",
                  ].join(" ")}
                >
                  {skill.name}
                  {skill.learning && <span className="sr-only"> (currently learning)</span>}
                </li>
              ))}
            </ul>
          </section>
        ))}

        {hasLearning && (
          <p className="mt-2 border-t-2 border-black pt-6 font-['Lora',serif] text-base text-gray-600">
            A dashed outline marks what I’m currently learning.
          </p>
        )}
      </div>
    </section>
  );
}