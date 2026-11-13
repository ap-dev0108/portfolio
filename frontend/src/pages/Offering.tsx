import type { ReactNode } from "react";

interface Offering {
  id: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  icon: ReactNode;
}

/* Inline icons (Lucide paths) so the component has no dependencies. */
const iconProps = {
  width: 28,
  height: 28,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const CodeIcon = () => (
  <svg {...iconProps}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const MonitorIcon = () => (
  <svg {...iconProps}>
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const ServerIcon = () => (
  <svg {...iconProps}>
    <rect x="2" y="2" width="20" height="8" rx="2" />
    <rect x="2" y="14" width="20" height="8" rx="2" />
    <line x1="6" y1="6" x2="6.01" y2="6" />
    <line x1="6" y1="18" x2="6.01" y2="18" />
  </svg>
);

// Edit copy and links here. Add a fourth entry (for example "Website builds"
// for WordPress and Wix work) and the grid adapts.
const OFFERINGS: Offering[] = [
  {
    id: "fullstack",
    title: "Full-stack development",
    description:
      "End-to-end web applications, from the interface to the database. I build with React and TypeScript on the front, ASP.NET Core and PostgreSQL behind it, and ship everything in Docker.",
    cta: "Start a web app",
    href: "#contact",
    icon: <CodeIcon />,
  },
  {
    id: "frontend",
    title: "Frontend engineering",
    description:
      "Responsive, accessible interfaces built from your Figma designs. React and TypeScript for applications, WordPress or Wix when your team needs to edit the site themselves.",
    cta: "Get a frontend built",
    href: "#contact",
    icon: <MonitorIcon />,
  },
  {
    id: "backend",
    title: "Backend architecture",
    description:
      "REST APIs and services that stay fast and secure as they grow. Database modeling and query tuning in PostgreSQL, written in C# with ASP.NET Core or in Go.",
    cta: "Plan an API",
    href: "#contact",
    icon: <ServerIcon />,
  },
];

export default function WhatImOffering() {
  return (
    <section id="services"
      aria-labelledby="offering-heading"
      className="bg-gray-100 px-5 py-20 sm:px-8 lg:px-16"
    >
      <h2
        id="offering-heading"
        className="text-center font-['Bungee',sans-serif] text-4xl uppercase tracking-wide text-black sm:text-6xl"
      >
        What I’m offering
      </h2>

      <ul className="mx-auto mt-14 grid max-w-7xl gap-10 lg:grid-cols-3 lg:gap-12">
        {OFFERINGS.map((item) => (
          <li key={item.id} className="flex">
            {/* Same card language as the Journey section: square corners,
                2px border, hard offset shadow. flex-col + mt-auto on the
                button keeps every card the same height with CTAs aligned. */}
            <article className="flex w-full flex-col border-2 border-black bg-white p-8 shadow-[8px_8px_0_#000]">
              <div className="flex h-16 w-16 items-center justify-center bg-black text-white">
                {item.icon}
              </div>

              <h3 className="mt-8 font-['Open_Sans',sans-serif] text-2xl font-bold text-black">
                {item.title}
              </h3>

              <p className="mt-4 font-['Lora',serif] text-lg leading-relaxed text-gray-600">
                {item.description}
              </p>

              <a
                href={item.href}
                className={[
                  "mt-4 inline-flex w-fit items-center self-start border-2 border-black bg-black px-6 py-3",
                  "font-['Open_Sans',sans-serif] text-sm font-bold text-white",
                  "shadow-[4px_4px_0_#9ca3af] transition-[transform,box-shadow] duration-150",
                  "hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#9ca3af]",
                  "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-pink-400",
                  "motion-reduce:transition-none",
                ].join(" ")}
              >
                {item.cta}
              </a>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}