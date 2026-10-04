import { z } from 'zod';

export const createLabelSchema = z.object({
  name: z.string().min(1).max(30),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  boardId: z.string().min(1),
  workspaceId: z.string().min(1),
});

export const deleteLabelSchema = z.object({
  labelId: z.string().min(1),
  boardId: z.string().min(1),
  workspaceId: z.string().min(1),
});

export const toggleCardLabelSchema = z.object({
  cardId: z.string().min(1),
  labelId: z.string().min(1),
  boardId: z.string().min(1),
  workspaceId: z.string().min(1),
});

export type CreateLabelInput = z.infer<typeof createLabelSchema>;
export type DeleteLabelInput = z.infer<typeof deleteLabelSchema>;
export type ToggleCardLabelInput = z.infer<typeof toggleCardLabelSchema>;
