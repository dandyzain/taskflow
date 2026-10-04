import { redirect } from 'next/navigation';
import { getOptionalUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function HomePage() {
  const user = await getOptionalUser();

  if (!user) {
    redirect('/login');
  }

  // Find user's first workspace and board
  const member = await prisma.workspaceMember.findFirst({
    where: { userId: user.id },
    include: {
      workspace: {
        include: {
          boards: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
    },
  });

  if (member?.workspace?.boards[0]) {
    redirect(`/workspace/${member.workspace.id}/board/${member.workspace.boards[0].id}`);
  }

  // Fallback to demo board if exists
  redirect('/workspace/ws_demo/board/board_demo');
}
