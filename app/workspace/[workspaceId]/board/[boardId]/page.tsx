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
    <div className="h-full w-full p-3 sm:p-5 lg:p-6 overflow-hidden flex flex-col">
      <KanbanBoard initialData={boardData} />
    </div>
  );
}
