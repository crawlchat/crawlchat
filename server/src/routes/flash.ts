import { Router } from "express";
import { cloneRepo, createTreeTool } from "@packages/flash";
import * as fs from "fs";

const router = Router();

router.post("/clone", async (req, res) => {
  const repoUrl = req.body.repoUrl as string;

  if (!repoUrl) {
    res.status(400).json({ message: "repoUrl is required" });
    return;
  }

  const repoPath = await cloneRepo(repoUrl);
  res.json({ repoPath });
});

router.get("/tree", async (req, res) => {
  const repoPath = req.query.repoPath as string;
  const path = req.query.path as string | undefined;
  const depth = req.query.depth as number | undefined;

  if (!repoPath) {
    res.status(400).json({ message: "repoPath is required" });
    return;
  }

  if (!fs.existsSync(repoPath)) {
    res.status(404).json({ message: "Repository not found. Clone it first." });
    return;
  }

  const treeTool = createTreeTool(repoPath);
  const result = await treeTool.execute({ path, depth });
  res.type("text/plain").send(result.content);
});

export default router;
