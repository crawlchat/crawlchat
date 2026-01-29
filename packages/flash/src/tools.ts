import { Tool } from "@packages/agentic";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { glob } from "glob";

const GrepSchema = z.object({
  pattern: z.string().describe("Regex pattern to search for"),
  glob: z
    .string()
    .optional()
    .describe("Optional glob pattern to filter files (e.g., '*.ts')"),
});

const LsSchema = z.object({
  path: z
    .string()
    .optional()
    .describe("Relative path within the repository (defaults to root)"),
});

const FindSchema = z.object({
  pattern: z
    .string()
    .describe("Glob pattern to match files (e.g., '**/*.ts')"),
});

const TreeSchema = z.object({
  path: z
    .string()
    .optional()
    .describe("Relative path within the repository (defaults to root)"),
  depth: z
    .number()
    .optional()
    .describe("Maximum depth to traverse (defaults to 3)"),
});

type CodebaseTool =
  | Tool<typeof GrepSchema, object>
  | Tool<typeof LsSchema, object>
  | Tool<typeof FindSchema, object>
  | Tool<typeof TreeSchema, object>;

export type CodebaseToolOptions = {
  onToolCall?: (toolId: string, input: Record<string, unknown>) => void;
};

function resolvePath(repoPath: string, relativePath?: string): string {
  if (!relativePath) return repoPath;
  const resolved = path.resolve(repoPath, relativePath);
  if (!resolved.startsWith(repoPath)) {
    throw new Error("Path traversal not allowed");
  }
  return resolved;
}

function createGrepTool(repoPath: string, options?: CodebaseToolOptions): Tool<typeof GrepSchema, object> {
  return {
    id: "grep",
    description:
      "Search file contents using a regex pattern. Returns matching lines with file paths and line numbers.",
    schema: GrepSchema,
    execute: async (input) => {
      console.log("[grep] called with:", input);
      options?.onToolCall?.("grep", input);
      const { pattern, glob: globPattern } = input;
      const globArg = globPattern ? `--include='${globPattern}'` : "";
      const result = execSync(
        `grep -rn ${globArg} -E '${pattern.replace(/'/g, "\\'")}' . 2>/dev/null || true`,
        { cwd: repoPath, encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 }
      );
      const lines = result.trim().split("\n").filter(Boolean).slice(0, 100);
      return {
        content: lines.length ? lines.join("\n") : "No matches found",
      };
    },
  };
}

function createLsTool(repoPath: string, options?: CodebaseToolOptions): Tool<typeof LsSchema, object> {
  return {
    id: "ls",
    description: "List files and directories in the specified path.",
    schema: LsSchema,
    execute: async (input) => {
      console.log("[ls] called with:", input);
      options?.onToolCall?.("ls", input);
      const targetPath = resolvePath(repoPath, input.path);
      const entries = fs.readdirSync(targetPath, { withFileTypes: true });
      const result = entries
        .map((entry) => {
          const suffix = entry.isDirectory() ? "/" : "";
          return `${entry.name}${suffix}`;
        })
        .join("\n");
      return { content: result || "Empty directory" };
    },
  };
}

function createFindTool(repoPath: string, options?: CodebaseToolOptions): Tool<typeof FindSchema, object> {
  return {
    id: "find",
    description: "Find files by name or glob pattern.",
    schema: FindSchema,
    execute: async (input) => {
      console.log("[find] called with:", input);
      options?.onToolCall?.("find", input);
      const matches = await glob(input.pattern, {
        cwd: repoPath,
        nodir: true,
        ignore: ["**/node_modules/**", "**/.git/**"],
      });
      const limited = matches.slice(0, 200);
      const suffix =
        matches.length > 200 ? `\n... and ${matches.length - 200} more` : "";
      return {
        content: limited.length ? limited.join("\n") + suffix : "No files found",
      };
    },
  };
}

function buildTree(
  dir: string,
  prefix: string,
  depth: number,
  maxDepth: number
): string[] {
  if (depth >= maxDepth) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const filtered = entries.filter(
    (e) => !e.name.startsWith(".") && e.name !== "node_modules"
  );
  const lines: string[] = [];

  filtered.forEach((entry, index) => {
    const isLast = index === filtered.length - 1;
    const connector = isLast ? "└── " : "├── ";
    const suffix = entry.isDirectory() ? "/" : "";
    lines.push(`${prefix}${connector}${entry.name}${suffix}`);

    if (entry.isDirectory()) {
      const newPrefix = prefix + (isLast ? "    " : "│   ");
      lines.push(
        ...buildTree(path.join(dir, entry.name), newPrefix, depth + 1, maxDepth)
      );
    }
  });

  return lines;
}

function createTreeTool(repoPath: string, options?: CodebaseToolOptions): Tool<typeof TreeSchema, object> {
  return {
    id: "tree",
    description: "Get a tree-like representation of the directory structure.",
    schema: TreeSchema,
    execute: async (input) => {
      console.log("[tree] called with:", input);
      options?.onToolCall?.("tree", input);
      const targetPath = resolvePath(repoPath, input.path);
      const maxDepth = input.depth ?? 3;
      const rootName = input.path || path.basename(repoPath);
      const lines = [`${rootName}/`, ...buildTree(targetPath, "", 0, maxDepth)];
      return { content: lines.join("\n") };
    },
  };
}

export function createCodebaseTools(repoPath: string, options?: CodebaseToolOptions): CodebaseTool[] {
  return [
    createGrepTool(repoPath, options),
    createLsTool(repoPath, options),
    createFindTool(repoPath, options),
    createTreeTool(repoPath, options),
  ];
}

export { createGrepTool, createLsTool, createFindTool, createTreeTool };
