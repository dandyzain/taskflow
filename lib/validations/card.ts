import { z } from "zod";

/**
 * Zod schemas for card mutation inputs.
 * All Server Actions validate incoming data against these schemas
 * before performing any database operations.
 */

export const reorderCardSchema = z.object({
  cardId: z.string().min(1),
  columnId: z.string().min(1),
  targetIndex: z.number().int().min(0),
  workspaceId: z.string().min(1),
  boardId: z.string().min(1),
});

export type ReorderCardInput = z.infer<typeof reorderCardSchema>;

export const moveCardToColumnSchema = z.object({
  cardId: z.string().min(1),
  sourceColumnId: z.string().min(1),
  destinationColumnId: z.string().min(1),
  targetIndex: z.number().int().min(0),
  workspaceId: z.string().min(1),
  boardId: z.string().min(1),
});

export type MoveCardToColumnInput = z.infer<typeof moveCardToColumnSchema>;
