declare const process: { env: Record<string, string | undefined> };
const TO_EMAIL = process.env.EMAIL ?? "Portfolio Contact <ap01n08@gmail.com>";
const FROM_EMAIL = process.env.CONTACT_FROM ?? "Portfolio Contact <onboarding@resend.dev>";
const OWNER_TIME_ZONE = "Asia/Kathmandu";

type HeaderValue = string | string[] | undefined;

interface ApiRequest {
    method?: string;
    body?: unknown;
    headers: Record<string, HeaderValue>;
}

interface ApiResponse {
    status(code: number): ApiResponse;
    json(body: unknown): void;
    setHeader(name: string, value: string): void;
}

type Row = [label: string, value: string];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const header = (req: ApiRequest, name: string): string => {
    const value = req.headers[name];
    return (Array.isArray(value) ? value[0] : value) ?? "";
};

/** Trim and cap anything that comes from the browser. */
const clip = (value: unknown, max: number): string =>
    typeof value === "string" ? value.trim().slice(0, max) : "";

const escapeHtml = (s: string): string =>
    s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

const safeDecode = (s: string): string => {
    try {
        return decodeURIComponent(s);
    } catch {
        return s;
    }
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Best-effort browser, OS and device from the User-Agent string. */
function parseUserAgent(ua: string) {
    const pick = (pairs: [RegExp, string][]): string => {
        for (const [re, name] of pairs) {
            const m = ua.match(re);
            if (m) return m[1] ? `${name} ${m[1]}` : name;
        }
        return "Unknown";
    };

    // Order matters: Edge and Opera also say "Chrome"; Chrome also says "Safari".
    const browser = pick([
        [/Edg(?:e|A|iOS)?\/([\d.]+)/, "Edge"],
        [/OPR\/([\d.]+)/, "Opera"],
        [/SamsungBrowser\/([\d.]+)/, "Samsung Internet"],
        [/(?:Firefox|FxiOS)\/([\d.]+)/, "Firefox"],
        [/(?:Chrome|CriOS)\/([\d.]+)/, "Chrome"],
        [/Version\/([\d.]+).*Safari/, "Safari"],
    ]);

    // iOS also says "Mac OS X", and Android also says "Linux", so they come first.
    const os = pick([
        [/Windows NT ([\d.]+)/, "Windows NT"],
        [/Android ([\d.]+)/, "Android"],
        [/(?:iPhone|iPad|iPod).*? OS ([\d_]+)/, "iOS"],
        [/Mac OS X ([\d_.]+)/, "macOS"],
        [/CrOS/, "ChromeOS"],
        [/Linux/, "Linux"],
    ])
        .replace(/_/g, ".")
        .replace("Windows NT 10.0", "Windows 10/11");

    const device = /iPad|Tablet|Android(?!.*Mobile)/i.test(ua)
        ? "Tablet"
        : /Mobi|iPhone|Android/i.test(ua)
            ? "Mobile phone"
            : "Desktop or laptop";

    return { browser, os, device };
}

/* -------------------------------------------------------------------------- */
/*  Email template                                                             */
/* -------------------------------------------------------------------------- */

const cell = "padding:12px 16px;border-top:1px solid #e5e7eb;vertical-align:top;font-size:15px;line-height:1.5;";
const labelCell = `${cell}width:170px;color:#6b7280;font-weight:700;font-size:12px;letter-spacing:.06em;text-transform:uppercase;`;
const valueCell = `${cell}color:#111827;white-space:pre-wrap;word-break:break-word;`;

const rowsToHtml = (rows: Row[]) =>
    rows
        .map(
            ([label, value]) =>
                `<tr><td style="${labelCell}">${escapeHtml(label)}</td><td style="${valueCell}">${escapeHtml(value)}</td></tr>`
        )
        .join("");

const rowsToText = (rows: Row[]) => rows.map(([label, value]) => `${label}: ${value}`).join("\n");

function renderEmail(name: string, fields: Row[], details: Row[]) {
    const html = `<!doctype html>
<html>
  <body style="margin:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 12px;">
      <tr><td align="center">
        <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;background:#ffffff;border:2px solid #000000;">
          <tr><td style="background:#000000;color:#ffffff;padding:20px 16px;font-size:20px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">New portfolio message</td></tr>
          <tr><td style="padding:16px;font-size:14px;color:#374151;">Just hit reply to answer ${escapeHtml(name)}.</td></tr>
          <tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rowsToHtml(fields)}</table></td></tr>
          <tr><td style="padding:24px 16px 12px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#000000;border-top:2px solid #000000;">Submission details</td></tr>
          <tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rowsToHtml(details)}</table></td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

    const text = `NEW PORTFOLIO MESSAGE\n\n${rowsToText(fields)}\n\n--- Submission details ---\n${rowsToText(details)}\n`;

    return { html, text };
}

/* -------------------------------------------------------------------------- */
/*  Handler                                                                    */
/* -------------------------------------------------------------------------- */

export default async function handler(req: ApiRequest, res: ApiResponse) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ error: "Method not allowed" });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: "Email isn’t configured on the server." });
    }

    let body: Record<string, unknown> = {};
    try {
        const raw = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
        if (raw && typeof raw === "object") body = raw as Record<string, unknown>;
    } catch {
        return res.status(400).json({ error: "Invalid request." });
    }

    if (clip(body.website, 200)) return res.status(200).json({ ok: true });

    const name = clip(body.name, 100);
    const email = clip(body.email, 200);
    const role = clip(body.role, 60);
    const purpose = clip(body.purpose, 60);
    const message = clip(body.message, 5000);

    if (!name || !email || !message) {
        return res.status(400).json({ error: "Please fill in your name, email and message." });
    }
    if (!EMAIL_RE.test(email)) {
        return res.status(400).json({ error: "That email address doesn’t look right." });
    }

    const now = new Date();
    const receivedOwner = new Intl.DateTimeFormat("en-GB", {
        dateStyle: "full",
        timeStyle: "long",
        timeZone: OWNER_TIME_ZONE,
    }).format(now);
    const receivedUtc = now.toISOString().replace("T", " ").replace(/\.\d+Z$/, " UTC");

    const userAgent = header(req, "user-agent");
    const parsed = parseUserAgent(userAgent);

    const ip = header(req, "x-forwarded-for").split(",")[0].trim() || header(req, "x-real-ip");
    const location = [
        safeDecode(header(req, "x-vercel-ip-city")),
        header(req, "x-vercel-ip-country-region"),
        header(req, "x-vercel-ip-country"),
    ]
        .filter(Boolean)
        .join(", ");

    /* ---- Browser-reported facts ---- */
    const client = (body.client && typeof body.client === "object" ? body.client : {}) as Record<string, unknown>;
    const seconds = Number(client.secondsToFill);
    const timeToFill = Number.isFinite(seconds)
        ? `${seconds}s${seconds < 2 ? " (suspiciously fast, may be a bot)" : ""}`
        : "";

    const fields: Row[] = [
        ["Full name", name],
        ["Email address", email],
        ["I am a…", role],
        ["Purpose", purpose],
        ["Message", message],
    ];

    const details: Row[] = (
        [
            ["Received (Nepal time)", receivedOwner],
            ["Received (UTC)", receivedUtc],
            ["Visitor’s local time", clip(client.localTime, 120)],
            ["Visitor’s time zone", clip(client.timeZone, 60)],
            ["Time spent on form", timeToFill],
            ["Device type", `${parsed.device}${client.touch ? " (touch screen)" : ""}`],
            ["Operating system", parsed.os],
            ["Browser", parsed.browser],
            ["Platform (client hints)", clip(client.platform, 60)],
            ["Browser brands (client hints)", clip(client.brands, 200)],
            ["Screen", clip(client.screen, 60)],
            ["Browser window", clip(client.viewport, 40)],
            ["Color scheme", clip(client.colorScheme, 20)],
            ["Languages", clip(client.languages, 100)],
            ["Connection", clip(client.connection, 20)],
            ["Device memory (GB)", client.deviceMemory ? String(client.deviceMemory).slice(0, 10) : ""],
            ["IP address", ip],
            ["Approximate location", location],
            ["Page", clip(client.pageUrl, 300)],
            ["Referrer", clip(client.referrer, 300)],
            ["Raw user agent", userAgent.slice(0, 400)],
        ] as Row[]
    ).filter(([, value]) => value);

    const { html, text } = renderEmail(name, fields, details);

    // Strip line breaks so nobody can inject extra headers through the subject.
    const subject = `New message from ${name} · ${purpose || "Portfolio"}`.replace(/[\r\n]+/g, " ").slice(0, 150);

    try {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: FROM_EMAIL,
                to: [TO_EMAIL],
                reply_to: email,
                subject,
                html,
                text,
            }),
        });

        if (!response.ok) {
            return res.status(502).json({ error: "The message couldn’t be delivered. Please try again." });
        }

        return res.status(200).json({ ok: true });
    } catch (err) {
        return res.status(502).json({ error: "The message couldn’t be delivered. Please try again." });
    }
}