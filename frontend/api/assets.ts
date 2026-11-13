/**
 * GET /api/assets   (Vercel Function)
 *
 * Asks Cloudinary which resumes (PDFs) and project screenshots (PNGs) you have
 * and returns them as JSON for the site. The API secret stays on the server;
 * the browser only ever sees public delivery details.
 *
 * Environment variables (Vercel project settings, never prefix them with VITE_):
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 *
 * How assets are found: by TAG, which works in both Cloudinary folder modes.
 *   Resumes:   tag "portfolio-resume"  (PDF files)
 *   Projects:  tag "portfolio-work"    (PNG files)
 *   Hero:      tag "portfolio-hero"    (one image; if several are tagged, the newest wins)
 *
 * Naming:
 *   Project images: matched to the project id used in SelectedWorks.tsx
 *     ("gravity-nepal", "tisc", "reserved-for-you", ...). Either:
 *       - set Contextual metadata  project = tisc   (works whatever the file is called), or
 *       - name the file so its Public ID ends in the id, e.g. portfolio/tisc.
 *   Resumes: optional "Contextual metadata" in Cloudinary controls how they appear:
 *     label = "Full-stack developer"        (shown as the title)
 *     note  = "React, TypeScript, ASP.NET"  (shown under the title)
 *     order = 1                             (lower numbers come first)
 */

// Vercel provides `process` at runtime. This declaration keeps TypeScript happy
// without installing @types/node. If you install those types, you can delete it.
declare const process: { env: Record<string, string | undefined> };

const TAG_RESUME = "portfolio-resume";
const TAG_WORK = "portfolio-work";
const TAG_HERO = "portfolio-hero";

interface ApiRequest {
    method?: string;
}

interface ApiResponse {
    status(code: number): ApiResponse;
    json(body: unknown): void;
    setHeader(name: string, value: string): void;
}

interface CloudinaryResource {
    public_id: string;
    resource_type: string;
    format?: string;
    version: number;
    bytes?: number;
    width?: number;
    height?: number;
    tags?: string[];
    context?: Record<string, unknown>;
}

/** Contextual metadata comes back as { custom: {...} } or flat, depending on the API version. */
function contextOf(resource: CloudinaryResource): Record<string, string> {
    const ctx = resource.context ?? {};
    const custom = (ctx as { custom?: Record<string, unknown> }).custom ?? ctx;
    return Object.fromEntries(
        Object.entries(custom).filter((entry): entry is [string, string] => typeof entry[1] === "string")
    );
}

const baseName = (publicId: string) => publicId.split("/").pop() ?? publicId;

const prettify = (name: string) => {
    const spaced = name.replace(/[-_]+/g, " ").trim();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ error: "Method not allowed" });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
        console.error("assets: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY or CLOUDINARY_API_SECRET is not set");
        return res.status(500).json({ error: "Cloudinary isn’t configured on the server." });
    }

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/search`, {
            method: "POST",
            headers: {
                Authorization: `Basic ${btoa(`${apiKey}:${apiSecret}`)}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                expression: `tags=${TAG_RESUME} OR tags=${TAG_WORK} OR tags=${TAG_HERO}`,
                max_results: 100,
                with_field: ["context", "tags"],
            }),
        });

        if (!response.ok) {
            console.error("assets: Cloudinary search failed", response.status, await response.text());
            return res.status(502).json({ error: "Couldn’t load assets." });
        }

        const { resources = [] } = (await response.json()) as { resources?: CloudinaryResource[] };

        const resumes = resources
            .filter((r) => r.tags?.includes(TAG_RESUME))
            .map((r) => {
                const ctx = contextOf(r);
                const id = baseName(r.public_id);
                return {
                    id,
                    publicId: r.public_id,
                    resourceType: r.resource_type === "raw" ? "raw" : "image",
                    version: r.version,
                    bytes: r.bytes,
                    label: ctx.label || prettify(id),
                    note: ctx.note || "",
                    order: Number.isFinite(Number(ctx.order)) && ctx.order !== undefined ? Number(ctx.order) : 999,
                };
            })
            .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label))
            .map(({ order: _order, ...rest }) => rest);

        // Keyed by project id (see the header comment for how an image is matched to a project).
        const works: Record<string, { publicId: string; version: number; width?: number; height?: number }> = {};
        for (const r of resources) {
            if (!r.tags?.includes(TAG_WORK)) continue;
            // Match by the "project" context value if you set one, otherwise by file name.
            const key = contextOf(r).project || baseName(r.public_id);
            works[key] = {
                publicId: r.public_id,
                version: r.version,
                width: r.width,
                height: r.height,
            };
        }

        // The hero picture: if more than one image is tagged, use the most recently updated.
        const heroResource = resources
            .filter((r) => r.tags?.includes(TAG_HERO))
            .sort((a, b) => b.version - a.version)[0];
        const hero = heroResource
            ? {
                publicId: heroResource.public_id,
                version: heroResource.version,
                width: heroResource.width,
                height: heroResource.height,
            }
            : undefined;

        // Cache at Vercel's edge so visitors don't each hit Cloudinary's rate-limited Admin API.
        res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=3600");
        return res.status(200).json({ cloudName, resumes, works, hero });
    } catch (err) {
        console.error("assets: request to Cloudinary failed", err);
        return res.status(502).json({ error: "Couldn’t load assets." });
    }
}