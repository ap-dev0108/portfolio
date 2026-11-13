interface NavLink {
  label: string;
  href: string;
}

// Keep this in the same order the sections appear on the page.
// Each href needs a matching id on its section, for example
// <section id="work"> on Selected Works (the contact section already has id="contact").
const NAV_LINKS: NavLink[] = [
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

const EMAIL = "aryanpradhan773@gmail.com";

const focusRing =
  "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-pink-400";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t-2 border-gray-700 bg-black px-5 py-12 text-white sm:px-8 lg:px-16">
      <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-[1fr_auto_1fr]">
        {/* Name doubles as a way back to the top of the page */}
        <a
          href="#"
          aria-label="Aryan Pradhan, back to top"
          className={`justify-self-start font-['Bungee',sans-serif] text-2xl uppercase tracking-wide sm:text-3xl ${focusRing}`}
        >
          Aryan Pradhan
        </a>

        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-8 gap-y-3">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <a
                  href={href}
                  className={`font-['Open_Sans',sans-serif] text-sm font-bold uppercase tracking-wider text-gray-400 underline-offset-8 hover:text-white hover:underline hover:decoration-2 ${focusRing}`}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="font-['Lora',serif] md:justify-self-end md:text-right">
          <a
            href={`mailto:${EMAIL}`}
            className={`text-lg text-gray-300 underline-offset-4 hover:text-white hover:underline ${focusRing}`}
          >
            {EMAIL}
          </a>
          <p className="mt-1 text-sm text-gray-400">© {year} Aryan Pradhan</p>
        </div>
      </div>
    </footer>
  );
}