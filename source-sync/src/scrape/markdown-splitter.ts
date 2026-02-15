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

function isOnlyHeadings(lines: string) {
  return lines.split("\n").every((line) => isHeadingLine(line));
}

export function splitMarkdown(
  markdown: string,
  options?: { size?: number; context?: string }
) {
  const size = options?.size ?? MAX_CHUNK_SIZE;
  const context = options?.context;
  const headings: Heading[] = [];
  const tableLines = {
    header: "",
    separator: "",
  };

  const buildPrefix = (): string => {
    const contextLine = context ? [`Context: ${context}\n---\n`] : [];
    const structureLines = makeStructureLines({
      headings,
      tableLines,
    });
    return merge(...contextLine, ...structureLines);
  };

  const processStructure = (line: string) => {
    if (isTableLine(line)) {
      if (tableLines.header === "") {
        tableLines.header = line;
      } else if (tableLines.separator === "") {
        tableLines.separator = line;
      }
    } else {
      tableLines.header = "";
      tableLines.separator = "";
    }

    if (isHeadingLine(line)) {
      const level = line.match(/^#+/)![0].length;
      const text = line.slice(level);

      const lastLevel = headings[headings.length - 1]?.level ?? 0;
      const levelDiff = lastLevel - level;
      for (let j = 0; j < levelDiff + 1; j++) {
        headings.pop();
      }

      headings.push({ level, text });
    }
  };

  const split = (markdown: string) => {
    const lines: string[] = markdown.split("\n");
    const chunks: string[] = [buildPrefix()];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let remaining = line;

      const prefix = buildPrefix();

      if (prefix.length > size) {
        throw new Error(
          `Prefix is too large - ${prefix.length} (max: ${size})`
        );
      }

      const probableFull = merge(chunks[chunks.length - 1], remaining);
      if (probableFull.length <= size) {
        chunks[chunks.length - 1] = probableFull;
        remaining = "";
      } else if (chunks[chunks.length - 1] !== "") {
        if (isOnlyHeadings(chunks[chunks.length - 1])) {
          chunks[chunks.length - 1] += "\n";
        } else {
          chunks.push("");
        }
      }

      while (remaining.length > 0) {
        if (chunks[chunks.length - 1] === "") {
          chunks[chunks.length - 1] = prefix;
          if (prefix) {
            chunks[chunks.length - 1] += "\n";
          }
        }

        if (size <= chunks[chunks.length - 1].length) {
          chunks.push(prefix);
          if (prefix) {
            chunks[chunks.length - 1] += "\n";
          }
        }

        const textToAdd = remaining.slice(
          0,
          size - chunks[chunks.length - 1].length
        );
        remaining = remaining.slice(textToAdd.length);

        chunks[chunks.length - 1] += textToAdd;
      }

      processStructure(line);
    }

    for (let i = 0; i < chunks.length; i++) {
      if (chunks[i].length > size) {
        throw new Error(
          `Chunk ${i} is too large - ${chunks[i].length} (max: ${size})`
        );
      }
    }

    return chunks.filter((chunk) => chunk);
  };

  return split(markdown);
}
