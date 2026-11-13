/**
 * Client-side Cloudinary service.
 *
 * Fetches the asset list from /api/assets (which holds the secret) and builds
 * delivery URLs. Nothing in this file needs a key.
 */

export interface ResumeAsset {
    id: string;
    publicId: string;
    resourceType: "image" | "raw"; // PDFs are normally uploaded as "image"
    version: number;
    bytes?: number;
    label: string;
    note: string;
}

export interface WorkImage {
    publicId: string;
    version: number;
    width?: number;
    height?: number;
}

export interface AssetsPayload {
    cloudName: string;
    resumes: ResumeAsset[];
    works: Record<string, WorkImage>;
    hero?: WorkImage;
}

/* -------------------------------------------------------------------------- */
/*  Fetching (one request, shared by every component that asks)                */
/* -------------------------------------------------------------------------- */

let pending: Promise<AssetsPayload> | undefined;

export function fetchAssets(): Promise<AssetsPayload> {
    pending ??= fetch("/api/assets", { headers: { Accept: "application/json" } })
        .then((res) => {
            if (!res.ok) throw new Error(`Assets request failed (${res.status})`);
            return res.json() as Promise<AssetsPayload>;
        })
        .catch((err) => {
            pending = undefined; // let the next caller retry
            throw err;
        });
    return pending;
}

/* -------------------------------------------------------------------------- */
/*  URL builders                                                               */
/* -------------------------------------------------------------------------- */

const delivery = (cloudName: string) => `https://res.cloudinary.com/${cloudName}`;

/** Optimised image: automatic format and quality, never upscaled. */
export function imageUrl(cloudName: string, image: WorkImage, width: number): string {
    return `${delivery(cloudName)}/image/upload/f_auto,q_auto,c_limit,w_${width}/v${image.version}/${image.publicId}`;
}

/** Everything an <img> needs for a sharp, lightweight picture at any screen size. */
export function workImageProps(cloudName: string, image: WorkImage) {
    const widths = [480, 800, 1200];
    return {
        src: imageUrl(cloudName, image, 800),
        srcSet: widths.map((w) => `${imageUrl(cloudName, image, w)} ${w}w`).join(", "),
        sizes: "(min-width: 1024px) 24rem, (min-width: 640px) 45vw, 90vw",
        width: image.width,
        height: image.height,
    };
}

/** Same idea for the hero picture, sized for the hero's column widths. */
export function heroImageProps(cloudName: string, image: WorkImage) {
    const widths = [480, 768, 1200];
    return {
        src: imageUrl(cloudName, image, 768),
        srcSet: widths.map((w) => `${imageUrl(cloudName, image, w)} ${w}w`).join(", "),
        sizes: "(min-width: 1280px) 35rem, (min-width: 1024px) 28rem, (min-width: 768px) 45vw, 20rem",
        width: image.width,
        height: image.height,
    };
}

/**
 * Link that makes the browser SAVE the PDF instead of opening it.
 * The HTML `download` attribute is ignored for files on another domain, so the
 * fl_attachment flag (which sets a download header) is what makes this work.
 */
export function resumeDownloadUrl(cloudName: string, resume: ResumeAsset): string {
    const fileName = resume.id.replace(/[^A-Za-z0-9_-]/g, "-");
    const kind = resume.resourceType === "raw" ? "raw" : "image";
    const ext = resume.resourceType === "raw" ? "" : ".pdf"; // raw public IDs already include it
    return `${delivery(cloudName)}/${kind}/upload/fl_attachment:${fileName}/v${resume.version}/${resume.publicId}${ext}`;
}

export function formatBytes(bytes?: number): string {
    if (!bytes) return "";
    return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}