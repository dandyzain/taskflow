'use server';

import { prisma } from '@/lib/prisma';
import {
  hashPassword,
  comparePassword,
  createSessionToken,
  setSessionCookie,
  removeSessionCookie,
} from '@/lib/auth';
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from '@/lib/validations/auth';

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function loginUser(
  input: LoginInput
): Promise<ActionResult<{ workspaceId: string; boardId: string }>> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((i) => i.message).join(', '),
    };
  }

  const email = parsed.data.email.toLowerCase();
  const { password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
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
          take: 1,
        },
      },
    });

    if (!user || !user.password) {
      return {
        success: false,
        error: 'Invalid email or password.',
      };
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return {
        success: false,
        error: 'Invalid email or password.',
      };
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
    });
    await setSessionCookie(token);

    // Determine target workspace and board
    let targetWorkspaceId: string;
    let targetBoardId: string;

    const firstMembership = user.memberships[0];
    if (firstMembership && firstMembership.workspace) {
      targetWorkspaceId = firstMembership.workspace.id;
      const firstBoard = firstMembership.workspace.boards[0];
      if (firstBoard) {
        targetBoardId = firstBoard.id;
      } else {
        // Create a board if workspace has none
        const newBoard = await prisma.board.create({
          data: {
            title: 'Sprint Board',
            workspaceId: targetWorkspaceId,
            description: 'Main board for tasks',
          },
        });
        targetBoardId = newBoard.id;
      }
    } else {
      // Create personal workspace if user has none
      const newWs = await prisma.workspace.create({
        data: {
          name: `${user.name}'s Workspace`,
          slug: `ws-${Date.now()}`,
          members: {
            create: {
              userId: user.id,
              role: 'ADMIN',
            },
          },
          boards: {
            create: {
              title: 'Sprint Board',
              description: 'Main board for tasks',
            },
          },
        },
        include: { boards: true },
      });
      targetWorkspaceId = newWs.id;
      targetBoardId = newWs.boards[0].id;
    }

    return {
      success: true,
      data: {
        workspaceId: targetWorkspaceId,
        boardId: targetBoardId,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred during login.',
    };
  }
}

export async function registerUser(
  input: RegisterInput
): Promise<ActionResult<{ workspaceId: string; boardId: string }>> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((i) => i.message).join(', '),
    };
  }

  const { name, password } = parsed.data;
  const email = parsed.data.email.toLowerCase();

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return {
        success: false,
        error: 'An account with this email address already exists.',
      };
    }

    const hashedPassword = await hashPassword(password);
    const userSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'user';
    const uniqueSlug = `${userSlug}-${Date.now().toString().slice(-6)}`;

    // Create user, workspace, default board, columns, labels, and starter cards
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
        },
      });

      const workspace = await tx.workspace.create({
        data: {
          name: `${name}'s Workspace`,
          slug: uniqueSlug,
          members: {
            create: {
              userId: user.id,
              role: 'ADMIN',
            },
          },
        },
      });

      const board = await tx.board.create({
        data: {
          title: 'Sprint Board',
          description: 'Welcome to your new TaskFlow board!',
          workspaceId: workspace.id,
        },
      });

      // Default columns
      const colBacklog = await tx.column.create({
        data: { title: 'Backlog', position: 1000, boardId: board.id },
      });
      const colTodo = await tx.column.create({
        data: { title: 'To Do', position: 2000, boardId: board.id },
      });
      const colInProgress = await tx.column.create({
        data: { title: 'In Progress', position: 3000, boardId: board.id },
      });
      const colDone = await tx.column.create({
        data: { title: 'Done', position: 4000, boardId: board.id },
      });

      // Default labels
      const labelFeature = await tx.label.create({
        data: { name: 'Feature', color: '#3b82f6', boardId: board.id },
      });
      const labelUrgent = await tx.label.create({
        data: { name: 'Urgent', color: '#f97316', boardId: board.id },
      });
      const labelDocs = await tx.label.create({
        data: { name: 'Docs', color: '#10b981', boardId: board.id },
      });

      // Starter cards
      const card1 = await tx.card.create({
        data: {
          title: 'Explore Kanban drag and drop',
          description: 'Try moving cards between columns or reordering them.',
          position: 1000,
          priority: 2,
          columnId: colTodo.id,
          labels: {
            create: { labelId: labelFeature.id },
          },
          assignees: {
            create: { userId: user.id },
          },
        },
      });

      const card2 = await tx.card.create({
        data: {
          title: 'Invite team members to workspace',
          description: 'Collaborate with teammates on shared boards.',
          position: 2000,
          priority: 1,
          columnId: colBacklog.id,
          labels: {
            create: { labelId: labelDocs.id },
          },
        },
      });

      await tx.card.create({
        data: {
          title: 'Account created successfully',
          description: 'Welcome to TaskFlow! Your account setup is complete.',
          position: 1000,
          priority: 3,
          columnId: colDone.id,
          labels: {
            create: { labelId: labelUrgent.id },
          },
          assignees: {
            create: { userId: user.id },
          },
        },
      });

      await tx.activity.create({
        data: {
          action: 'WORKSPACE_CREATED',
          userId: user.id,
          workspaceId: workspace.id,
          entityType: 'WORKSPACE',
          entityId: workspace.id,
          metadata: JSON.stringify({ name: workspace.name }),
        },
      });

      return {
        user,
        workspace,
        board,
      };
    });

    const token = await createSessionToken({
      userId: result.user.id,
      email: result.user.email,
    });
    await setSessionCookie(token);

    return {
      success: true,
      data: {
        workspaceId: result.workspace.id,
        boardId: result.board.id,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred during registration.',
    };
  }
}

export async function logoutUser(): Promise<ActionResult> {
  try {
    await removeSessionCookie();
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred during logout.',
    };
  }
}
