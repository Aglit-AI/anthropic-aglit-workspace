import type { AglitRepoConventions } from '@aglit-ai/template-workspace';

export const ANTHROPIC_AGLIT_CONVENTIONS: AglitRepoConventions = {
  packageSlug: 'anthropic-aglit',
  packageDisplayName: 'Anthropic Package',
  requiredFolders: ['agents', 'tasks', 'tools', 'profiles', 'conventions', 'deliveries'],
  namingRules: [
    'Use anthropic-prefixed stable IDs for all package resources.',
    'Keep the primary assistant branded as Anthy.',
    'Task names should start with a verb and clearly describe the delivery stage without adding a Anthropic title prefix.',
  ],
  securityRules: [
    'Website exploration should inspect the real target flow before PRDs are written.',
    'Implementation work should use dedicated git worktrees before editing code for tickets or PRs.',
    'Feature completion claims require proof tied to acceptance criteria.',
  ],
  taskRules: [
    'RL-environment tasks should default to on-demand execution.',
    'PRD tasks should require website exploration, not memory-only planning.',
    'PRD tasks should write the PRD in Google Docs and return the document link.',
    'Linear-planning tasks should decompose work into implementation-ready tickets with validation and proof requirements.',
    'When the user does not provide an existing repo, implementation should default to ~/Projects/anthropic-aglit/deliveries/<project-slug> inside the Anthropic aglit repo.',
    'Greenfield implementation must create the delivery directory before running repo-inspection commands outside that delivery root.',
    'When a delivery path is explicit, create and inspect that directory directly instead of using broad file-search calls to discover it.',
    'Every delivery must include an AGENTS.md file in the delivery root.',
    'Delivery plans should include OpenAPI ownership, restore-state architecture, local launch, real database setup, Vercel deployment, and QA verification.',
    'Implementation tasks must require tests and working proof before PR submission.',
    'Implementation tasks should end with validation evidence and any remaining risks.',
  ],
};
