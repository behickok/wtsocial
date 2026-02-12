/**
 * Authentication configuration for ContentFlow.
 * Phase 1 uses a simple session-based auth approach.
 * Phase 2 will integrate Clerk or NextAuth.js for full SSO support.
 */

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "editor" | "viewer";
  organizationId: string;
  organizationName: string;
};

/**
 * Role-based permission definitions.
 * Each role inherits permissions from the roles below it.
 */
export const ROLE_PERMISSIONS = {
  viewer: [
    "dashboard:view",
    "content:view",
    "history:view",
  ],
  editor: [
    "dashboard:view",
    "content:view",
    "content:review",
    "content:approve",
    "content:reject",
    "content:edit",
    "sources:view",
    "publishing:view",
    "history:view",
  ],
  admin: [
    "dashboard:view",
    "content:view",
    "content:review",
    "content:approve",
    "content:reject",
    "content:edit",
    "content:delete",
    "content:ingest",
    "sources:view",
    "sources:manage",
    "publishing:view",
    "publishing:manage",
    "settings:view",
    "settings:manage",
    "users:view",
    "users:manage",
    "history:view",
  ],
} as const;

export type Permission = (typeof ROLE_PERMISSIONS)[keyof typeof ROLE_PERMISSIONS][number];

/**
 * Check if a user role has a specific permission.
 */
export function hasPermission(role: SessionUser["role"], permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role] as readonly string[];
  return permissions.includes(permission);
}

/**
 * Middleware-style auth check for API routes.
 * Returns the session user or null if not authenticated.
 *
 * Phase 1: Uses a simplified auth mechanism.
 * Phase 2: Will integrate with Clerk/NextAuth.js session management.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  // Placeholder: In production, this reads from the auth provider session
  // For development, return a default admin user
  if (process.env.NODE_ENV === "development" && process.env.DEV_AUTH_BYPASS === "true") {
    return {
      id: "dev-user-1",
      email: "admin@wtsp.dev",
      name: "Dev Admin",
      role: "admin",
      organizationId: "dev-org-1",
      organizationName: "WealthTech Strategy Partners",
    };
  }

  return null;
}
