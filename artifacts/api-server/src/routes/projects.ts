import { Router } from "express";
import { db } from "@workspace/db";
import { projectsTable, assetsTable } from "@workspace/db";
import { eq, desc, count, sum, gte } from "drizzle-orm";
import {
  CreateProjectBody,
  UpdateProjectBody,
  GetProjectParams,
  UpdateProjectParams,
  DeleteProjectParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/stats", async (req, res) => {
  try {
    const [projectCount] = await db.select({ count: count() }).from(projectsTable);
    const [assetCount] = await db.select({ count: count() }).from(assetsTable);
    const [durationSum] = await db.select({ total: sum(projectsTable.duration) }).from(projectsTable);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [recentCount] = await db
      .select({ count: count() })
      .from(projectsTable)
      .where(gte(projectsTable.updatedAt, sevenDaysAgo));

    res.json({
      totalProjects: Number(projectCount.count),
      totalAssets: Number(assetCount.count),
      totalDuration: Number(durationSum.total ?? 0),
      recentCount: Number(recentCount.count),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get stats");
    res.status(500).json({ error: "Failed to get stats" });
  }
});

router.get("/recent", async (req, res) => {
  try {
    const projects = await db
      .select()
      .from(projectsTable)
      .orderBy(desc(projectsTable.updatedAt))
      .limit(6);

    const withCounts = await Promise.all(
      projects.map(async (p) => {
        const [{ count: assetCount }] = await db
          .select({ count: count() })
          .from(assetsTable)
          .where(eq(assetsTable.projectId, p.id));
        return { ...p, assetCount: Number(assetCount) };
      }),
    );

    res.json(withCounts);
  } catch (err) {
    req.log.error({ err }, "Failed to get recent projects");
    res.status(500).json({ error: "Failed to get recent projects" });
  }
});

router.get("/", async (req, res) => {
  try {
    const projects = await db
      .select()
      .from(projectsTable)
      .orderBy(desc(projectsTable.updatedAt));

    const withCounts = await Promise.all(
      projects.map(async (p) => {
        const [{ count: assetCount }] = await db
          .select({ count: count() })
          .from(assetsTable)
          .where(eq(assetsTable.projectId, p.id));
        return { ...p, assetCount: Number(assetCount) };
      }),
    );

    res.json(withCounts);
  } catch (err) {
    req.log.error({ err }, "Failed to list projects");
    res.status(500).json({ error: "Failed to list projects" });
  }
});

router.post("/", async (req, res) => {
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  try {
    const { name, description, fps, resolution } = parsed.data;
    const [project] = await db
      .insert(projectsTable)
      .values({
        name,
        description: description ?? null,
        fps: fps ?? 30,
        resolution: resolution ?? "1920x1080",
      })
      .returning();

    res.status(201).json({ ...project, assetCount: 0 });
  } catch (err) {
    req.log.error({ err }, "Failed to create project");
    res.status(500).json({ error: "Failed to create project" });
  }
});

router.get("/:id", async (req, res) => {
  const parsed = GetProjectParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid project ID" });
    return;
  }

  try {
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, parsed.data.id));

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    const [{ count: assetCount }] = await db
      .select({ count: count() })
      .from(assetsTable)
      .where(eq(assetsTable.projectId, project.id));

    res.json({ ...project, assetCount: Number(assetCount) });
  } catch (err) {
    req.log.error({ err }, "Failed to get project");
    res.status(500).json({ error: "Failed to get project" });
  }
});

router.patch("/:id", async (req, res) => {
  const parsed = UpdateProjectParams.safeParse({ id: Number(req.params.id) });
  const bodyParsed = UpdateProjectBody.safeParse(req.body);

  if (!parsed.success || !bodyParsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  try {
    const [existing] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, parsed.data.id));

    if (!existing) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    const [updated] = await db
      .update(projectsTable)
      .set({ ...bodyParsed.data, updatedAt: new Date() })
      .where(eq(projectsTable.id, parsed.data.id))
      .returning();

    const [{ count: assetCount }] = await db
      .select({ count: count() })
      .from(assetsTable)
      .where(eq(assetsTable.projectId, updated.id));

    res.json({ ...updated, assetCount: Number(assetCount) });
  } catch (err) {
    req.log.error({ err }, "Failed to update project");
    res.status(500).json({ error: "Failed to update project" });
  }
});

router.delete("/:id", async (req, res) => {
  const parsed = DeleteProjectParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid project ID" });
    return;
  }

  try {
    await db.delete(projectsTable).where(eq(projectsTable.id, parsed.data.id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete project");
    res.status(500).json({ error: "Failed to delete project" });
  }
});

export default router;
