import { Router } from "express";
import { db } from "@workspace/db";
import { assetsTable, projectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  ListProjectAssetsParams,
  CreateAssetParams,
  CreateAssetBody,
  DeleteAssetParams,
} from "@workspace/api-zod";

const router = Router({ mergeParams: true });

router.get("/", async (req, res) => {
  const parsed = ListProjectAssetsParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid project ID" });
    return;
  }

  const assets = await db
    .select()
    .from(assetsTable)
    .where(eq(assetsTable.projectId, parsed.data.id));

  res.json(assets);
});

router.post("/", async (req, res) => {
  const paramsParsed = CreateAssetParams.safeParse({ id: Number(req.params.id) });
  const bodyParsed = CreateAssetBody.safeParse(req.body);

  if (!paramsParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const [project] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, paramsParsed.data.id));

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const [asset] = await db
    .insert(assetsTable)
    .values({ ...bodyParsed.data, projectId: paramsParsed.data.id })
    .returning();

  res.status(201).json(asset);
});

router.delete("/:assetId", async (req, res) => {
  const parsed = DeleteAssetParams.safeParse({
    id: Number(req.params.id),
    assetId: Number(req.params.assetId),
  });

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid parameters" });
    return;
  }

  await db
    .delete(assetsTable)
    .where(eq(assetsTable.id, parsed.data.assetId));

  res.status(204).send();
});

export default router;
