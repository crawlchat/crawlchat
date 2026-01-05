import { markdownToTxt } from "markdown-to-txt";

function isJustListLink(line: string) {
  const content = line.trim().replace(/^[*-]\s+/, "");
  if (/^\[([^\]]+)\]\([^)]+\)$/.test(content)) {
    return true;
  }
  return false;
}

export function removeConsecutiveLinks(markdown: string) {
  const lines = markdown.split("\n");

  const processedLines = lines.filter((line) => {
    if (line.trim().startsWith("*") || line.trim().startsWith("-")) {
      if (isJustListLink(line)) {
        return false;
      }
    }
    return true;
  });

  return processedLines.join("\n");
}

export function removeEmptyLinks(markdown: string) {
  return markdown.replace(/\[([^\]]+)\]\(\)/g, "");
}

export function markdownToText(markdown: string) {
  return markdownToTxt(markdown);
}


