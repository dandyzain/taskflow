import { z } from "zod";

export const createColumnSchema = z.object({
  title: z.string().min(1, "Title is required"),
  boardId: z.string().min(1),
  workspaceId: z.string().min(1),
});

export type CreateColumnInput = z.infer<typeof createColumnSchema>;

export const updateColumnSchema = z.object({
  columnId: z.string().min(1),
  title: z.string().min(1, "Title cannot be empty").optional(),
  boardId: z.string().min(1),
  workspaceId: z.string().min(1),
});

export type UpdateColumnInput = z.infer<typeof updateColumnSchema>;

export const deleteColumnSchema = z.object({
  columnId: z.string().min(1),
  boardId: z.string().min(1),
  workspaceId: z.string().min(1),
});

export type DeleteColumnInput = z.infer<typeof deleteColumnSchema>;

export const reorderColumnSchema = z.object({
  columnId: z.string().min(1),
  boardId: z.string().min(1),
  targetIndex: z.number().int().min(0),
  workspaceId: z.string().min(1),
});

export type ReorderColumnInput = z.infer<typeof reorderColumnSchema>;
