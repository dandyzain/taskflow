import { redirect } from 'next/navigation';
import { getOptionalUser } from '@/lib/auth';
import { getWorkspaceReportData } from '@/lib/queries/report-queries';
import { ReportDashboardClient } from '@/components/reports/report-dashboard-client';

interface ReportsPageProps {
  params: Promise<{ workspaceId: string }>;
}

export default async function ReportsPage({ params }: ReportsPageProps) {
  const { workspaceId } = await params;

  const user = await getOptionalUser();
  if (!user) {
    redirect('/login');
  }

  const reportData = await getWorkspaceReportData(workspaceId);
  if (!reportData) {
    redirect(`/workspace/${workspaceId}`);
  }

  return (
    <div className="h-full overflow-hidden">
      <ReportDashboardClient initialData={reportData} workspaceId={workspaceId} />
    </div>
  );
}
