import { redirect } from 'next/navigation';
import { getWorkspaceBoards } from '@/lib/queries/board-queries';
import { Sidebar } from '@/components/layout/sidebar';
import { prisma } from '@/lib/prisma';
import { getOptionalUser } from '@/lib/auth';

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}

export default async function WorkspaceLayout({ children, params }: WorkspaceLayoutProps) {
  const { workspaceId } = await params;
  
  const user = await getOptionalUser();
  if (!user) {
    redirect('/login');
  }

  // Check membership in requested workspace
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: user.id,
        workspaceId,
      },
    },
  });

  if (!membership) {
    // If not a member of this workspace, find their own workspace
    const userWorkspace = await prisma.workspaceMember.findFirst({
      where: { userId: user.id },
      include: {
        workspace: {
          include: {
            boards: { take: 1 },
          },
        },
      },
    });

    if (userWorkspace?.workspace?.boards[0]) {
      redirect(`/workspace/${userWorkspace.workspace.id}/board/${userWorkspace.workspace.boards[0].id}`);
    }
  }
  
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { name: true },
  });
  
  const boards = await getWorkspaceBoards(workspaceId);
  
  return (
    <div className="flex h-screen pastel-mesh-bg overflow-hidden">
      <Sidebar
        workspaceId={workspaceId}
        workspaceName={workspace?.name ?? 'Workspace'}
        boards={boards}
        currentUser={user}
      />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
