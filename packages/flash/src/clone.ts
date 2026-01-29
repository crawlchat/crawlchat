import { exec, execSync } from "child_process";
import { promisify } from "util";
import { randomUUID } from "crypto";
import * as path from "path";
import * as fs from "fs";

const execAsync = promisify(exec);

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

export async function ensureRepoCloned(
  repoUrl: string,
  targetPath: string,
  branch: string = "main"
): Promise<void> {
  if (fs.existsSync(targetPath)) {
    const localHead = await execAsync(`git rev-parse HEAD`, {
      cwd: targetPath,
      encoding: "utf-8",
    })
      .then((r) => r.stdout.trim())
      .catch(() => null);

    const remoteHead = await execAsync(
      `git ls-remote ${repoUrl} refs/heads/${branch}`,
      {
        encoding: "utf-8",
      }
    )
      .then((r) => r.stdout.split("\t")[0]?.trim())
      .catch(() => null);

    if (localHead && remoteHead && localHead === remoteHead) {
      return;
    }

    fs.rmSync(targetPath, { recursive: true });
  }

  await execAsync(
    `git clone --depth 1 --branch ${branch} ${repoUrl} ${targetPath}`,
    {
      encoding: "utf-8",
    }
  );
}

export function cleanupRepo(repoPath: string): void {
  if (fs.existsSync(repoPath) && repoPath.startsWith("/tmp/flash-")) {
    fs.rmSync(repoPath, { recursive: true });
  }
}
