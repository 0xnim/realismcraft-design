import { globby } from "globby";
import { readFileSync, writeFileSync, existsSync } from "fs";

const INDEX_PATH = "vault/INDEX.md";

const sections = [
  {
    title: "World & Environment",
    dir: "vault/10-World-and-Environment",
    moc: "vault/10-World-and-Environment/_MOC-World.md",
  },
  {
    title: "Resources & Ecology",
    dir: "vault/20-Resources-and-Ecology",
    moc: "vault/20-Resources-and-Ecology/_MOC-Resources.md",
  },
  {
    title: "Transformation & Processes",
    dir: "vault/30-Transformation-and-Processes",
    moc: "vault/30-Transformation-and-Processes/_MOC-Processes.md",
  },
  {
    title: "Structures & Infrastructure",
    dir: "vault/40-Structures-and-Infrastructure",
    moc: "vault/40-Structures-and-Infrastructure/_MOC-Structures.md",
  },
  {
    title: "Human Biology & Health",
    dir: "vault/50-Human-Biology-and-Health",
    moc: "vault/50-Human-Biology-and-Health/_MOC-Human.md",
  },
  {
    title: "Navigation & Measurement",
    dir: "vault/60-Navigation-Measurement-and-Tools",
    moc: "vault/60-Navigation-Measurement-and-Tools/_MOC-Measurement.md",
  },
  {
    title: "Hazards & Risk",
    dir: "vault/70-Hazards-and-Risk",
    moc: "vault/70-Hazards-and-Risk/_MOC-Hazards.md",
  },
  {
    title: "Regions & Contexts",
    dir: "vault/80-Regions-and-Contexts",
    moc: "vault/80-Regions-and-Contexts/_MOC-Regions.md",
  },
  {
    title: "Data & References",
    dir: "vault/90-Data-and-References",
    moc: "vault/90-Data-and-References/_MOC-Data.md",
  },
];

function buildBody() {
  const lines = [];
  lines.push("# Project Overview & Index");
  lines.push(`Last update: ${new Date().toISOString().slice(0, 10)}\n`);

  for (const s of sections) {
    if (existsSync(s.moc)) {
      lines.push(`- ${s.title} → [[${s.moc}|${s.title} MOC]]`);
    } else {
      lines.push(`- ${s.title}`);
    }

    const files = (
      await globby(`${s.dir}/*.md`, { gitignore: true, onlyFiles: true })
    ).filter((f) => !f.includes("_MOC-"));

    files.sort((a, b) => {
      const titleA =
        (readFileSync(a, "utf8").match(/^title:\s*(.+)$/m) || [null, null])[1] ||
        a.split("/").pop().replace(/\.md$/, "");
      const titleB =
        (readFileSync(b, "utf8").match(/^title:\s*(.+)$/m) || [null, null])[1] ||
        b.split("/").pop().replace(/\.md$/, "");
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

  lines.push(
    "Release Notes: see [[vault/00-Governance/Decision-Log.md|Decision Log]] and tag #status/released"
  );
  lines.push(
    "Open Reviews: search tag #status/in-review or see [[vault/00-Governance/Review-Checklist.md|Review Checklist]]"
  );

  return lines.join("\n");
}

function splitFrontmatter(text) {
  // Matches a YAML frontmatter block at the very start of the file
  const m = text.match(/^---\n[\s\S]*?\n---\n/);
  if (!m) return { front: "", body: text };
  return { front: m[0], body: text.slice(m[0].length) };
}

(async () => {
  const newBody = await buildBody();

  if (existsSync(INDEX_PATH)) {
    const current = readFileSync(INDEX_PATH, "utf8");
    const { front } = splitFrontmatter(current);
    const output = front ? `${front}\n${newBody}\n` : newBody;
    writeFileSync(INDEX_PATH, output);
  } else {
    // If missing, write with a default frontmatter once
    const today = new Date().toISOString().slice(0, 10);
    const defaultFront = `---\n` +
      `title: Master Table of Contents\n` +
      `slug: master-table-of-contents\n` +
      `status: Approved\n` +
      `version: 1.0.0\n` +
      `updated: ${today}\n` +
      `author: ResearcherName\n` +
      `reviewers: []\n` +
      `tags: [project/index]\n` +
      `links:\n` +
      `  dependencies: []\n` +
      `  related: []\n` +
      `confidence: 0.6\n` +
      `summary: The central index for all Realism Bible documentation.\n` +
      `---\n\n`;
    writeFileSync(INDEX_PATH, `${defaultFront}${newBody}\n`);
  }
})();
