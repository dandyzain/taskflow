import { redirect } from 'next/navigation';
import { getWorkspaceBoards } from '@/lib/queries/board-queries';

interface WorkspacePageProps {
  params: Promise<{ workspaceId: string }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { workspaceId } = await params;
  const boards = await getWorkspaceBoards(workspaceId);
  
  if (boards.length > 0) {
    redirect(`/workspace/${workspaceId}/board/${boards[0].id}`);
  }
  
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold">No boards yet</h2>
        <p className="text-muted-foreground mt-1">Create your first board to get started.</p>
      </div>
    </div>
  );
}
