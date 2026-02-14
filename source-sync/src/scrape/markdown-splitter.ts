const MAX_CHUNK_SIZE = 7680;

type Heading = {
  level: number;
  text: string;
};

function isTableLine(line: string) {
  if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
    if (line.replace(/[\|\-:\s]/g, "").length === 0) {
      return true;
    }
    return line.includes("|");
  }
  return false;
}

function isHeadingLine(line: string) {
  return line.startsWith("#");
}

function makeStructureLines({
  headings,
  tableLines,
}: {
  headings: Heading[];
  tableLines: {
    header?: string;
    separator?: string;
  };
}) {
  const lines: string[] = [];

  for (const heading of headings) {
    lines.push(`${Array(heading.level).fill("#").join("")}${heading.text}`);
  }

  if (tableLines.header && tableLines.separator) {
    lines.push(tableLines.header);
    lines.push(tableLines.separator);
  }

  return lines;
}

function merge(...strings: Array<string | undefined | null>) {
  return strings.filter((s) => s !== "" && typeof s === "string").join("\n");
}

export class MarkdownSplitter {
  private readonly size: number;
  private readonly context?: string;
  private readonly headings: Heading[] = [];
  private readonly tableLines = {
    header: "",
    separator: "",
  };

  constructor(options?: { size?: number; context?: string }) {
    this.size = options?.size ?? MAX_CHUNK_SIZE;
    this.context = options?.context;
  }

  private buildPrefix(): string {
    const contextLine = this.context ? [`Context: ${this.context}\n---\n`] : [];
    const structureLines = makeStructureLines({
      headings: this.headings,
      tableLines: this.tableLines,
    });
    return merge(...contextLine, ...structureLines);
  }

  private processStructure(line: string) {
    if (isTableLine(line)) {
      if (this.tableLines.header === "") {
        this.tableLines.header = line;
      } else if (this.tableLines.separator === "") {
        this.tableLines.separator = line;
      }
    } else {
      this.tableLines.header = "";
      this.tableLines.separator = "";
    }

    if (isHeadingLine(line)) {
      const level = line.match(/^#+/)![0].length;
      const text = line.slice(level);

      const lastLevel = this.headings[this.headings.length - 1]?.level ?? 0;
      const levelDiff = lastLevel - level;
      for (let j = 0; j < levelDiff + 1; j++) {
        this.headings.pop();
      }

      this.headings.push({ level, text });
    }
  }

  async split(markdown: string) {
    const lines: string[] = markdown.split("\n");
    const chunks: string[] = [this.buildPrefix()];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let remaining = line;

      const prefix = this.buildPrefix();

      const probableFull = merge(chunks[chunks.length - 1], remaining);
      if (probableFull.length <= this.size) {
        chunks[chunks.length - 1] = probableFull;
        remaining = "";
      } else if (chunks[chunks.length - 1] !== "") {
        chunks.push("");
      }

      while (remaining.length > 0) {
        if (chunks[chunks.length - 1] === "") {
          chunks[chunks.length - 1] = prefix;
          if (prefix) {
            chunks[chunks.length - 1] += "\n";
          }
        }

        if (this.size <= chunks[chunks.length - 1].length) {
          chunks.push(prefix);
        }

        const textToAdd = remaining.slice(
          0,
          this.size - chunks[chunks.length - 1].length
        );
        remaining = remaining.slice(textToAdd.length);

        chunks[chunks.length - 1] += textToAdd;
      }

      this.processStructure(line);
    }

    for (let i = 0; i < chunks.length; i++) {
      if (chunks[i].length > this.size) {
        throw new Error(
          `Chunk ${i} is too large - ${chunks[i].length} (max: ${this.size})`
        );
      }
    }

    return chunks.filter((chunk) => chunk);
  }
}
