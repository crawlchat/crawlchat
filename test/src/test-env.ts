import fs from "fs";
import path from "path";
import dotenv from "dotenv";

function test() {
  const rootPackageJson = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "../package.json"), "utf8")
  );
  const workspaces = rootPackageJson.workspaces;

  const rootEnvPath = path.join(process.cwd(), "../.env.example");
  const rootEnv = dotenv.config({
    path: rootEnvPath,
  });

  if (!rootEnv.parsed) {
    throw new Error(`${rootEnvPath} is not a valid .env file`);
  }

  const rootEnvKeys = Object.keys(rootEnv.parsed);
  const unseenRootEnvKeys = new Set(rootEnvKeys);

  for (const workspace of workspaces) {
    if (workspace === "packages/*") continue;

    const envPath = path.join(
      process.cwd(),
      "../",
      workspace,
      ".env.example"
    ) as string;

    if (!fs.existsSync(envPath)) {
      console.log(`${envPath} does not exist`);
      continue;
    }

    const workspaceEnv = dotenv.config({
      path: envPath,
    });

    if (!workspaceEnv.parsed) {
      throw new Error(`${envPath} is not a valid .env file`);
    }

    for (const [key, value] of Object.entries(workspaceEnv.parsed)) {
      if (!rootEnvKeys.includes(key)) {
        throw new Error(`${key} is not in the root .env file`);
      }
      unseenRootEnvKeys.delete(key);
    }
  }

  if (unseenRootEnvKeys.size > 0) {
    throw new Error(
      `Few keys are not in any workspace .env file: ${Array.from(unseenRootEnvKeys).join(", ")}`
    );
  }
}

test();
