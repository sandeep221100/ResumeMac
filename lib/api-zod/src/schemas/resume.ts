import { z } from "zod";

export const CreateResumeRequest = z.object({
  name: z.string().min(1, "Resume name is required"),
  category: z.string().optional(),
  templateId: z.string().optional().default("ats"),
  data: z.record(z.unknown()).optional().default({}),
});

export const UpdateResumeRequest = z.object({
  name: z.string().min(1).optional(),
  category: z.string().optional(),
  templateId: z.string().optional(),
  data: z.record(z.unknown()).optional(),
});

export const ResumeResponse = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string(),
  category: z.string().nullable(),
  templateId: z.string().nullable(),
  data: z.record(z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ResumeListItem = z.object({
  id: z.string().uuid(),
  name: z.string(),
  category: z.string().nullable(),
  templateId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ResumeListResponse = z.object({
  resumes: z.array(ResumeListItem),
});

export type CreateResumeRequest = z.infer<typeof CreateResumeRequest>;
export type UpdateResumeRequest = z.infer<typeof UpdateResumeRequest>;
export type ResumeResponse = z.infer<typeof ResumeResponse>;
export type ResumeListItem = z.infer<typeof ResumeListItem>;
export type ResumeListResponse = z.infer<typeof ResumeListResponse>;
