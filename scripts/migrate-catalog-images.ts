import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { z } from "zod";
import { urlArtworks } from "../prisma/url-content";
import { demoId } from "../prisma/demo-content";

const entrySchema = z.object({
  productId: z.string(), originalUrl: z.string().url(), url: z.string().url(),
  fileId: z.string(), filePath: z.string(), checksum: z.string(),
  width: z.number().positive(), height: z.number().positive(), sizeBytes: z.number().positive(),
});
type Entry = z.infer<typeof entrySchema>;
const manifestSchema = z.object({ version: z.literal(1), images: z.array(entrySchema) });
const manifestPath = path.resolve("src/data/catalog-image-manifest.json");
const cachePath = path.resolve(".catalog-media");
const MAX_SOURCE_BYTES = 25 * 1024 * 1024;

export function catalogFolder(productId: string, title: string) {
  const slug = title.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70);
  return `/artistically/demo/artworks/${productId}-${slug || "artwork"}`;
}

export async function readBoundedImage(response: Response): Promise<Buffer> {
  if (!response.ok || !response.body) { throw new Error(`Image request returned ${response.status}`); }
  if (Number(response.headers.get("content-length") ?? 0) > MAX_SOURCE_BYTES) { throw new Error("Source exceeds download limit"); }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) { break; }
      size += value.byteLength;
      if (size > MAX_SOURCE_BYTES) { await reader.cancel(); throw new Error("Source exceeds download limit"); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks);
}

export async function convertCatalogImage(source: Buffer) {
  const image = sharp(source, { limitInputPixels: 40_000_000, failOn: "error" }).rotate();
  const metadata = await image.metadata();
  const isSupportedFormat = ["jpeg", "png", "webp", "avif", "gif"].includes(metadata.format ?? "")
    || (metadata.format === "heif" && metadata.compression === "av1");
  if (!metadata.width || !metadata.height || !isSupportedFormat) {
    throw new Error("Source is not a supported raster image");
  }
  // Retain the complete composition, avoid upscaling, and bound display-image bytes.
  let width = 2000;
  let content = Buffer.alloc(0);
  for (const quality of [85, 78, 70, 62]) {
    content = await image.clone().resize({ width, height: width, fit: "inside", withoutEnlargement: true }).webp({ quality }).toBuffer();
    if (content.byteLength <= 500_000) { break; }
  }
  while (content.byteLength > 500_000 && width > 640) {
    width = Math.floor(width * 0.8);
    content = await image.clone().resize({ width, height: width, fit: "inside", withoutEnlargement: true }).webp({ quality: 70 }).toBuffer();
  }
  if (content.byteLength > 500_000) { throw new Error("Image exceeds WebP byte budget"); }
  const output = await sharp(content).metadata();
  return { content, width: output.width!, height: output.height! };
}

async function saveManifest(images: Entry[]) {
  for (const image of images) {
    const url = new URL(image.url);
    url.search = "";
    image.url = url.toString();
  }
  const temporary = `${manifestPath}.tmp`;
  await writeFile(temporary, `${JSON.stringify({ version: 1, images }, null, 2)}\n`);
  await rename(temporary, manifestPath);
}

async function main() {
  loadEnvConfig(process.cwd());
  if (process.env.NODE_ENV === "production") { throw new Error("Demo migration must not run in production"); }
  const configuration = z.object({ IMAGEKIT_PRIVATE_KEY: z.string().min(1), IMAGEKIT_URL_ENDPOINT: z.string().url() }).parse(process.env);
  const endpoint = new URL(configuration.IMAGEKIT_URL_ENDPOINT);
  if (endpoint.protocol !== "https:") { throw new Error("ImageKit endpoint must use HTTPS"); }
  const headers = { Authorization: `Basic ${Buffer.from(`${configuration.IMAGEKIT_PRIVATE_KEY}:`).toString("base64")}` };
  const prisma = new PrismaClient();
  const limitArgument = process.argv.find((value) => value.startsWith("--limit="));
  const limit = limitArgument ? z.coerce.number().int().positive().parse(limitArgument.split("=")[1]) : Infinity;
  const manifest = manifestSchema.parse(JSON.parse(await readFile(manifestPath, "utf8")));
  const images = manifest.images;
  await mkdir(cachePath, { recursive: true });
  let uploaded = 0;
  let attempted = 0;
  let failures = 0;
  try {
    const records = await prisma.product.findMany({ where: { id: { in: urlArtworks.map((_, index) => demoId(3000000 + index)) } }, select: { id: true, title: true, images: { select: { url: true } } } });
    console.log(JSON.stringify({ catalogRecords: records.length, manifestImages: images.length }));
    for (const record of records) {
      for (const image of record.images) {
        if (attempted >= limit) { break; }
        if (!urlArtworks.some((artwork) => artwork.image === image.url)) {
          console.log(JSON.stringify({ productId: record.id, skipped: "Source differs from approved demo catalog" }));
          continue;
        }
        const existing = images.find((entry) => entry.productId === record.id && entry.originalUrl === image.url);
        if (existing) { continue; }
        attempted += 1;
        try {
          const response = await fetch(image.url, { signal: AbortSignal.timeout(45000), headers: { "User-Agent": "Mozilla/5.0 (compatible; ArtisticallyCatalogMigration/1.0)", Accept: "image/avif,image/webp,image/*,*/*;q=0.8" } });
          const { content, width, height } = await convertCatalogImage(await readBoundedImage(response));
          const checksum = createHash("sha256").update(content).digest("hex");
          const fileName = `${checksum.slice(0, 20)}.webp`;
          await writeFile(path.join(cachePath, `${record.id}.webp`), content);
          const folder = catalogFolder(record.id, record.title);
          const form = new FormData();
          form.set("file", new Blob([new Uint8Array(content)], { type: "image/webp" }), fileName);
          form.set("fileName", fileName);
          form.set("folder", folder);
          form.set("useUniqueFileName", "false");
          form.set("overwriteFile", "false");
          form.set("tags", "artistically,demo-catalog");
          const resultSchema = z.object({ fileId: z.string(), url: z.string().url(), filePath: z.string() });
          // Recover an upload that succeeded before a process interruption or manifest write.
          const listing = await fetch(`https://api.imagekit.io/v1/files?${new URLSearchParams({ path: folder, limit: "100" })}`, { headers, signal: AbortSignal.timeout(30000) });
          if (!listing.ok) { throw new Error(`ImageKit upload returned ${listing.status}`); }
          const stored = z.array(resultSchema).parse(await listing.json()).find((file) => file.filePath === `${folder}/${fileName}`);
          let result = stored;
          if (!result) {
            const upload = await fetch("https://upload.imagekit.io/api/v1/files/upload", { method: "POST", headers, body: form, signal: AbortSignal.timeout(60000) });
            if (!upload.ok) { throw new Error(`ImageKit upload returned ${upload.status}`); }
            result = resultSchema.parse(await upload.json());
          }
          if (!result.url.startsWith(`${configuration.IMAGEKIT_URL_ENDPOINT.replace(/\/$/, "")}/`)) { throw new Error("Upload URL does not match configured endpoint"); }
          const originalDelivery = new URL(result.url);
          originalDelivery.searchParams.set("tr", "orig-true");
          const verify = await fetch(originalDelivery, { signal: AbortSignal.timeout(30000) });
          const verified = await readBoundedImage(verify);
          if (createHash("sha256").update(verified).digest("hex") !== checksum) { throw new Error("Uploaded bytes differ from converted WebP"); }
          images.push({ productId: record.id, originalUrl: image.url, ...result, checksum, width, height, sizeBytes: content.byteLength });
          await saveManifest(images);
          uploaded += 1;
          console.log(JSON.stringify({ productId: record.id, uploaded, bytes: content.byteLength }));
        } catch (error) {
          failures += 1;
          // Never print provider responses, authorization headers, or environment values.
          console.log(JSON.stringify({ productId: record.id, failed: error instanceof Error && /^(Image request returned|ImageKit upload returned|Source |Image |Upload URL|Uploaded bytes)/.test(error.message) ? error.message : "Download, conversion, or upload failed" }));
        }
      }
      if (attempted >= limit) { break; }
    }
  } finally { await prisma.$disconnect(); }
  console.log(JSON.stringify({ uploaded, failures, manifestImages: images.length, storedBytes: images.reduce((total, entry) => total + entry.sizeBytes, 0) }));
  if (failures) { process.exitCode = 1; }
}

if (require.main === module) {
  void main().catch(() => { console.error("Catalog migration stopped; check configuration and database connectivity."); process.exitCode = 1; });
}
