import { existsSync } from "node:fs";
import { join } from "node:path";
import { loadEnv } from "vite";
import type { Plugin } from "vite";

/**
 * Dev only. Serves the files in ./api (assets.ts, contact.ts) at /api/assets and
 * /api/contact, so `npm run dev` works without Vercel. On Vercel itself the api
 * folder is deployed automatically and this plugin is not used.
 *
 * Secrets are read from .env.local (or .env) in the project root.
 */
export function apiDevPlugin(): Plugin {
    return {
        name: "local-api-routes",
        apply: "serve",

        configureServer(server) {
            // Make every variable in .env files visible to the handlers as process.env.
            // (Vite reads .env, .env.local, .env.development and .env.development.local from envDir.)
            const envDir = server.config.envDir || server.config.root;
            const fileEnv = loadEnv(server.config.mode, envDir, "");
            Object.assign(process.env, fileEnv);

            // Startup report. It prints variable NAMES only, never values.
            const log = server.config.logger;
            const envFiles = [".env", ".env.local", `.env.${server.config.mode}`, `.env.${server.config.mode}.local`].filter(
                (name) => existsSync(join(envDir, name))
            );
            const required = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET", "RESEND_API_KEY"];
            log.info(`[api] Looking for env files in ${envDir}`);
            log.info(`[api] Found: ${envFiles.length ? envFiles.join(", ") : "none"}`);
            log.info(`[api] ${required.map((k) => `${k} ${process.env[k] ? "OK" : "MISSING"}`).join(" | ")}`);
            const lookalikes = Object.keys(fileEnv).filter(
                (k) => /cloudinary|resend/i.test(k) && !required.includes(k)
            );
            if (lookalikes.length) {
                log.warn(`[api] Related names that don't match exactly: ${lookalikes.join(", ")}`);
            }

            server.middlewares.use(async (req, res, next) => {
                const url = new URL(req.url ?? "/", "http://localhost");
                const match = url.pathname.match(/^\/api\/([\w-]+)$/);
                if (!match) return next();

                const sendJson = (status: number, payload: unknown) => {
                    res.statusCode = status;
                    res.setHeader("Content-Type", "application/json");
                    res.end(JSON.stringify(payload));
                };

                let handler: ((req: unknown, res: unknown) => Promise<void> | void) | undefined;

                // 1) Is the file where we expect it? If not, say exactly where we looked.
                const file = join(server.config.root, "api", `${match[1]}.ts`);
                if (!existsSync(file)) {
                    return sendJson(404, {
                        error: `Expected a file at ${file} but it isn't there.`,
                        hint: "The api folder must sit next to package.json (the folder Vite runs from), and the file must be named exactly " + `${match[1]}.ts.`,
                    });
                }

                // 2) The file exists. If loading it fails, that is a different problem, so show the real reason.
                try {
                    const mod = await server.ssrLoadModule(`/api/${match[1]}.ts`);
                    handler = mod.default;
                } catch (err) {
                    console.error(`api/${match[1]}.ts failed to load:`, err);
                    return sendJson(500, {
                        error: `api/${match[1]}.ts exists but failed to load: ${err instanceof Error ? err.message : String(err)}`,
                    });
                }
                if (typeof handler !== "function") {
                    return sendJson(500, { error: `api/${match[1]}.ts has no default export.` });
                }

                try {
                    // Read the body, and parse it the way Vercel does for JSON requests.
                    let raw = "";
                    for await (const chunk of req) raw += typeof chunk === "string" ? chunk : new TextDecoder().decode(chunk);
                    let body: unknown = raw;
                    if ((req.headers["content-type"] ?? "").includes("application/json")) {
                        try {
                            body = raw ? JSON.parse(raw) : {};
                        } catch {
                            body = {};
                        }
                    }

                    const apiRes = {
                        status(code: number) {
                            res.statusCode = code;
                            return apiRes;
                        },
                        setHeader(name: string, value: string) {
                            res.setHeader(name, value);
                        },
                        json(payload: unknown) {
                            res.setHeader("Content-Type", "application/json");
                            res.end(JSON.stringify(payload));
                        },
                    };

                    await handler({ method: req.method, body, headers: req.headers }, apiRes);
                } catch (err) {
                    console.error(`api/${match[1]} crashed:`, err);
                    if (!res.writableEnded) sendJson(500, { error: "The API function crashed. See the terminal." });
                }
            });
        },
    };
}