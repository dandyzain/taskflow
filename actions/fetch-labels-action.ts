'use server';

import { prisma } from '@/lib/prisma';

export async function fetchBoardLabels(boardId: string) {
  const labels = await prisma.label.findMany({
    where: { boardId },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, color: true },
  });
  return labels;
}
