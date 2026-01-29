import { execSync } from "child_process";
import { randomUUID } from "crypto";
import * as path from "path";
import * as fs from "fs";

export async function cloneRepo(repoUrl: string): Promise<string> {
  const id = randomUUID().slice(0, 8);
  const folderName = `flash-${id}`;
  const targetPath = path.join("/tmp", folderName);

  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true });
  }

  execSync(`git clone --depth 1 ${repoUrl} ${targetPath}`, {
    stdio: "pipe",
  });

  return targetPath;
}

export function cleanupRepo(repoPath: string): void {
  if (fs.existsSync(repoPath) && repoPath.startsWith("/tmp/flash-")) {
    fs.rmSync(repoPath, { recursive: true });
  }
}
