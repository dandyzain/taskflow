import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Cleaning up old demo data in workspace ws_demo...");

  // Clean existing demo data in ws_demo to prevent duplicate/orphaned records
  await prisma.activity.deleteMany({ where: { workspaceId: "ws_demo" } });
  await prisma.cardAssignee.deleteMany({ where: { card: { column: { board: { workspaceId: "ws_demo" } } } } });
  await prisma.cardLabel.deleteMany({ where: { card: { column: { board: { workspaceId: "ws_demo" } } } } });
  await prisma.label.deleteMany({ where: { board: { workspaceId: "ws_demo" } } });
  await prisma.card.deleteMany({ where: { column: { board: { workspaceId: "ws_demo" } } } });
  await prisma.column.deleteMany({ where: { board: { workspaceId: "ws_demo" } } });
  await prisma.board.deleteMany({ where: { workspaceId: "ws_demo" } });

  console.log("🌱 Seeding demo users...");
  const defaultPasswordHash = await bcrypt.hash("password123", 10);

  const userDemo = await prisma.user.upsert({
    where: { email: "demo@taskflow.dev" },
    update: { password: defaultPasswordHash, name: "Demo User" },
    create: {
      id: "user_demo",
      email: "demo@taskflow.dev",
      name: "Demo User",
      password: defaultPasswordHash,
    },
  });

  const userSarah = await prisma.user.upsert({
    where: { email: "sarah@taskflow.dev" },
    update: { password: defaultPasswordHash, name: "Sarah Chen" },
    create: {
      id: "user_sarah",
      email: "sarah@taskflow.dev",
      name: "Sarah Chen",
      password: defaultPasswordHash,
    },
  });

  const userAlex = await prisma.user.upsert({
    where: { email: "alex@taskflow.dev" },
    update: { password: defaultPasswordHash, name: "Alex Kim" },
    create: {
      id: "user_alex",
      email: "alex@taskflow.dev",
      name: "Alex Kim",
      password: defaultPasswordHash,
    },
  });

  console.log("🌱 Seeding demo workspace...");
  const wsDemo = await prisma.workspace.upsert({
    where: { slug: "demo" },
    update: { name: "Demo Workspace" },
    create: {
      id: "ws_demo",
      name: "Demo Workspace",
      slug: "demo",
    },
  });

  // Assign members
  await prisma.workspaceMember.upsert({
    where: { userId_workspaceId: { userId: userDemo.id, workspaceId: wsDemo.id } },
    update: { role: "ADMIN" },
    create: { userId: userDemo.id, workspaceId: wsDemo.id, role: "ADMIN" },
  });

  await prisma.workspaceMember.upsert({
    where: { userId_workspaceId: { userId: userSarah.id, workspaceId: wsDemo.id } },
    update: { role: "MEMBER" },
    create: { userId: userSarah.id, workspaceId: wsDemo.id, role: "MEMBER" },
  });

  await prisma.workspaceMember.upsert({
    where: { userId_workspaceId: { userId: userAlex.id, workspaceId: wsDemo.id } },
    update: { role: "MEMBER" },
    create: { userId: userAlex.id, workspaceId: wsDemo.id, role: "MEMBER" },
  });

  console.log("🌱 Seeding Board 1: Sprint Board...");
  const boardDemo = await prisma.board.create({
    data: {
      id: "board_demo",
      title: "Sprint Board",
      description: "Main sprint board for active development tasks",
      workspaceId: wsDemo.id,
    },
  });

  // Labels for Board 1
  const labelBug = await prisma.label.create({
    data: { id: "lbl_bug", name: "Bug", color: "#ef4444", boardId: boardDemo.id },
  });
  const labelFeature = await prisma.label.create({
    data: { id: "lbl_feat", name: "Feature", color: "#3b82f6", boardId: boardDemo.id },
  });
  const labelUrgent = await prisma.label.create({
    data: { id: "lbl_urg", name: "Urgent", color: "#f97316", boardId: boardDemo.id },
  });
  const labelImprovement = await prisma.label.create({
    data: { id: "lbl_imp", name: "Improvement", color: "#8b5cf6", boardId: boardDemo.id },
  });
  const labelDocs = await prisma.label.create({
    data: { id: "lbl_doc", name: "Docs", color: "#10b981", boardId: boardDemo.id },
  });

  // Columns for Board 1
  const colBacklog = await prisma.column.create({
    data: { id: "col_backlog", title: "Backlog", position: 1000, boardId: boardDemo.id },
  });
  const colTodo = await prisma.column.create({
    data: { id: "col_todo", title: "To Do", position: 2000, boardId: boardDemo.id },
  });
  const colProgress = await prisma.column.create({
    data: { id: "col_progress", title: "In Progress", position: 3000, boardId: boardDemo.id },
  });
  const colDone = await prisma.column.create({
    data: { id: "col_done", title: "Done", position: 4000, boardId: boardDemo.id },
  });

  // Date offsets
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const twoDaysAgo = new Date(now);
  twoDaysAgo.setDate(now.getDate() - 2);
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + 7);

  // Cards for Board 1
  const cardsData = [
    {
      id: "card_1",
      title: "Set up CI/CD pipeline",
      description: "Automate build and testing workflow using GitHub Actions",
      columnId: colBacklog.id,
      position: 1000,
      priority: 2,
      dueDate: nextWeek,
      labels: [labelFeature.id],
      assignees: [userDemo.id, userSarah.id],
    },
    {
      id: "card_2",
      title: "Design user auth flow",
      description: "JWT cookie-based authentication with role verification",
      columnId: colBacklog.id,
      position: 2000,
      priority: 1,
      dueDate: null,
      labels: [labelFeature.id],
      assignees: [userSarah.id],
    },
    {
      id: "card_3",
      title: "Create API documentation",
      description: "Document internal actions and query patterns",
      columnId: colBacklog.id,
      position: 3000,
      priority: 1,
      dueDate: null,
      labels: [labelDocs.id],
      assignees: [userDemo.id],
    },
    {
      id: "card_4",
      title: "Implement drag and drop",
      description: "Integrate @dnd-kit sortable for smooth column and card reordering",
      columnId: colTodo.id,
      position: 1000,
      priority: 3,
      dueDate: tomorrow,
      labels: [labelFeature.id, labelUrgent.id],
      assignees: [userAlex.id],
    },
    {
      id: "card_5",
      title: "Refactor state management",
      description: "Optimize optimistic updates and snapshot rollbacks",
      columnId: colTodo.id,
      position: 2000,
      priority: 2,
      dueDate: null,
      labels: [labelImprovement.id],
      assignees: [userSarah.id, userAlex.id],
    },
    {
      id: "card_6",
      title: "Build Kanban board UI",
      description: "Pastel theme, smooth cards, and responsive column layouts",
      columnId: colProgress.id,
      position: 1000,
      priority: 3,
      dueDate: yesterday, // Overdue demo
      labels: [labelFeature.id],
      assignees: [userDemo.id],
    },
    {
      id: "card_7",
      title: "Write unit tests for actions",
      description: "Validate RBAC permission checks and schema validations",
      columnId: colProgress.id,
      position: 2000,
      priority: 2,
      dueDate: null,
      labels: [labelBug.id],
      assignees: [userAlex.id],
    },
    {
      id: "card_8",
      title: "Initialize Next.js project",
      description: "Setup Next.js 15 App Router with Tailwind CSS",
      columnId: colDone.id,
      position: 1000,
      priority: 0,
      dueDate: null,
      labels: [],
      assignees: [userDemo.id],
    },
    {
      id: "card_9",
      title: "Set up Prisma schema",
      description: "Define Workspace, Board, Column, Card, and Activity models",
      columnId: colDone.id,
      position: 2000,
      priority: 0,
      dueDate: null,
      labels: [],
      assignees: [userSarah.id],
    },
  ];

  for (const c of cardsData) {
    await prisma.card.create({
      data: {
        id: c.id,
        title: c.title,
        description: c.description,
        columnId: c.columnId,
        position: c.position,
        priority: c.priority,
        dueDate: c.dueDate,
        labels: {
          create: c.labels.map((lblId) => ({ labelId: lblId })),
        },
        assignees: {
          create: c.assignees.map((userId) => ({ userId })),
        },
      },
    });
  }

  console.log("🌱 Seeding Board 2: Product Roadmap...");
  const boardRoadmap = await prisma.board.create({
    data: {
      id: "board_roadmap",
      title: "Product Roadmap",
      description: "Strategic initiatives & feature releases",
      workspaceId: wsDemo.id,
    },
  });

  const colPlanned = await prisma.column.create({
    data: { id: "col_r_plan", title: "Planned", position: 1000, boardId: boardRoadmap.id },
  });
  const colDev = await prisma.column.create({
    data: { id: "col_r_dev", title: "In Development", position: 2000, boardId: boardRoadmap.id },
  });
  const colShipped = await prisma.column.create({
    data: { id: "col_r_done", title: "Shipped", position: 3000, boardId: boardRoadmap.id },
  });

  const roadmapCards = [
    {
      id: "card_r1",
      title: "AI Task Autocomplete & Summary",
      description: "Assist users with automatic task suggestions",
      columnId: colPlanned.id,
      position: 1000,
      priority: 3,
      dueDate: nextWeek,
      assignees: [userDemo.id],
    },
    {
      id: "card_r2",
      title: "Mobile Navigation Enhancements",
      description: "Optimized mobile drawer and touch gestures",
      columnId: colDev.id,
      position: 1000,
      priority: 2,
      dueDate: tomorrow,
      assignees: [userAlex.id],
    },
    {
      id: "card_r3",
      title: "Dashboard & Reporting Module",
      description: "Visual KPI cards, employee metrics, and CSV reporting",
      columnId: colShipped.id,
      position: 1000,
      priority: 2,
      dueDate: null,
      assignees: [userDemo.id, userSarah.id],
    },
    {
      id: "card_r4",
      title: "Custom Pastel Theme Engine",
      description: "Modern soft aesthetic color palette",
      columnId: colShipped.id,
      position: 2000,
      priority: 1,
      dueDate: null,
      assignees: [userSarah.id],
    },
  ];

  for (const rc of roadmapCards) {
    await prisma.card.create({
      data: {
        id: rc.id,
        title: rc.title,
        description: rc.description,
        columnId: rc.columnId,
        position: rc.position,
        priority: rc.priority,
        dueDate: rc.dueDate,
        assignees: {
          create: rc.assignees.map((userId) => ({ userId })),
        },
      },
    });
  }

  console.log("🌱 Seeding realistic audit trail activities for demo charts...");
  const activityLogs = [
    { action: "CARD_CREATED", userId: userDemo.id, daysAgo: 6, entityType: "CARD", entityId: "card_8" },
    { action: "CARD_MOVED", userId: userDemo.id, daysAgo: 5, entityType: "CARD", entityId: "card_8" },
    { action: "CARD_CREATED", userId: userSarah.id, daysAgo: 5, entityType: "CARD", entityId: "card_9" },
    { action: "CARD_MOVED", userId: userSarah.id, daysAgo: 4, entityType: "CARD", entityId: "card_9" },
    { action: "CARD_CREATED", userId: userAlex.id, daysAgo: 4, entityType: "CARD", entityId: "card_4" },
    { action: "CARD_CREATED", userId: userDemo.id, daysAgo: 3, entityType: "CARD", entityId: "card_6" },
    { action: "CARD_UPDATED", userId: userDemo.id, daysAgo: 3, entityType: "CARD", entityId: "card_6" },
    { action: "CARD_CREATED", userId: userSarah.id, daysAgo: 2, entityType: "CARD", entityId: "card_5" },
    { action: "CARD_MOVED", userId: userDemo.id, daysAgo: 2, entityType: "CARD", entityId: "card_r4" },
    { action: "CARD_CREATED", userId: userAlex.id, daysAgo: 1, entityType: "CARD", entityId: "card_7" },
    { action: "CARD_MOVED", userId: userSarah.id, daysAgo: 1, entityType: "CARD", entityId: "card_r3" },
    { action: "CARD_CREATED", userId: userDemo.id, daysAgo: 0, entityType: "CARD", entityId: "card_1" },
    { action: "CARD_UPDATED", userId: userAlex.id, daysAgo: 0, entityType: "CARD", entityId: "card_4" },
  ];

  for (const act of activityLogs) {
    const actDate = new Date();
    actDate.setDate(actDate.getDate() - act.daysAgo);
    actDate.setHours(10 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60));

    await prisma.activity.create({
      data: {
        action: act.action,
        userId: act.userId,
        workspaceId: wsDemo.id,
        entityType: act.entityType,
        entityId: act.entityId,
        metadata: JSON.stringify({ note: "Activity recorded for demo" }),
        createdAt: actDate,
      },
    });
  }

  console.log("✨ Seeding completed successfully! Demo data is ready.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
