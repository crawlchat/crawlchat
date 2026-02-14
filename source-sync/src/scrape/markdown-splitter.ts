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

function makeContextLines({
  headings,
  tableLines,
}: {
  headings: Heading[];
  tableLines: {
    header: string;
    separator: string;
    rowsCount: number;
  };
}) {
  const contextLines: string[] = [];

  for (const heading of headings) {
    contextLines.push(
      `${Array(heading.level).fill("#").join("")}${heading.text}`
    );
  }

  const tableConsidered =
    tableLines.header && tableLines.separator && tableLines.rowsCount > 0;

  if (tableConsidered) {
    contextLines.push(tableLines.header);
    contextLines.push(tableLines.separator);
  }

  return { contextLines, tableConsidered };
}

export function getChunkSize(chunk: string[]) {
  return chunk.reduce((acc, line) => acc + line.length, 0) + chunk.length - 1;
}

function plainChunk(line: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < line.length; i += chunkSize) {
    chunks.push(line.slice(i, i + chunkSize));
  }
  return chunks;
}

export async function splitMarkdown(
  markdown: string,
  options?: {
    context?: string;
    size?: number;
  }
) {
  const size = options?.size ?? MAX_CHUNK_SIZE;

  function addContext(lines: string[]) {
    if (options?.context) {
      return [`Context: ${options.context}\n---\n`, ...lines];
    }
    return lines;
  }

  const originalLines: string[] = markdown.split("\n");
  const shortenedLines: string[] = [];

  for (let i = 0; i < originalLines.length; i++) {
    const line = originalLines[i];
    const chunks = plainChunk(line, size);
    for (const chunk of chunks) {
      shortenedLines.push(chunk);
    }
  }

  const resultChunks: string[] = [];
  let headings: Heading[] = [];
  const tableLines = {
    header: "",
    separator: "",
    rowsCount: 0,
  };

  function makeCarryForwardLines() {
    const { contextLines } = makeContextLines({
      headings,
      tableLines,
    });
    return addContext(contextLines);
  }

  function pushToResultChunks(lines: string[]) {
    for (let i = 0; i < lines.length; i++) {
      const consideredLines = lines.slice(i);
      if (getChunkSize(consideredLines) <= size) {
        resultChunks.push(consideredLines.join("\n"));
        return;
      }
    }

    throw new Error("Lines are too long");
  }

  let carryForwardLines: string[] = makeCarryForwardLines();

  for (let i = 0; i < shortenedLines.length; i++) {
    const line = shortenedLines[i];

    carryForwardLines.push(line);
    if (getChunkSize(carryForwardLines) > size) {
      const lastLine = carryForwardLines.pop();
      pushToResultChunks(carryForwardLines);
      carryForwardLines = makeCarryForwardLines();
      if (lastLine) {
        carryForwardLines.push(lastLine);
      }
    }

    if (line.startsWith("#")) {
      const level = line.match(/^#+/)![0].length;
      const text = line.slice(level);

      const levelDiff = (headings[headings.length - 1]?.level ?? 0) - level;

      for (let j = 0; j < levelDiff + 1; j++) {
        headings.pop();
      }

      headings.push({ level, text });
    }

    if (isTableLine(line)) {
      if (tableLines.header === "") {
        tableLines.header = line;
      }
      if (tableLines.separator === "") {
        tableLines.separator = line;
      }
      if (tableLines.header && tableLines.separator) {
        tableLines.rowsCount++;
      }
    } else {
      tableLines.header = "";
      tableLines.separator = "";
    }
  }

  if (carryForwardLines.length > 0) {
    pushToResultChunks(carryForwardLines);
  }

  return resultChunks;
}
