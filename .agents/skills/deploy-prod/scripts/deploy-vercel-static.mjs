import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const token = process.env.VERCEL_LANDING_PAGE_TOKEN;
const project = process.env.VERCEL_LANDING_PAGE_PROJECT_ID;
const target = process.argv[2] ?? "production";

if (!token || !project) {
  throw new Error("Missing gate-loaded Vercel credentials");
}
if (target !== "preview" && target !== "production") {
  throw new Error("Target must be preview or production");
}

const root = process.cwd();
const files = [
  "index.html",
  "app.jsx",
  "styles.css",
  "tweaks-panel.jsx",
  "vercel.json",
  "robots.txt",
  "sitemap.xml",
  "favicon.svg",
  "assets/hero.mp4",
  "assets/logo-white.png",
  "assets/logo.png",
  "assets/logo.svg",
  "assets/og-image.png",
];
const mimeTypes = {
  ".html": "text/html",
  ".jsx": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".txt": "text/plain",
  ".xml": "application/xml",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".mp4": "video/mp4",
};
const authHeaders = { Authorization: `Bearer ${token}` };
const deploymentFiles = [];

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { ...authHeaders, ...(options.headers ?? {}) },
  });
  const body = await response.text();
  let payload;
  try {
    payload = JSON.parse(body);
  } catch {
    payload = body;
  }
  if (!response.ok) {
    const message = payload?.error?.message ?? payload?.message ?? "request failed";
    throw new Error(`Vercel API ${response.status}: ${message}`);
  }
  return payload;
}

for (const file of files) {
  const data = await readFile(join(root, file));
  const extension = file.slice(file.lastIndexOf("."));
  const sha = createHash("sha1").update(data).digest("hex");

  await request("https://api.vercel.com/v2/files", {
    method: "POST",
    headers: {
      "Content-Type": mimeTypes[extension] ?? "application/octet-stream",
      "Content-Length": String(data.length),
      "x-vercel-digest": sha,
    },
    body: data,
  });

  deploymentFiles.push({ file, sha, size: data.length });
  console.log(`uploaded=${file}`);
}

const deployment = await request("https://api.vercel.com/v13/deployments?forceNew=1", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "res-labs-landing-page",
    project,
    ...(target === "production" ? { target: "production" } : {}),
    files: deploymentFiles,
  }),
});

console.log(`deployment_id=${deployment.id}`);
console.log(`deployment_url=https://${deployment.url}`);

let state = deployment.readyState;
for (
  let attempt = 0;
  attempt < 90 && state !== "READY" && state !== "ERROR" && state !== "CANCELED";
  attempt += 1
) {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const current = await request(`https://api.vercel.com/v13/deployments/${deployment.id}`);
  state = current.readyState;
  console.log(`ready_state=${state}`);
}

if (state !== "READY") {
  throw new Error(`Deployment ended in ${state}`);
}

console.log("deployment_state=READY");
