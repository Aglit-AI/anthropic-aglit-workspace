import type { AglitRepoPackageManifest } from '@aglit-ai/template-workspace';
import { buildPinnedWorkspaceId } from './shared/pinned-workspace-id.js';
import {
  ANTHROPIC_AGENTS,
  ANTHROPIC_LUCAS_AGENT,
  ANTHROPIC_LUCAS_AGENT_ID,
} from './agents/index.js';
import { ANTHROPIC_AGLIT_CONVENTIONS } from './conventions/index.js';
import {
  ANTHROPIC_BROWSER_PROFILES,
  ANTHROPIC_CONTAINER_PROFILES,
  ANTHROPIC_DESKTOP_APP_PROFILES,
} from './profiles/index.js';
import { ANTHROPIC_TASKS } from './tasks/index.js';
import { ANTHROPIC_CUSTOM_TOOLS } from './tools/index.js';
import { createAnthropicWorkspaceExamplePhrases } from './shared/agent-helpers.js';

export const ANTHROPIC_AGLIT_PACKAGE: AglitRepoPackageManifest = {
  workspaceId: buildPinnedWorkspaceId(
    'anthropic-aglit',
    'anthropic.com',
    'aglref_ea79a2fd0f1c4f80b9af64189c3a7483'
  ),
  slug: 'anthropic-aglit',
  displayName: 'Anthropic',
  companyId: 'anthropic.com',
  companyName: 'Anthropic',
  companyLogoUrl: 'assets/company-logo.png',
  primaryAssistantAgentId: ANTHROPIC_LUCAS_AGENT_ID,
  primaryAssistantName: 'Anthy',
  primaryAssistantShortDescription: ANTHROPIC_LUCAS_AGENT.shortDescription,
  primaryAssistantExamplePhrases: createAnthropicWorkspaceExamplePhrases(),
  conventions: ANTHROPIC_AGLIT_CONVENTIONS,
  resources: {
    agents: ANTHROPIC_AGENTS,
    tasks: ANTHROPIC_TASKS,
    customTools: ANTHROPIC_CUSTOM_TOOLS,
    browserProfiles: ANTHROPIC_BROWSER_PROFILES,
    containerProfiles: ANTHROPIC_CONTAINER_PROFILES,
    desktopAppProfiles: ANTHROPIC_DESKTOP_APP_PROFILES,
    widgets: [],
  },
};
