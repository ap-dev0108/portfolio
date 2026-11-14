import { useMemo, useState } from "react";
// Adjust these paths to wherever this file lives relative to src/.
import { useCloudinaryAssets } from "../services/UseCloudinaryService";
import { workImageProps } from "../../api/cloudinary";
import type { WorkImage } from "../../api/cloudinary";

type Platform = "wordpress" | "wix" | "react" | "dotnet" | "springboot";
type Filter = "all" | Platform;

interface Project {
  id: string;
  title: string;
  /** Leave undefined until the live URL exists; the card then renders as a non-link. */
  href?: string;
  /** The Cloudinary file name must match `id` (e.g. "tisc"), tagged "portfolio-work". */
  imageAlt: string;
  categories: Platform[]; // a project can match more than one filter
  inProgress?: boolean;
}

const PLATFORM_LABEL: Record<Platform, string> = {
  wordpress: "WordPress",
  wix: "Wix",
  react: "React",
  dotnet: ".NET",
  springboot: "Spring Boot",
};

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "wordpress", label: PLATFORM_LABEL.wordpress },
  { value: "wix", label: PLATFORM_LABEL.wix },
  { value: "react", label: PLATFORM_LABEL.react },
  { value: "dotnet", label: PLATFORM_LABEL.dotnet },
  { value: "springboot", label: PLATFORM_LABEL.springboot },
];

const PROJECTS: Project[] = [
  {
    id: "gravity-nepal",
    title: "Gravity Nepal",
    href: "https://gravitynepal.com",
    imageAlt: "Gravity Nepal website",
    categories: ["wordpress"],
  },
  {
    id: "prudent-meditech",
    title: "Prudent Meditech",
    href: "https://prudentmeditech.com",
    imageAlt: "Prudent Meditech website",
    categories: ["wordpress"],
  },
  {
    id: "Saasentials",
    title: "SaaSentials",
    href: "https://www.wix.com/marketplace/template/view/listing/4a3a3e63-09c5-4af8-a220-dd3a63eb04ab?entry=gallery_page",
    imageAlt: "SaaSentials Wix template",
    categories: ["wix"],
  },
  {
    id: "tisc",
    title: "Tisc",
    href: "https://tisc.ge",
    imageAlt: "Tisc website",
    categories: ["wix"],
  },
  {
    id: "think-health",
    title: "ThinkHealth",
    href: "https://thinkhealth.in",
    imageAlt: "ThinkHealth website",
    categories: ["wix"],
  },
  {
    id: "ordergaram",
    title: "Ordergaram",
    imageAlt: "Ordergaram app",
    categories: ["dotnet"],
    inProgress: true,
  },
  {
    id: "chatly",
    title: "Chatly",
    imageAlt: "Chatly app",
    categories: ["springboot"],
    inProgress: true,
  },
];

function ProjectImage({
  image,
  cloudName,
  pending,
  alt,
}: {
  image?: WorkImage;
  cloudName?: string;
  pending: boolean;
  alt: string;
}) {
  const [failed, setFailed] = useState(false);

  // While the asset list is loading, hold the space with a quiet skeleton
  // so the card doesn't flash "coming soon" for a second.
  if (pending) {
    return (
      <div
        aria-hidden="true"
        className="m-6 mt-12 aspect-[4/3] bg-neutral-100 motion-safe:animate-pulse"
      />
    );
  }

  if (!image || !cloudName || failed) {
    return (
      <div
        role="img"
        aria-label={`${alt} (screenshot coming soon)`}
        className="m-6 mt-12 flex aspect-[4/3] items-center justify-center border-2 border-dashed border-neutral-400 bg-neutral-100 text-center font-['Open_Sans',sans-serif] text-sm text-neutral-500"
      >
        Screenshot coming soon
      </div>
    );
  }

  return (
    <div className="p-6 pt-12">
      <img
        {...workImageProps(cloudName, image)}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className="aspect-[4/3] w-full object-contain bg-neutral-100"
      />
    </div>
  );
}

function WorkCard({
  project,
  image,
  cloudName,
  pending,
}: {
  project: Project;
  image?: WorkImage;
  cloudName?: string;
  pending: boolean;
}) {
  const body = (
    <>
      <span className="absolute left-3 top-3 bg-black px-2.5 py-1 font-['Bungee',sans-serif] text-[0.7rem] text-white">
        {PLATFORM_LABEL[project.categories[0]]}
      </span>
      {project.inProgress && (
        <span className="absolute right-3 top-3 border-2 border-black bg-white px-2.5 py-1 font-['Bungee',sans-serif] text-[0.7rem] text-black">
          In progress
        </span>
      )}

      <ProjectImage image={image} cloudName={cloudName} pending={pending} alt={project.imageAlt} />

      <span
        className={[
          "px-4 pb-6 text-center font-['Lora',serif] text-2xl italic underline-offset-4",
          project.href ? "group-hover:underline" : "",
        ].join(" ")}
      >
        {project.title}
      </span>
    </>
  );

  const base = "group relative flex h-full flex-col bg-white text-black";

  if (!project.href) {
    return <div className={base}>{body}</div>;
  }

  return (
    <a
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-pink-400`}
    >
      {body}
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

export default function SelectedWorks() {
  const [filter, setFilter] = useState<Filter>("all");
  // Screenshots come from Cloudinary (tag: portfolio-work) through /api/assets.
  const { data: assets, loading: assetsLoading } = useCloudinaryAssets();

  const visible = useMemo(
    () =>
      filter === "all"
        ? PROJECTS
        : PROJECTS.filter((p) => p.categories.includes(filter)),
    [filter]
  );

  return (
    <section id="work"
      aria-labelledby="works-heading"
      className="bg-black px-5 py-20 text-white sm:px-8 lg:px-16 mt-[-60px]"
    >
      {/* Local keyframes so the component works without touching tailwind.config */}
      <style>{`
        @keyframes works-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <h2
        id="works-heading"
        className="text-center font-['Bungee',sans-serif] text-4xl uppercase tracking-wide sm:text-6xl"
      >
        Selected works
      </h2>

      {/* Filter */}
      <div
        role="group"
        aria-label="Filter projects by platform"
        className="mx-auto mt-10 flex max-w-full gap-4 overflow-x-auto px-2 pb-4 pt-1 xl:justify-center"
      >
        {FILTERS.map(({ value, label }) => {
          const active = filter === value;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(value)}
              className={[
                "flex-none border-2 border-white px-6 py-3 font-['Open_Sans',sans-serif] text-sm font-bold uppercase tracking-wider",
                "transition-[transform,box-shadow] duration-150",
                "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-pink-400",
                active
                  ? "bg-white text-black shadow-[6px_6px_0_#fff]"
                  : "bg-black text-white hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#fff]",
              ].join(" ")}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="mx-auto mt-10 grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        {/* Intro card: stays in view while the grid scrolls */}
        <aside className="flex min-h-[320px] flex-col justify-end self-start border-[6px] border-white p-8 shadow-[10px_10px_0_#fff] lg:sticky lg:top-8 lg:min-h-[640px]">
          <h3 className="font-['Open_Sans',sans-serif] text-3xl font-bold leading-tight">
            Recent projects
          </h3>
          <p className="mt-4 font-['Lora',serif] text-lg leading-relaxed text-neutral-400">
            Curated collection of recent projects showcasing full-stack
            development capabilities and design-centric solutions.
          </p>
          {/* Screen readers hear the result count when the filter changes */}
          <p
            aria-live="polite"
            className="mt-6 font-['Bungee',sans-serif] text-xs text-neutral-500"
          >
            Showing {visible.length} of {PROJECTS.length}
          </p>
        </aside>

        {/* Grid */}
        <div className="min-h-[640px]">
          {visible.length === 0 ? (
            <div className="flex h-full min-h-[320px] items-center justify-center border-2 border-dashed border-neutral-600 p-8 text-center">
              <p className="font-['Lora',serif] text-lg text-neutral-400">
                No projects in this category yet. Pick another filter to see
                more work.
              </p>
            </div>
          ) : (
            <ul className="grid auto-rows-fr gap-8 sm:grid-cols-2">
              {visible.map((project) => (
                <li
                  key={project.id}
                  className="motion-safe:[animation:works-in_0.25s_ease-out]"
                >
                  <WorkCard
                    project={project}
                    image={assets?.works[project.id]}
                    cloudName={assets?.cloudName}
                    pending={assetsLoading}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}