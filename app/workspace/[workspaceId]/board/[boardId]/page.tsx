import { redirect } from 'next/navigation';
import { getBoardWithColumns } from '@/lib/queries/board-queries';
import { KanbanBoard } from '@/components/kanban/board';

interface BoardPageProps {
  params: Promise<{
    workspaceId: string;
    boardId: string;
  }>;
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { workspaceId, boardId } = await params;
  const boardData = await getBoardWithColumns(boardId, workspaceId);

  if (!boardData) {
    redirect(`/workspace/${workspaceId}`);
  }

  return (
    <div className="flex h-full w-full min-h-0 flex-col overflow-hidden px-3 pt-4 sm:px-5 sm:pt-5 lg:px-7 lg:pt-6">
      <KanbanBoard initialData={boardData} />
    </div>
  );
}
