import { z } from 'zod';

export const toggleAssigneeSchema = z.object({
  cardId: z.string().min(1),
  userId: z.string().min(1),
  boardId: z.string().min(1),
  workspaceId: z.string().min(1),
});

export type ToggleAssigneeInput = z.infer<typeof toggleAssigneeSchema>;
