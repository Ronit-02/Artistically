import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  artistFindUnique: vi.fn(),
  getForOwner: vi.fn(),
  submit: vi.fn(),
  listForAdmin: vi.fn(),
  decideForAdmin: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ requireAuth: mocks.requireAuth }));
vi.mock("@/lib/prisma", () => ({
  prisma: { artist: { findUnique: mocks.artistFindUnique } },
}));
vi.mock("@/lib/services/verification.service", () => ({
  verificationService: {
    getForOwner: mocks.getForOwner,
    submit: mocks.submit,
    listForAdmin: mocks.listForAdmin,
    decideForAdmin: mocks.decideForAdmin,
  },
}));

import { GET as getOwner, POST as submitOwner } from "@/app/api/artists/[id]/verification/route";
import { GET as listAdmin } from "@/app/api/admin/verifications/route";
import { PATCH as decideAdmin } from "@/app/api/admin/verifications/[id]/route";

const artistId = "cmabcdefghijklmnopqrstuvwx";
const verificationId = "cmhijklmnopqrstuvwxabcdef";

function request(body?: unknown, url = "https://artistically.example/api", method = "GET") {
  return new NextRequest(url, {
    method,
    ...(body === undefined ? {} : {
      body: JSON.stringify(body),
      headers: { "content-type": "application/json" },
    }),
  });
}

describe("artist verification routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "artist-user", role: "ARTIST" });
    mocks.artistFindUnique.mockResolvedValue({ id: artistId, userId: "artist-user" });
    mocks.getForOwner.mockResolvedValue({ id: verificationId, artistId, status: "SUBMITTED" });
    mocks.submit.mockResolvedValue({ id: verificationId, artistId, status: "SUBMITTED" });
    mocks.listForAdmin.mockResolvedValue([]);
    mocks.decideForAdmin.mockResolvedValue({ id: verificationId, status: "VERIFIED" });
  });

  it("returns the owner's verification state", async () => {
    const response = await getOwner(request(undefined, `https://artistically.example/api/artists/${artistId}/verification`), {
      params: Promise.resolve({ id: artistId }),
    });

    expect(response.status).toBe(200);
    expect(mocks.getForOwner).toHaveBeenCalledWith(artistId);
  });

  it("rejects a verification submission from another user", async () => {
    mocks.artistFindUnique.mockResolvedValue({ id: artistId, userId: "different-user" });

    const response = await submitOwner(request(
      {
        identityReference: "secure-provider-reference",
        backgroundStatement: "I have been creating and selling original work for several years.",
      },
      `https://artistically.example/api/artists/${artistId}/verification`,
      "POST",
    ), { params: Promise.resolve({ id: artistId }) });

    expect(response.status).toBe(403);
    expect(mocks.submit).not.toHaveBeenCalled();
  });

  it("submits valid artist verification evidence", async () => {
    const response = await submitOwner(request(
      {
        identityReference: "secure-provider-reference",
        backgroundStatement: "I have been creating and selling original work for several years.",
        portfolioReference: "portfolio-provider-reference",
      },
      `https://artistically.example/api/artists/${artistId}/verification`,
      "POST",
    ), { params: Promise.resolve({ id: artistId }) });

    expect(response.status).toBe(201);
    expect(mocks.submit).toHaveBeenCalledWith(artistId, expect.objectContaining({
      identityReference: "secure-provider-reference",
    }));
  });
});

describe("admin verification routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAuth.mockResolvedValue({ userId: "admin-user", role: "ADMIN" });
    mocks.listForAdmin.mockResolvedValue([{ id: verificationId, status: "SUBMITTED" }]);
    mocks.decideForAdmin.mockResolvedValue({ id: verificationId, status: "VERIFIED" });
  });

  it("lists verification cases for administrators", async () => {
    const response = await listAdmin(request(undefined, "https://artistically.example/api/admin/verifications?status=SUBMITTED"));

    expect(response.status).toBe(200);
    expect(mocks.listForAdmin).toHaveBeenCalledWith("SUBMITTED");
  });

  it("records an administrator decision", async () => {
    const response = await decideAdmin(request(
      { status: "VERIFIED", decisionNote: "Evidence reviewed and approved." },
      `https://artistically.example/api/admin/verifications/${verificationId}`,
      "PATCH",
    ), { params: Promise.resolve({ id: verificationId }) });

    expect(response.status).toBe(200);
    expect(mocks.decideForAdmin).toHaveBeenCalledWith(verificationId, "admin-user", {
      status: "VERIFIED",
      decisionNote: "Evidence reviewed and approved.",
    });
  });
});
