import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const readSource = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("responsive accessibility contracts", () => {
  it("keeps artist portal navigation controls keyboard-visible and touch-sized", () => {
    const source = readSource("src/app/(artist-portal)/layout.tsx");

    expect(source).toContain("min-h-11 min-w-11 rounded-lg hover:bg-gray-100");
    expect(source).toContain("aria-label={sidebarOpen ? \"Close artist portal navigation\" : \"Open artist portal navigation\"}");
    expect(source.match(/className=.*min-h-11.*focus-visible:ring-2/g)?.length).toBeGreaterThanOrEqual(5);
  });

  it("stacks the profile name fields on narrow screens", () => {
    const source = readSource("src/app/(account)/profile/page.tsx");

    expect(source).toContain('className="grid grid-cols-1 sm:grid-cols-2 gap-4"');
    expect(source).toContain("focus-visible:ring-2 focus-visible:ring-accent-100");
    expect(source).toContain("inline-flex min-h-11 items-center text-xs text-indigo-600");
  });

  it("provides a reduced-motion fallback for existing animations", () => {
    const source = readSource("src/app/globals.css");

    expect(source).toContain("@media (prefers-reduced-motion: reduce)");
    expect(source).toContain("transition-duration: 0.01ms !important");
  });

  it("requires explicit confirmation before order cancellation", () => {
    const source = readSource("src/app/(shop)/tracking/page.tsx");

    expect(source).toContain("Confirm order cancellation");
    expect(source).toContain("Confirm Cancellation");
    expect(source).toContain("This action releases its reserved stock and cannot be undone.");
  });

  it("keeps post-purchase shopping links touch-sized", () => {
    expect(readSource("src/app/(shop)/cart/page.tsx")).toContain("inline-flex min-h-11 items-center text-[13px] text-gray-500");
    expect(readSource("src/app/(shop)/tracking/page.tsx")).toContain("inline-flex min-h-11 items-center text-[13px] text-gray-500");
  });
});
