import { redirect } from 'next/navigation';
import { getWorkspaceBoards } from '@/lib/queries/board-queries';
import { NoBoards } from '@/components/layout/no-boards';

interface WorkspacePageProps {
  params: Promise<{ workspaceId: string }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { workspaceId } = await params;
  const boards = await getWorkspaceBoards(workspaceId);

  if (boards.length > 0) {
    redirect(`/workspace/${workspaceId}/board/${boards[0].id}`);
  }

  return <NoBoards />;
}
