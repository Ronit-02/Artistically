const baseUrl = (process.env.LAUNCH_BASE_URL ?? "http://localhost:3001").replace(/\/$/, "");
const allowNotReady = process.env.ALLOW_NOT_READY === "true";
const maxPublicHtmlBytes = Number(process.env.MAX_PUBLIC_HTML_BYTES ?? 200_000);

const routes = ["/", "/privacy", "/terms", "/help", "/shipping", "/contact", "/robots.txt", "/sitemap.xml"];
const forbiddenAnalyticsMarkers = ["googletagmanager", "google-analytics", "gtag(", "segment.com", "posthog"];

async function get(path) {
  const started = performance.now();
  const response = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
  const body = await response.text();
  return {
    path,
    status: response.status,
    bytes: Buffer.byteLength(body),
    elapsedMs: Math.round(performance.now() - started),
    body,
  };
}

const live = await get("/api/health/live");
if (live.status !== 200) throw new Error(`Liveness failed with ${live.status}`);

const ready = await get("/api/health/ready");
if (ready.status !== 200 && !(allowNotReady && ready.status === 503)) {
  throw new Error(`Readiness failed with ${ready.status}`);
}

const pages = [];
for (const route of routes) {
  const result = await get(route);
  if (result.status < 200 || result.status >= 400) {
    throw new Error(`${route} returned ${result.status}`);
  }
  if (route !== "/robots.txt" && route !== "/sitemap.xml" && result.bytes > maxPublicHtmlBytes) {
    throw new Error(`${route} returned ${result.bytes} bytes, above the ${maxPublicHtmlBytes}-byte HTML smoke budget`);
  }
  pages.push(result);
}

const root = pages.find((page) => page.path === "/");
const lowerRoot = root.body.toLowerCase();
const unexpectedAnalytics = forbiddenAnalyticsMarkers.filter((marker) => lowerRoot.includes(marker));
if (unexpectedAnalytics.length > 0) {
  throw new Error(`Unexpected analytics markers in public HTML: ${unexpectedAnalytics.join(", ")}`);
}

console.log(JSON.stringify({
  baseUrl,
  liveness: live.status,
  readiness: ready.status,
  maxPublicHtmlBytes,
  publicRoutes: pages.map(({ path, status, bytes, elapsedMs }) => ({ path, status, bytes, elapsedMs })),
  analytics: "no vendor markers found",
}));
