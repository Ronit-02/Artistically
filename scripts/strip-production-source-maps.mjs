import { readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(".next");
function visit(directory) {
  for (const entry of readdirSync(directory)) {
    const full = path.join(directory, entry);
    if (statSync(full).isDirectory()) visit(full);
    else if (entry.endsWith(".map")) rmSync(full, { force: true });
    else if (/\.(?:js|css)$/.test(entry)) {
      const source = readFileSync(full, "utf8");
      const stripped = source.replace(/^\s*\/\/[#@]\s*sourceMappingURL=.*$/gm, "").replace(/\/\*#\s*sourceMappingURL=.*?\*\//g, "");
      if (stripped !== source) writeFileSync(full, stripped);
    }
  }
}
visit(root);
