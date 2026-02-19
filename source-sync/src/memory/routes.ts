import express from "express";
import type { Request, Response } from "express";
import { z } from "zod";
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
const collectionIdSchema = z.string().trim().min(1);
const rememberBodySchema = z.object({
  collectionId: collectionIdSchema,
  text: z.string().trim().min(1),
  id: z.string().trim().min(1),
});
const forgetBodySchema = z
  .object({
    collectionId: collectionIdSchema,
    id: z.string().trim().min(1).optional(),
    text: z.string().trim().min(1).optional(),
  })
  .refine((value) => Boolean(value.id || value.text), {
    message: "id or text is required",
  });
const nodeQuerySchema = z.object({
  collectionId: collectionIdSchema,
  name: z
    .union([z.string(), z.array(z.string())])
    .transform((value) => (Array.isArray(value) ? value : [value]))
    .refine(
      (value) => value.length > 0 && value.every((name) => name.trim().length > 0),
      { message: "name is required" }
    ),
});

router.post("/remember", async (req: Request, res: Response) => {
  const parsedBody = rememberBodySchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({ error: parsedBody.error.issues[0]?.message });
  }
  const { collectionId, text, id } = parsedBody.data;

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
  const parsedBody = forgetBodySchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({ error: parsedBody.error.issues[0]?.message });
  }
  const { collectionId, id, text } = parsedBody.data;
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
  const parsedCollectionId = collectionIdSchema.safeParse(req.query.collectionId);
  if (!parsedCollectionId.success) {
    return res
      .status(400)
      .json({ error: parsedCollectionId.error.issues[0]?.message });
  }
  const nodes = await getAllNodes(parsedCollectionId.data);
  res.json({ nodes });
});

router.get("/relationships", async (req: Request, res: Response) => {
  const parsedCollectionId = collectionIdSchema.safeParse(req.query.collectionId);
  if (!parsedCollectionId.success) {
    return res
      .status(400)
      .json({ error: parsedCollectionId.error.issues[0]?.message });
  }
  const relationships = await getAllRelationships(parsedCollectionId.data);
  res.json({ relationships });
});

router.get("/node", async (req: Request, res: Response) => {
  const parsedQuery = nodeQuerySchema.safeParse(req.query);
  if (!parsedQuery.success) {
    return res.status(400).json({ error: parsedQuery.error.issues[0]?.message });
  }
  const nodes = await getNodes(parsedQuery.data.collectionId, parsedQuery.data.name);
  res.json({ nodes });
});

export default router;
