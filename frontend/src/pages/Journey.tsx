import { useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent } from "react";

type TabId = "experience" | "education";

interface Entry {
  id: string;
  /** ISO year-month. Leave `end` out for something ongoing. */
  period: { start: string; end?: string };
  title: string;
  org: string;
  description: string;
}

const TABS: { id: TabId; label: string }[] = [
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
];

// Newest entry last, so the timeline reads left to right in time order.
const ENTRIES: Record<TabId, Entry[]> = {
  experience: [
    {
      id: "codeyard",
      period: { start: "2024-11", end: "2026-07" },
      title: "Junior Web Developer",
      org: "Codeyard",
      description:
        "Led several website builds from strict Figma designs. Maintained existing sites by auditing them and formulating a plan of action.",
    },
    {
      id: "freelance",
      period: { start: "2026-08" },
      title: "Freelance Web Developer",
      org: "Self-employed",
      description:
        "Building websites for clients on WordPress and Wix, with a focus on accessibility and faithful implementation of their designs.",
    },
  ],
  education: [
    {
      id: "education-placeholder",
      period: { start: "2021-08", end: "2022-04" },
      title: "Secondary Education (+2)",
      org: "V.S. Niketan",
      description: "I completed my secondary education with a degree on computer management",
    },
    {
      id: "bachelors-placeholder",
      period: { start: "2022-10", end: "2026-04" },
      title: "Bachelor's Degree",
      org: "Islington College",
      description: "I completed my bachelor's degree in computer science and information technology",
    }
  ],
};

const dateFormat = new Intl.DateTimeFormat("en", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const formatMonth = (iso: string) => dateFormat.format(new Date(`${iso}-01T00:00:00Z`));

function Period({ start, end }: { start: string; end?: string }) {
  return (
    <p className="font-['Bungee',sans-serif] text-xs text-gray-600">
      <time dateTime={start}>{formatMonth(start)}</time>
      {" – "}
      {end ? <time dateTime={end}>{formatMonth(end)}</time> : "Present"}
    </p>
  );
}

function TimelineItem({ entry, above }: { entry: Entry; above: boolean }) {
  const current = !entry.period.end;

  const stem = <span aria-hidden className="hidden h-8 w-1 bg-black md:block" />;

  return (
    <li
      className={[
        "relative pb-10 pl-8 last:pb-0",
        // Desktop: three rows (card above / line / card below) with the line
        // drawn through the middle of every item so it runs unbroken.
        "md:grid md:grid-rows-[1fr_auto_1fr] md:px-4 md:pb-0 md:pl-4",
        "md:before:absolute md:before:inset-x-0 md:before:top-1/2 md:before:h-1 md:before:-translate-y-1/2 md:before:bg-black md:before:content-['']",
      ].join(" ")}
    >
      {/* Card (with a short stem joining it to the line on desktop) */}
      <div
        className={[
          "md:flex md:flex-col md:items-center",
          above ? "md:row-start-1 md:justify-end" : "md:row-start-3 md:justify-start",
        ].join(" ")}
      >
        {!above && stem}
        <article className="w-full border-2 border-black bg-white p-6 shadow-[8px_8px_0_#000] md:max-w-md">
          <Period {...entry.period} />
          <h3 className="mt-3 font-['Open_Sans',sans-serif] text-2xl font-bold text-black">
            {entry.title}
          </h3>
          <p className="mt-1 font-['Lora',serif] text-lg italic text-gray-700">{entry.org}</p>
          <p className="mt-4 font-['Lora',serif] text-base leading-relaxed text-gray-600">
            {entry.description}
          </p>
        </article>
        {above && stem}
      </div>

      {/* Dot: sits on the vertical line on mobile, on the horizontal line on desktop.
          The current role gets the pink accent so "where I am now" reads at a glance. */}
      <span
        aria-hidden
        className={[
          "absolute -left-[14px] top-2 h-6 w-6 rounded-full",
          "md:relative md:left-auto md:top-auto md:z-10 md:row-start-2 md:mx-auto",
          current ? "bg-pink-400 ring-4 ring-black" : "bg-black",
        ].join(" ")}
      />
    </li>
  );
}

export default function MyJourney() {
  const [tab, setTab] = useState<TabId>("experience");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const entries = ENTRIES[tab];

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const i = TABS.findIndex((t) => t.id === tab);
    let next = i;
    if (e.key === "ArrowRight") next = (i + 1) % TABS.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TABS.length - 1;
    else return;
    e.preventDefault();
    setTab(TABS[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <section id="experience"
      aria-labelledby="journey-heading"
      className="bg-gray-100 px-5 py-20 sm:px-8 lg:px-16"
    >
      <h2
        id="journey-heading"
        className="text-center font-['Bungee',sans-serif] text-4xl uppercase tracking-wide text-black sm:text-6xl"
      >
        My journey
      </h2>

      {/* These are real tabs (they swap whole panels), unlike the filter in Selected Works. */}
      <div
        role="tablist"
        aria-label="Experience or education"
        className="mt-10 flex justify-center gap-4 pb-2"
      >
        {TABS.map(({ id, label }, i) => {
          const active = tab === id;
          return (
            <button
              key={id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              role="tab"
              id={`journey-tab-${id}`}
              aria-selected={active}
              aria-controls={`journey-panel-${id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => setTab(id)}
              onKeyDown={onKeyDown}
              className={[
                "border-2 border-black px-6 py-3 font-['Open_Sans',sans-serif] text-sm font-bold uppercase tracking-wider",
                "transition-[transform,box-shadow] duration-150 motion-reduce:transition-none",
                "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-pink-400",
                active
                  ? "bg-black text-white shadow-[6px_6px_0_#000]"
                  : "bg-white text-black hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000]",
              ].join(" ")}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`journey-panel-${tab}`}
        aria-labelledby={`journey-tab-${tab}`}
        className="mx-auto mt-12 max-w-6xl"
      >
        <ol
          style={{ "--cols": entries.length } as CSSProperties}
          className="ml-3 border-l-4 border-black md:ml-0 md:grid md:border-l-0 md:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]"
        >
          {entries.map((entry, i) => (
            <TimelineItem key={entry.id} entry={entry} above={i % 2 === 0} />
          ))}
        </ol>
      </div>
    </section>
  );
}