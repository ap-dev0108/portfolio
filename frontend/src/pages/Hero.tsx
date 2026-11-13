import Button from "../components/ui/Button";
import { useCloudinaryAssets } from "../services/UseCloudinaryService";
import { heroImageProps } from "../../api/cloudinary";
import githubIcon from "../images/akar-icons--github-outline-fill.png";
import linkedInIcon from "../images/akar-icons--linkedin-box-fill.png";

const SOCIAL_LINKS = [
    {
        name: "GitHub",
        url: "https://github.com/ap-dev0108",
        icon: githubIcon
    },
    {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/aryan-pradhan-a4a0b03a3/",
        icon: linkedInIcon,
    },
];

const focusRing =
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black";

// From md up, the picture is capped so the whole hero still fits in one screen.
const heroImageClass = "h-[550px] w-[480px] overflow-hidden object-cover md:max-h-[calc(100svh-15rem)] ml-[30px] mt-auto";

export default function Hero() {
    // The hero picture comes from Cloudinary (tag: portfolio-hero) through /api/assets.
    const { data, error } = useCloudinaryAssets();
    console.log(data, error);
    const hero = data?.hero;
    // If Cloudinary can't be reached, or no image is tagged yet, fall back to the local file.
    const useLocalFallback = Boolean(error) || (data !== undefined && !hero);

    return (
        <section
            className={[
                "mx-auto flex w-full max-w-screen-2xl flex-col justify-center overflow-x-clip ",
                // Exactly one screen tall at minimum. `svh` ignores the phone browser's
                // collapsing address bar. On a very short window the content can still
                // grow past the screen instead of being clipped.
                "min-h-svh",
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
                        <a href="#contact">
                            <Button label="Let's Collaborate" />
                        </a>
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

                {/* -mt-[50px] pulls the picture up from md. On phones it would overlap the links above. */}
                <div className="mx-auto w-full max-w-xs sm:max-w-sm md:col-start-2 md:row-span-2 md:row-start-1 md:-mt-[50px] md:max-w-none lg:col-start-2 lg:row-span-1">
                    {/* Describe the picture here if it carries meaning beyond decoration.
                        The name in the heading already identifies the page, so empty alt is fine. */}
                    {data && hero ? (
                        <img
                            {...heroImageProps(data.cloudName, hero)}
                            alt=""
                            fetchPriority="high"
                            decoding="async"
                            className={heroImageClass}
                            width={600}
                            height={630}
                        />
                    ) : useLocalFallback ? (
                        <img
                            src="/hero.png"
                            alt=""
                            width={600}
                            height={630}
                            decoding="async"
                            className={heroImageClass}
                        />
                    ) : (
                        // Hold the space while the asset list loads, so nothing jumps.
                        <div aria-hidden="true" className="aspect-[570/600] w-full" />
                    )}
                </div>
            </div>
        </section>
    );
}