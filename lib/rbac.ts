import { prisma } from "@/lib/prisma";

export type WorkspaceRole = "ADMIN" | "MEMBER" | "VIEWER";

/**
 * Role-Based Access Control (RBAC) utilities.
 *
 * Every mutating Server Action must call `assertWorkspaceRole` to verify
 * that the current user has the required role within the target workspace.
 * Data is always scoped to a workspace — there are no cross-workspace queries.
 */

const ROLE_HIERARCHY: Record<WorkspaceRole, number> = {
  VIEWER: 0,
  MEMBER: 1,
  ADMIN: 2,
};

/**
 * Asserts that a user has at least the specified role within a workspace.
 *
 * @param userId      - The authenticated user's ID
 * @param workspaceId - The workspace to check membership against
 * @param minimumRole - The minimum role required for the operation
 *
 * @throws AuthorizationError if the user is not a member or lacks the required role
 */
export async function assertWorkspaceRole(
  userId: string,
  workspaceId: string,
  minimumRole: WorkspaceRole
): Promise<WorkspaceRole> {
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId,
      },
    },
    select: { role: true },
  });

  if (!membership) {
    throw new AuthorizationError(
      "You are not a member of this workspace."
    );
  }

  if (ROLE_HIERARCHY[membership.role as WorkspaceRole] < ROLE_HIERARCHY[minimumRole]) {
    throw new AuthorizationError(
      `This action requires at least ${minimumRole} role. Your current role is ${membership.role}.`
    );
  }

  return membership.role as WorkspaceRole;
}

/**
 * Verifies that a board belongs to the specified workspace.
 * Prevents cross-workspace data access through parameter tampering.
 */
export async function assertBoardInWorkspace(
  boardId: string,
  workspaceId: string
): Promise<void> {
  const board = await prisma.board.findFirst({
    where: { id: boardId, workspaceId },
    select: { id: true },
  });

  if (!board) {
    throw new AuthorizationError(
      "Board not found in this workspace."
    );
  }
}

/**
 * Verifies that a column belongs to the specified board.
 */
export async function assertColumnInBoard(
  columnId: string,
  boardId: string
): Promise<void> {
  const column = await prisma.column.findFirst({
    where: { id: columnId, boardId },
    select: { id: true },
  });

  if (!column) {
    throw new AuthorizationError(
      "Column not found in this board."
    );
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthorizationError";
  }
}
