import { globby } from "globby";
import { readFileSync, writeFileSync } from "fs";

const sections = [
  { title: "World & Environment", dir: "vault/10-World-and-Environment" },
  { title: "Resources & Ecology", dir: "vault/20-Resources-and-Ecology" },
  { title: "Transformation & Processes", dir: "vault/30-Transformation-and-Processes" },
  { title: "Structures & Infrastructure", dir: "vault/40-Structures-and-Infrastructure" },
  { title: "Human Biology & Health", dir: "vault/50-Human-Biology-and-Health" },
  { title: "Navigation & Measurement", dir: "vault/60-Navigation-Measurement-and-Tools" },
  { title: "Hazards & Risk", dir: "vault/70-Hazards-and-Risk" },
  { title: "Regions & Contexts", dir: "vault/80-Regions-and-Contexts" },
  { title: "Data & References", dir: "vault/90-Data-and-References" },
];

const lines = [];
lines.push("# Project Overview & Index");
lines.push(`Last update: ${new Date().toISOString().slice(0, 10)}\n`);

for (const s of sections) {
  const files = (
    await globby(`${s.dir}/*.md`, { gitignore: true, onlyFiles: true })
  ).filter((f) => !f.includes("_MOC-"));
  
  const mocFile = `${s.dir}/_MOC-${s.title.split(" ")[0]}.md`;
  if (readFileSync(mocFile, 'utf8')) { // Ensure MOC file exists
    lines.push(`\- ${s.title} → [[${mocFile}|${s.title} MOC]]`);
  } else {
    lines.push(`\- ${s.title}`);
  }

  // Sort files alphabetically by title for consistent indexing
  files.sort((a, b) => {
    const titleA = (readFileSync(a, "utf8").match(/^title:\s*(.+)$/m) || [null, null])[1] || a.split("/").pop().replace(/\.md$/, "");
    const titleB = (readFileSync(b, "utf8").match(/^title:\s*(.+)$/m) || [null, null])[1] || b.split("/").pop().replace(/\.md$/, "");
    return titleA.localeCompare(titleB);
  });

  for (const f of files) {
    const title =
      (readFileSync(f, "utf8").match(/^title:\s*(.+)$/m) || [null, null])[1] ||
      f.split("/").pop().replace(/\.md$/, "");
    lines.push(`  - [[${f}|${title}]]`);
  }
  lines.push("");
}

lines.push("Release Notes: see [[vault/00-Governance/Decision-Log.md|Decision Log]] and tag #status/released");
lines.push("Open Reviews: search tag #status/in-review or see [[vault/00-Governance/Review-Checklist.md|Review Checklist]]");

writeFileSync("vault/INDEX.md", lines.join("\n"));
