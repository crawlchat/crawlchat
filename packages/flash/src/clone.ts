import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";

const execAsync = promisify(exec);

export async function ensureRepoCloned(
  repoUrl: string,
  targetPath: string,
  branch: string = "main"
): Promise<void> {
  const existingRepo = fs.existsSync(targetPath);
  if (existingRepo) {
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
  }

  const tempPath = `${targetPath}.tmp-${process.pid}-${Date.now()}`;

  await execAsync(
    `git clone --depth 1 --branch ${branch} ${repoUrl} ${tempPath}`,
    {
      encoding: "utf-8",
    }
  );

  if (existingRepo) {
    fs.rmSync(targetPath, { recursive: true, force: true });
  }

  fs.renameSync(tempPath, targetPath);
}

export function cleanupRepo(repoPath: string): void {
  if (fs.existsSync(repoPath) && repoPath.startsWith("/tmp/flash-")) {
    fs.rmSync(repoPath, { recursive: true, force: true });
  }
}
