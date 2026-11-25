// Public base URL of the site, without a trailing slash. Server-side only.
// Tolerates SITE_URL pasted with a trailing slash, spaces or a newline.
export const siteUrl = (req) =>
  process.env.SITE_URL?.trim().replace(/\/+$/, "") ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.trim()}` : null) ||
  (req ? new URL(req.url).origin : "http://localhost:3000");
