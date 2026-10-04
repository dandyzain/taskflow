import { z } from "zod";

export const createBoardSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  workspaceId: z.string().min(1),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;

export const updateBoardSchema = z.object({
  boardId: z.string().min(1),
  title: z.string().min(1, "Title cannot be empty").optional(),
  description: z.string().nullable().optional(),
  workspaceId: z.string().min(1),
});

export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;

export const deleteBoardSchema = z.object({
  boardId: z.string().min(1),
  workspaceId: z.string().min(1),
});

export type DeleteBoardInput = z.infer<typeof deleteBoardSchema>;
