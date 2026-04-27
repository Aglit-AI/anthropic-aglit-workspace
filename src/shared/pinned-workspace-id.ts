import { createHash } from 'crypto';

export function buildPinnedWorkspaceId(
  workspaceSlug: string,
  companyId: string,
  explicitWorkspaceId?: string
): string {
  const normalizedExplicitWorkspaceId = explicitWorkspaceId?.trim();
  if (normalizedExplicitWorkspaceId) {
    return normalizedExplicitWorkspaceId;
  }

  const normalizedWorkspaceSlug = workspaceSlug.trim().toLowerCase();
  const normalizedCompanyId = companyId.trim().toLowerCase();

  return `aglref_${createHash('sha256')
    .update(`enterprise-workspace:${normalizedWorkspaceSlug}:${normalizedCompanyId}`)
    .digest('hex')
    .slice(0, 32)}`;
}
