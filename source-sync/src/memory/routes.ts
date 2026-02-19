import express from "express";
import type { Request, Response } from "express";
import { extract } from "./extract";
import {
  getAllNodes,
  getAllRelationships,
  getNodes,
  upsert,
  removeByChunk,
  removeByRelationship,
} from "./graph";

const router = express.Router();

router.post("/remember", async (req: Request, res: Response) => {
  const { collectionId, text, id } = req.body;
  if (!collectionId) {
    return res.status(400).json({ error: "collectionId is required" });
  }

  const existingNodes = await getAllNodes(collectionId);

  const { nodes, relationships } = await extract(text, existingNodes);
  for (const relationship of relationships) {
    await upsert(
      collectionId,
      relationship.from,
      relationship.to,
      relationship.relationship,
      id
    );
  }
  res.json({ nodes, relationships });
});

router.post("/forget", async (req: Request, res: Response) => {
  const { collectionId, id, text } = req.body;
  if (!collectionId) {
    return res.status(400).json({ error: "collectionId is required" });
  }
  if (id) {
    await removeByChunk(collectionId, id);
  }
  if (text) {
    const existingNodes = await getAllNodes(collectionId);
    const { relationships } = await extract(text, existingNodes);
    for (const relationship of relationships) {
      await removeByRelationship(
        collectionId,
        relationship.from,
        relationship.to,
        relationship.relationship
      );
    }
  }
  res.json({ success: true });
});

router.get("/nodes", async (req: Request, res: Response) => {
  const { collectionId } = req.query;
  const nodes = await getAllNodes(collectionId as string);
  res.json({ nodes });
});

router.get("/relationships", async (req: Request, res: Response) => {
  const { collectionId } = req.query;
  const relationships = await getAllRelationships(collectionId as string);
  res.json({ relationships });
});

router.get("/node", async (req: Request, res: Response) => {
  const { collectionId, name } = req.query;
  const names = Array.isArray(name) ? name : [name];
  const nodes = await getNodes(collectionId as string, names as string[]);
  res.json({ nodes });
});

export default router;
