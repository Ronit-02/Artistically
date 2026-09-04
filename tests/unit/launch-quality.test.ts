import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();

function relativeLuminance(hex: string) {
  const channels = hex.match(/[0-9a-f]{2}/gi)?.map((channel) => parseInt(channel, 16) / 255) ?? [];
  const linear = channels.map((channel) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4));
  return 0.2126 * (linear[0] ?? 0) + 0.7152 * (linear[1] ?? 0) + 0.0722 * (linear[2] ?? 0);
}

function contrastRatio(foreground: string, background: string) {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
}

function readSourceTree(directory: string): string {
  return readdirSync(directory, { withFileTypes: true })
    .map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? readSourceTree(path) : /\.(tsx|css)$/.test(entry.name) ? readFileSync(path, "utf8") : "";
    })
    .join("\n");
}

describe("launch quality guardrails", () => {
  it("keeps the text utilities used on light surfaces at WCAG AA contrast", () => {
    expect(contrastRatio("#6b7280", "#ffffff")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#4b5563", "#ffffff")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#6b7280", "#ffffff")).toBeGreaterThanOrEqual(4.5);

    const sourceFiles = [
      join(projectRoot, "src", "app"),
      join(projectRoot, "src", "components"),
    ];

    const source = sourceFiles.filter(existsSync).map(readSourceTree).join("\n");

    expect(source).not.toContain("text-gray-300");
    expect(source).not.toContain("text-gray-400");
    expect(source.toLowerCase()).not.toContain("#999");
    expect(source.toLowerCase()).not.toContain("#92928a");
  });

  it("keeps the launch pack and privacy decision present", () => {
    const launchPack = readFileSync(join(projectRoot, "docs", "launch", "README.md"), "utf8");
    const analyticsReview = readFileSync(join(projectRoot, "docs", "launch", "analytics-privacy-review.md"), "utf8");
    const performanceBudget = readFileSync(join(projectRoot, "docs", "launch", "performance-budgets.md"), "utf8");

    expect(launchPack).toContain("Accessibility and mobile audit");
    expect(launchPack).toContain("Monitoring and alerts");
    expect(analyticsReview).toContain("analytics status is **disabled**");
    expect(performanceBudget).toContain("LCP");
    expect(performanceBudget).toContain("INP");
    expect(performanceBudget).toContain("CLS");
  });
});
