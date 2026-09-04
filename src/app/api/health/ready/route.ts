import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      service: "artistically",
      check: "readiness",
      dependencies: { database: "ok" },
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        status: "not_ready",
        service: "artistically",
        check: "readiness",
        dependencies: { database: "failed" },
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
