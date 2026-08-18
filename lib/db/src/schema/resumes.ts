import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { usersTable } from "./users";

export const resumesTable = pgTable("resumes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: text("category"),
  templateId: text("template_id").default("ats-classic"),
  data: jsonb("data").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertResumeSchema = createInsertSchema(resumesTable)
  .omit({ id: true, userId: true, createdAt: true, updatedAt: true })
  .extend({
    name: z.string().min(1, "Resume name is required"),
  });

export const updateResumeSchema = insertResumeSchema.partial();

export const selectResumeSchema = createSelectSchema(resumesTable);

export type InsertResume = z.infer<typeof insertResumeSchema>;
export type UpdateResume = z.infer<typeof updateResumeSchema>;
export type Resume = typeof resumesTable.$inferSelect;
