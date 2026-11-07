import Button from "../components/ui/Button";

const SOCIAL_LINKS = [
    {
        name: "GitHub",
        url: "https://github.com/aryanpradhan",
        icon: "/images/github.png",
    },
    {
        name: "LinkedIn",
        url: "https://linkedin.com/in/aryanpradhan",
        icon: "/images/linkedin.png",
    },
];

const focusRing =
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black";

export default function Hero() {
    return (
        <section
            className={[
                "mx-auto flex w-full max-w-screen-2xl flex-col justify-center overflow-x-clip",
                // Fill the screen under the navbar (80px on small screens, 120px from lg).
                "min-h-[calc(100svh-80px)] lg:min-h-[calc(100svh-120px)]",
                "px-5 py-10 sm:px-8 lg:px-10 xl:px-20",
            ].join(" ")}
        >
            {/*
              Phones: the name stacks on two lines so each word can be large.
              md and up: one line. The size follows the viewport width and stops at 125px.
            */}
            <h1 className="text-[length:min(15vw,6rem)] leading-none md:whitespace-nowrap md:text-[length:min(9vw,125px)] text-center">
                <span className="block font-bungee-outline md:inline">ARYAN</span>{" "}
                <span className="block font-bungee md:inline">PRADHAN</span>
            </h1>

            {/*
              Phones: one column (text, links, image).
              md: two columns (text and links | image).
              lg: three columns (text | image | links).
            */}
            <div className="mt-8 grid gap-8 md:mt-10 md:grid-cols-2 md:items-center lg:grid-cols-[1fr_minmax(0,28rem)_1fr] xl:grid-cols-[1fr_minmax(0,35rem)_1fr]">
                <div className="flex flex-col items-start gap-5 md:col-start-1 md:row-start-1 lg:gap-6">
                    <h2 className="text-2xl font-bold md:text-[32px]">Software Developer</h2>
                    <p className="max-w-sm text-gray-700">
                        Designing and developing digital products
                    </p>
                    {/* Full width on phones, natural width from sm. */}
                    <div className="w-full sm:w-auto [&>*]:w-full sm:[&>*]:w-auto">
                        <Button lable="Let's Collaborate" />
                    </div>
                </div>

                <ul className="flex flex-wrap gap-3 md:col-start-1 md:row-start-2 lg:col-start-3 lg:row-start-1 lg:flex-col lg:justify-self-end lg:gap-4">
                    {SOCIAL_LINKS.map((link) => (
                        <li key={link.url} className="lg:w-full">
                            <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2 rounded-full border border-[#1A1A1A]/15 px-6 py-3 text-base font-medium text-black transition-colors hover:border-black motion-reduce:transition-none lg:px-8 ${focusRing}`}
                            >
                                {/* The visible name labels the link, so the icon is decorative. */}
                                <img src={link.icon} alt="" width={24} height={24} className="h-6 w-6" />
                                {link.name}
                                <span className="sr-only">(opens in a new tab)</span>
                            </a>
                        </li>
                    ))}
                </ul>

                <div className="mx-auto w-full max-w-xs sm:max-w-sm md:col-start-2 md:row-span-2 md:row-start-1 md:max-w-none lg:col-start-2 lg:row-span-1">
                    {/* Describe the picture here if it carries meaning beyond decoration.
                        The name in the heading already identifies the page, so empty alt is fine. */}
                    <img
                        src="/hero.png"
                        alt=""
                        width={570}
                        height={600}
                        fetchPriority="high"
                        decoding="async"
                        className="h-auto w-full object-contain"
                    />
                </div>
            </div>
        </section>
    );
}