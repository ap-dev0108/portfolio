import { useEffect, useId, useRef, useState } from "react";
import Button from "../ui/Button";

const ITEMS = [
    { heading: "Work", count: 6, url: "/" },
    { heading: "Services", count: 3, url: "/services" },
    { heading: "Experience", count: 1, url: "/experience" },
    { heading: "Contact", count: 2, url: "/contact" },
];

const focusRing =
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black";

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const menuId = useId();
    const toggleRef = useRef<HTMLButtonElement>(null);

    // Escape closes the menu and returns focus to the toggle.
    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setOpen(false);
                toggleRef.current?.focus();
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [open]);

    // If the window grows into the desktop layout, reset the mobile menu.
    useEffect(() => {
        const mq = window.matchMedia("(min-width: 1024px)");
        const onChange = (e: MediaQueryListEvent) => e.matches && setOpen(false);
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, []);

    return (
        <header className="relative w-full bg-white">
            {/*
              Below lg: two columns (availability | CTA + menu toggle).
              From lg: three columns (1fr auto 1fr), which keeps the links
              truly centered no matter how wide the side items are.
            */}
            <div className="mx-auto grid h-20 max-w-screen-2xl grid-cols-[1fr_auto] items-center gap-4 px-5 sm:px-8 lg:h-[120px] lg:grid-cols-[1fr_auto_1fr] lg:px-10 xl:px-20">
                <Availability />

                <nav aria-label="Main" className="hidden lg:block">
                    <ul className="flex items-center gap-6 xl:gap-8">
                        {ITEMS.map((item) => (
                            <li key={item.url}>
                                <a
                                    href={item.url}
                                    className={`text-black underline-offset-8 hover:underline ${focusRing}`}
                                >
                                    {item.heading}
                                    <Count value={item.count} />
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="flex items-center justify-end gap-3">
                    {/* From sm up the CTA lives in the bar; below that it moves into the menu. */}
                    <div className="hidden sm:block">
                        <Button label="Let's Talk"/>
                    </div>

                    <button
                        ref={toggleRef}
                        type="button"
                        aria-expanded={open}
                        aria-controls={menuId}
                        aria-label={open ? "Close menu" : "Open menu"}
                        onClick={() => setOpen((o) => !o)}
                        className={`flex h-11 w-11 items-center justify-center rounded-full border border-[#1A1A1A]/15 text-black lg:hidden ${focusRing}`}
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            aria-hidden="true"
                        >
                            {open ? (
                                <path d="M6 6l12 12M18 6L6 18" />
                            ) : (
                                <path d="M4 7h16M4 12h16M4 17h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile and tablet menu */}
            {open && (
                <div
                    id={menuId}
                    className="absolute inset-x-0 top-full z-40 border-t border-[#1A1A1A]/15 bg-white shadow-lg lg:hidden"
                >
                    <nav aria-label="Mobile" className="mx-auto max-w-screen-2xl px-5 sm:px-8">
                        <ul>
                            {ITEMS.map((item) => (
                                <li key={item.url} className="border-b border-[#1A1A1A]/10">
                                    <a
                                        href={item.url}
                                        onClick={() => setOpen(false)}
                                        className={`flex min-h-14 items-center justify-between text-lg text-black ${focusRing}`}
                                    >
                                        <span>{item.heading}</span>
                                        <Count value={item.count} />
                                    </a>
                                </li>
                            ))}
                        </ul>

                        <div className="py-6 sm:hidden [&>a]:w-full [&>button]:w-full">
                            <a href="#contact">
                                <Button label="Let's Talk"/>
                            </a>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}

function Count({ value }: { value: number }) {
    // 60% opacity keeps the count quiet while still passing text contrast on white.
    return <span className="ml-2 text-[#1A1A1A]/60">[{value}]</span>;
}

export function Availability() {
    return (
        <div className="justify-self-start">
            <div className="inline-flex items-center gap-3 whitespace-nowrap rounded-full border border-[#1A1A1A]/15 px-3 py-1.5 text-sm sm:gap-4 sm:px-4 sm:py-2 sm:text-base">
                <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-[#34C759]" />
                <p className="text-black">
                    Available
                    {/* Short on phones, full from md, short again at lg while the links
                        take the space, full again from xl. */}
                    <span className="hidden md:inline lg:hidden xl:inline"> for new projects</span>
                </p>
            </div>
        </div>
    );
}