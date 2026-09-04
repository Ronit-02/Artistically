import { createHmac, createHash, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { serverEnv } from "@/lib/env";

export type MediaUploadRequest = {
  assetId: string;
  providerKey: string;
  mimeType: string;
  sizeBytes: number;
};

export type MediaUploadOperation = {
  provider: string;
  uploadUrl: string;
  headers: Record<string, string>;
  expiresAt: string;
};

type StoredObject = { sizeBytes: number; checksum: string };

const UPLOAD_TTL_SECONDS = 900;

function sha256(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

function hmac(key: string | Buffer, value: string) {
  return createHmac("sha256", key).update(value).digest();
}

function localRoot() {
  return path.resolve(/* turbopackIgnore: true */ process.cwd(), serverEnv.MEDIA_LOCAL_DIR);
}

function localPath(providerKey: string) {
  return path.join(/* turbopackIgnore: true */ localRoot(), providerKey.replaceAll("/", path.sep));
}

function localToken(providerKey: string, expiresAt: number) {
  const payload = `${providerKey}:${expiresAt}`;
  return `${Buffer.from(payload).toString("base64url")}.${createHmac("sha256", serverEnv.JWT_SECRET ?? "artistically-local-media-secret").update(payload).digest("base64url")}`;
}

export function verifyLocalUploadToken(providerKey: string, token: string) {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return false;
  const payload = Buffer.from(encoded, "base64url").toString("utf8");
  const [signedKey, expiry] = payload.split(":");
  if (signedKey !== providerKey || !expiry || Number(expiry) < Math.floor(Date.now() / 1000)) return false;
  const expected = createHmac("sha256", serverEnv.JWT_SECRET ?? "artistically-local-media-secret").update(payload).digest("base64url");
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  return providedBuffer.length === expectedBuffer.length && timingSafeEqual(providedBuffer, expectedBuffer);
}

function encodedPath(key: string) {
  return key.split("/").map(encodeURIComponent).join("/");
}

function s3Host() {
  if (serverEnv.MEDIA_STORAGE_ENDPOINT) return new URL(serverEnv.MEDIA_STORAGE_ENDPOINT).host;
  return `${serverEnv.MEDIA_STORAGE_BUCKET}.s3.${serverEnv.MEDIA_STORAGE_REGION}.amazonaws.com`;
}

function s3BaseUrl() {
  if (serverEnv.MEDIA_STORAGE_ENDPOINT) return serverEnv.MEDIA_STORAGE_ENDPOINT.replace(/\/$/, "");
  return `https://${s3Host()}`;
}

function signS3Upload(input: MediaUploadRequest) {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const shortDate = amzDate.slice(0, 8);
  const credentialScope = `${shortDate}/${serverEnv.MEDIA_STORAGE_REGION}/s3/aws4_request`;
  const query = new URLSearchParams({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${serverEnv.MEDIA_STORAGE_ACCESS_KEY_ID}/${credentialScope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(UPLOAD_TTL_SECONDS),
    "X-Amz-SignedHeaders": "content-type;host",
  });
  const canonicalUri = `/${encodedPath(input.providerKey)}`;
  const canonicalQuery = [...query.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join("&");
  const canonicalHeaders = `content-type:${input.mimeType}\nhost:${s3Host()}\n`;
  const canonicalRequest = ["PUT", canonicalUri, canonicalQuery, canonicalHeaders, "content-type;host", "UNSIGNED-PAYLOAD"].join("\n");
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, sha256(canonicalRequest)].join("\n");
  const signingKey = hmac(hmac(hmac(hmac(`AWS4${serverEnv.MEDIA_STORAGE_SECRET_ACCESS_KEY}`, shortDate), serverEnv.MEDIA_STORAGE_REGION), "s3"), "aws4_request");
  query.set("X-Amz-Signature", createHmac("sha256", signingKey).update(stringToSign).digest("hex"));
  return `${s3BaseUrl()}${canonicalUri}?${query.toString()}`;
}

export interface MediaStorageProvider {
  readonly name: string;
  createUpload(input: MediaUploadRequest): Promise<MediaUploadOperation>;
  verifyUpload(providerKey: string): Promise<StoredObject>;
  getDownloadUrl(providerKey: string, expiresInSeconds: number): Promise<string>;
  publicUrl(providerKey: string, assetId: string): string;
  writeLocal?(providerKey: string, content: Buffer): Promise<void>;
  readLocal?(providerKey: string): Promise<Buffer>;
}

class LocalMediaStorage implements MediaStorageProvider {
  readonly name = "local";

  async createUpload(input: MediaUploadRequest) {
    const expires = Math.floor(Date.now() / 1000) + UPLOAD_TTL_SECONDS;
    const base = serverEnv.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
    return { provider: this.name, uploadUrl: `${base}/api/artist/media/${input.assetId}/upload?token=${encodeURIComponent(localToken(input.providerKey, expires))}`, headers: { "Content-Type": input.mimeType }, expiresAt: new Date(expires * 1000).toISOString() };
  }

  async verifyUpload(providerKey: string) {
    const info = await stat(localPath(providerKey));
    return { sizeBytes: info.size, checksum: sha256(await readFile(localPath(providerKey))) };
  }

  async getDownloadUrl(providerKey: string) {
    return `${serverEnv.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}/api/media/${encodeURIComponent(providerKey)}`;
  }

  publicUrl(_providerKey: string, assetId: string) {
    return `${serverEnv.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}/api/media/${encodeURIComponent(assetId)}`;
  }

  async writeLocal(providerKey: string, content: Buffer) {
    const target = localPath(providerKey);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content, { flag: "w" });
  }

  readLocal(providerKey: string) {
    return readFile(localPath(providerKey));
  }
}

class S3MediaStorage implements MediaStorageProvider {
  readonly name = "s3";

  async createUpload(input: MediaUploadRequest) {
    const expires = Math.floor(Date.now() / 1000) + UPLOAD_TTL_SECONDS;
    return { provider: this.name, uploadUrl: signS3Upload(input), headers: { "Content-Type": input.mimeType }, expiresAt: new Date(expires * 1000).toISOString() };
  }

  async verifyUpload(providerKey: string) {
    const response = await fetch(`${s3BaseUrl()}/${encodedPath(providerKey)}`, { method: "HEAD" });
    if (!response.ok) throw new Error("Provider object is not available");
    return { sizeBytes: Number(response.headers.get("content-length") ?? 0), checksum: response.headers.get("etag")?.replaceAll('"', "") ?? "" };
  }

  async getDownloadUrl(providerKey: string, expiresInSeconds: number) {
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
    const shortDate = amzDate.slice(0, 8);
    const credentialScope = `${shortDate}/${serverEnv.MEDIA_STORAGE_REGION}/s3/aws4_request`;
    const query = new URLSearchParams({ "X-Amz-Algorithm": "AWS4-HMAC-SHA256", "X-Amz-Credential": `${serverEnv.MEDIA_STORAGE_ACCESS_KEY_ID}/${credentialScope}`, "X-Amz-Date": amzDate, "X-Amz-Expires": String(expiresInSeconds), "X-Amz-SignedHeaders": "host" });
    const canonicalUri = `/${encodedPath(providerKey)}`;
    const canonicalQuery = [...query.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join("&");
    const canonicalRequest = ["GET", canonicalUri, canonicalQuery, `host:${s3Host()}\n`, "host", "UNSIGNED-PAYLOAD"].join("\n");
    const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, sha256(canonicalRequest)].join("\n");
    const signingKey = hmac(hmac(hmac(hmac(`AWS4${serverEnv.MEDIA_STORAGE_SECRET_ACCESS_KEY}`, shortDate), serverEnv.MEDIA_STORAGE_REGION), "s3"), "aws4_request");
    query.set("X-Amz-Signature", createHmac("sha256", signingKey).update(stringToSign).digest("hex"));
    return `${s3BaseUrl()}${canonicalUri}?${query.toString()}`;
  }

  publicUrl(providerKey: string) {
    return `${serverEnv.MEDIA_STORAGE_PUBLIC_BASE_URL?.replace(/\/$/, "") ?? s3BaseUrl()}/${encodedPath(providerKey)}`;
  }
}

export function mediaStorageProvider(): MediaStorageProvider {
  return serverEnv.MEDIA_STORAGE_PROVIDER === "s3" ? new S3MediaStorage() : new LocalMediaStorage();
}

export { localPath };
