import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = path.resolve(".next");
if (!existsSync(root)) throw new Error("Production build output is missing.");
const violations = [];
const sourceMapComment = /^\s*\/\/[@#]\s*sourceMappingURL=|\/\*[@#]\s*sourceMappingURL=.*?\*\//m;
function visit(directory) {
  for (const entry of readdirSync(directory)) {
    const full = path.join(directory, entry);
    if (statSync(full).isDirectory()) visit(full);
    else if (entry.endsWith(".map")) violations.push(full);
    else if (/\.(?:js|css)$/.test(entry) && sourceMapComment.test(readFileSync(full, "utf8"))) violations.push(full);
  }
}
visit(root);
if (violations.length) throw new Error(`Production source-map artifacts detected: ${violations.map((file) => path.relative(process.cwd(), file)).join(", ")}`);
console.log("Production artifact check passed: no source maps or sourceMappingURL comments found.");
