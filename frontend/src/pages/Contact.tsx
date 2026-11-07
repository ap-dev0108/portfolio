import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent, ReactNode } from "react";

/* -------------------------------------------------------------------------- */
/*  Resumes                                                                    */
/* -------------------------------------------------------------------------- */

interface Resume {
  id: string;
  label: string;
  note: string;
  /** Put the PDFs in your public folder, e.g. public/resumes/. It must be a
   *  same-origin path: browsers ignore the `download` attribute for other sites. */
  file: string;
  /** The file name the visitor's browser saves it as. */
  downloadName: string;
}

// Example labels. Rename them to match the resumes you actually have.
const RESUMES: Resume[] = [
  {
    id: "wordpress",
    label: "Wordpress developer",
    note: "Wordpress",
    file: "C:/Users/aryan/Downloads/Aryan_Pradhan_Wordpress_Developer.pdf",
    downloadName: "Aryan-Pradhan-Wordpress-Resume.pdf",
  },
  {
    id: "DotNet",
    label: "DotNet developer",
    note: "C#, ASP.NET Core, SQL Server",
    file: "C:\\Users\\aryan\\Downloads\\Aryan_Pradhan_Junior_Dotnet_Fullstack_Developer.pdf",
    downloadName: "Aryan-Pradhan-DotNet-Resume.pdf",
  },
];

/* -------------------------------------------------------------------------- */
/*  Icons                                                                      */
/* -------------------------------------------------------------------------- */

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const DownloadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" {...stroke}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const ChevronIcon = ({ className = "" }: { className?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" className={className} {...stroke}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const PdfBadge = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden fill="none">
    <path
      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
      fill="currentColor"
      opacity="0.9"
    />
    <path d="M14 2v6h6" stroke="#000" strokeWidth="1.5" strokeLinejoin="round" />
    <text
      x="12"
      y="18"
      textAnchor="middle"
      fontSize="5.5"
      fontWeight="700"
      fill="#000"
      fontFamily="Bungee, sans-serif"
    >
      PDF
    </text>
  </svg>
);

/* -------------------------------------------------------------------------- */
/*  Resume picker                                                              */
/* -------------------------------------------------------------------------- */

const buttonClass = [
  "inline-flex items-center gap-3 border-2 border-white bg-black px-6 py-4",
  "font-['Open_Sans',sans-serif] text-lg font-bold text-white",
  "shadow-[6px_6px_0_#fff] transition-[transform,box-shadow] duration-150 motion-reduce:transition-none",
  "hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#fff]",
  "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-pink-400",
].join(" ");

function ResumePicker() {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  // Close when the visitor clicks or taps anywhere else.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape" && open) {
      setOpen(false);
      buttonRef.current?.focus();
    }
  };

  // With only one resume there is nothing to choose, so download it directly.
  if (RESUMES.length === 1) {
    const [only] = RESUMES;
    return (
      <a href={only.file} download={only.downloadName} type="application/pdf" className={buttonClass}>
        <DownloadIcon />
        Download resume
      </a>
    );
  }

  return (
    <div ref={wrapperRef} onKeyDown={onKeyDown} className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className={buttonClass}
      >
        <DownloadIcon />
        Download resume
        <ChevronIcon className={`transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          id={panelId}
          // In flow on small screens (so it can't spill into the next section),
          // floating under the button on large ones.
          className="mt-6 w-full max-w-sm border-2 border-white bg-black shadow-[6px_6px_0_#fff] lg:absolute lg:left-0 lg:top-full lg:z-20 lg:w-80"
        >
          <p className="border-b-2 border-white px-4 py-3 font-['Open_Sans',sans-serif] text-sm font-bold text-gray-300">
            Choose a version
          </p>
          <ul>
            {RESUMES.map((r) => (
              <li key={r.id} className="border-b-2 border-gray-700 last:border-b-0">
                <a
                  href={r.file}
                  download={r.downloadName}
                  type="application/pdf"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-4 px-4 py-4 text-white hover:bg-white hover:text-black focus-visible:bg-white focus-visible:text-black focus-visible:outline-none"
                >
                  <span className="flex-none">
                    <PdfBadge size={36} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-['Open_Sans',sans-serif] text-base font-bold">
                      {r.label}
                    </span>
                    <span className="block font-['Lora',serif] text-sm opacity-70">{r.note}</span>
                  </span>
                  <span className="sr-only">(PDF download)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Contact form                                                               */
/* -------------------------------------------------------------------------- */

const ROLE_OPTIONS = ["Company / agency", "Recruiter", "Individual client", "Something else"];
const PURPOSE_OPTIONS = ["Work with me", "Hire me", "Ask a question"];

const fieldClass = [
  "block w-full border-2 border-gray-500 bg-black px-5 py-4 text-white",
  "font-['Open_Sans',sans-serif] text-base placeholder:text-gray-500",
  "focus-visible:border-white focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-pink-400",
].join(" ");

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block font-['Open_Sans',sans-serif] text-sm font-bold uppercase tracking-wide text-white">
        {label}
      </label>
      {children}
    </div>
  );
}

function Select({ id, name, options }: { id: string; name: string; options: string[] }) {
  return (
    <div className="relative">
      <select id={id} name={name} className={`${fieldClass} appearance-none pr-12`}>
        {options.map((o) => (
          <option key={o} value={o} className="bg-black">
            {o}
          </option>
        ))}
      </select>
      <ChevronIcon className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
    </div>
  );
}

type Status = "idle" | "sending" | "sent" | "error";

interface ContactProps {
  endpoint?: string;
}

function ContactForm({ endpoint }: ContactProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (!endpoint) {
      console.warn("ContactAndResume: pass an `endpoint` prop to send messages.");
      setError("This form isn’t connected to an inbox yet.");
      setStatus("error");
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      form.reset();
      setStatus("sent");
    } catch {
      setError("Your message didn’t send. Check your connection and try again.");
      setStatus("error");
    }
  };

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-6">
      <Field id="contact-name" label="Full name">
        <input id="contact-name" name="name" type="text" required autoComplete="name" placeholder="John Doe" className={fieldClass} />
      </Field>

      <Field id="contact-email" label="Email address">
        <input id="contact-email" name="email" type="email" required autoComplete="email" placeholder="john@example.com" className={fieldClass} />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="contact-role" label="I am a…">
          <Select id="contact-role" name="role" options={ROLE_OPTIONS} />
        </Field>
        <Field id="contact-purpose" label="Purpose">
          <Select id="contact-purpose" name="purpose" options={PURPOSE_OPTIONS} />
        </Field>
      </div>

      <Field id="contact-message" label="Message">
        <textarea id="contact-message" name="message" required rows={5} placeholder="Tell me about your project…" className={`${fieldClass} resize-y`} />
      </Field>

      <button
        type="submit"
        disabled={status === "sending"}
        className={[
          "w-full border-2 border-white bg-white px-6 py-5 font-['Bungee',sans-serif] text-lg uppercase tracking-widest text-black",
          "shadow-[8px_8px_0_#6b7280] transition-[transform,box-shadow] duration-150 motion-reduce:transition-none",
          "hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[10px_10px_0_#6b7280]",
          "disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-x-0 disabled:hover:translate-y-0",
          "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-pink-400",
        ].join(" ")}
      >
        {status === "sending" ? "Sending…" : "Send message"}
      </button>

      {/* Announced to screen readers when it changes */}
      <p aria-live="polite" className="min-h-6 font-['Lora',serif] text-base text-gray-300">
        {status === "sent" && "Thanks, your message was sent."}
        {status === "error" && error}
      </p>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/*  Section                                                                    */
/* -------------------------------------------------------------------------- */

export default function ContactAndResume({ endpoint }: ContactProps) {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="bg-black px-5 py-20 text-white sm:px-8 lg:px-16"
    >
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-0">
        <div className="lg:pr-16">
          <h2
            id="contact-heading"
            className="font-['Bungee',sans-serif] text-4xl uppercase tracking-wide sm:text-6xl"
          >
            Let’s connect
          </h2>
          <p className="mt-6 max-w-xl font-['Lora',serif] text-xl leading-relaxed text-gray-400">
            Have a project in mind or an opportunity to discuss? Tell me a little about it.
          </p>
          <ContactForm endpoint={endpoint} />
        </div>

        <div className="flex flex-col justify-center border-t-2 border-gray-700 pt-12 lg:border-l-2 lg:border-t-0 lg:pl-16 lg:pt-0">
          <span className="text-gray-400">
            <PdfBadge size={72} />
          </span>
          <h3 className="mt-6 font-['Bungee',sans-serif] text-3xl uppercase tracking-wide">
            Grab my resume
          </h3>
          <p className="mt-4 max-w-sm font-['Lora',serif] text-lg leading-relaxed text-gray-400">
            Pick the version that fits the role. Each covers my skills, experience and education.
          </p>
          <div className="mt-8">
            <ResumePicker />
          </div>
        </div>
      </div>
    </section>
  );
}