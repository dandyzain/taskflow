import type { TaskItemReport, EmployeeMetric } from "@/lib/queries/report-queries";

export function exportTasksToCSV(tasks: TaskItemReport[], workspaceName: string) {
  const headers = [
    "ID Task",
    "Judul Task",
    "Board",
    "Kolom / Status",
    "Status Selesai",
    "Prioritas",
    "Tenggat Waktu",
    "Status Terlambat",
    "Assignee",
    "Label",
    "Tanggal Dibuat",
  ];

  const rows = tasks.map((t) => [
    `"${t.id}"`,
    `"${t.title.replace(/"/g, '""')}"`,
    `"${t.boardTitle.replace(/"/g, '""')}"`,
    `"${t.columnTitle.replace(/"/g, '""')}"`,
    `"${t.isCompleted ? "Selesai" : t.isInProgress ? "Sedang Berjalan" : "Belum Selesai"}"`,
    `"${t.priorityLabel}"`,
    `"${t.dueDate ? new Date(t.dueDate).toLocaleDateString("id-ID") : "-"}"`,
    `"${t.isOverdue ? "Terlambat" : t.isDueSoon ? "Mendekati Deadline" : "Tepat Waktu / Aman"}"`,
    `"${t.assignees.map((a) => a.name).join(", ").replace(/"/g, '""')}"`,
    `"${t.labels.map((l) => l.name).join(", ").replace(/"/g, '""')}"`,
    `"${new Date(t.createdAt).toLocaleDateString("id-ID")}"`,
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Laporan_Tugas_${workspaceName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportEmployeesToCSV(employees: EmployeeMetric[], workspaceName: string) {
  const headers = [
    "Nama Karyawan",
    "Email",
    "Role",
    "Total Tugas",
    "Tugas Selesai",
    "Tugas Berjalan",
    "Tugas Terlambat",
    "Tingkat Penyelesaian (%)",
    "Tepat Waktu (%)",
    "Status Beban Kerja",
    "Total Aktivitas",
  ];

  const rows = employees.map((e) => [
    `"${e.name.replace(/"/g, '""')}"`,
    `"${e.email.replace(/"/g, '""')}"`,
    `"${e.role}"`,
    e.totalAssigned,
    e.completedTasks,
    e.inProgressTasks,
    e.overdueTasks,
    `${e.completionRate}%`,
    `${e.onTimeRate}%`,
    `"${e.workloadStatus}"`,
    e.activityCount,
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Laporan_Kinerja_Karyawan_${workspaceName.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
