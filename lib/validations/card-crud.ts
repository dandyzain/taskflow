import { z } from "zod";

export const createCardSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  columnId: z.string().min(1),
  boardId: z.string().min(1),
  workspaceId: z.string().min(1),
  priority: z.number().int().optional(),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;

export const updateCardSchema = z.object({
  cardId: z.string().min(1),
  title: z.string().min(1, "Title cannot be empty").optional(),
  description: z.string().nullable().optional(),
  priority: z.number().int().optional(),
  dueDate: z.string().nullable().optional(),
  columnId: z.string().min(1),
  boardId: z.string().min(1),
  workspaceId: z.string().min(1),
});

export type UpdateCardInput = z.infer<typeof updateCardSchema>;

export const deleteCardSchema = z.object({
  cardId: z.string().min(1),
  columnId: z.string().min(1),
  boardId: z.string().min(1),
  workspaceId: z.string().min(1),
});

export type DeleteCardInput = z.infer<typeof deleteCardSchema>;
