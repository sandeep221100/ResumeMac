import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { db, resumesTable } from "@workspace/db";
import {
  CreateResumeRequest,
  UpdateResumeRequest,
  ResumeResponse,
  ResumeListResponse,
} from "@workspace/api-zod";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/auth";

const router: IRouter = Router();

// All resume routes require authentication
router.use(requireAuth);

// GET /resumes - list current user's resumes
router.get("/resumes", async (req: AuthenticatedRequest, res) => {
  try {
    const rows = await db
      .select({
        id: resumesTable.id,
        name: resumesTable.name,
        category: resumesTable.category,
        templateId: resumesTable.templateId,
        createdAt: resumesTable.createdAt,
        updatedAt: resumesTable.updatedAt,
      })
      .from(resumesTable)
      .where(eq(resumesTable.userId, req.userId!))
      .orderBy(desc(resumesTable.updatedAt));

    const response = ResumeListResponse.parse({
      resumes: rows.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
    });

    res.json(response);
  } catch (err) {
    console.error("List resumes error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /resumes/:id - get full resume data (verify ownership)
router.get("/resumes/:id", async (req: AuthenticatedRequest, res) => {
  try {
    const [resume] = await db
      .select()
      .from(resumesTable)
      .where(
        and(eq(resumesTable.id, req.params.id), eq(resumesTable.userId, req.userId!)),
      )
      .limit(1);

    if (!resume) {
      res.status(404).json({ error: "Resume not found" });
      return;
    }

    const response = ResumeResponse.parse({
      ...resume,
      createdAt: resume.createdAt.toISOString(),
      updatedAt: resume.updatedAt.toISOString(),
    });

    res.json(response);
  } catch (err) {
    console.error("Get resume error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /resumes - create new resume
router.post("/resumes", async (req: AuthenticatedRequest, res) => {
  try {
    const parsed = CreateResumeRequest.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid request" });
      return;
    }

    const [resume] = await db
      .insert(resumesTable)
      .values({
        userId: req.userId!,
        name: parsed.data.name,
        category: parsed.data.category ?? null,
        templateId: parsed.data.templateId ?? "ats-classic",
        data: parsed.data.data ?? {},
      })
      .returning();

    const response = ResumeResponse.parse({
      ...resume,
      createdAt: resume.createdAt.toISOString(),
      updatedAt: resume.updatedAt.toISOString(),
    });

    res.status(201).json(response);
  } catch (err) {
    console.error("Create resume error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /resumes/:id - update resume data (verify ownership)
router.patch("/resumes/:id", async (req: AuthenticatedRequest, res) => {
  try {
    const parsed = UpdateResumeRequest.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0]?.message ?? "Invalid request" });
      return;
    }

    // Verify ownership first
    const [existing] = await db
      .select({ id: resumesTable.id })
      .from(resumesTable)
      .where(
        and(eq(resumesTable.id, req.params.id), eq(resumesTable.userId, req.userId!)),
      )
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Resume not found" });
      return;
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
    if (parsed.data.category !== undefined) updateData.category = parsed.data.category;
    if (parsed.data.templateId !== undefined) updateData.templateId = parsed.data.templateId;
    if (parsed.data.data !== undefined) updateData.data = parsed.data.data;

    const [resume] = await db
      .update(resumesTable)
      .set(updateData)
      .where(eq(resumesTable.id, req.params.id))
      .returning();

    const response = ResumeResponse.parse({
      ...resume,
      createdAt: resume.createdAt.toISOString(),
      updatedAt: resume.updatedAt.toISOString(),
    });

    res.json(response);
  } catch (err) {
    console.error("Update resume error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /resumes/:id - delete resume (verify ownership)
router.delete("/resumes/:id", async (req: AuthenticatedRequest, res) => {
  try {
    const [existing] = await db
      .select({ id: resumesTable.id })
      .from(resumesTable)
      .where(
        and(eq(resumesTable.id, req.params.id), eq(resumesTable.userId, req.userId!)),
      )
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Resume not found" });
      return;
    }

    await db
      .delete(resumesTable)
      .where(eq(resumesTable.id, req.params.id));

    res.json({ success: true });
  } catch (err) {
    console.error("Delete resume error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
