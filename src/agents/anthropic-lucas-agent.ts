import {
  DEFAULT_DESKTOP_APP_PROFILE_IDS,
  DEFAULT_TERMINAL_PROFILE_IDS,
  type AgentConfig,
  type ToolId,
} from '@aglit-ai/types';
import { ROOT_AGENT_ID } from '@aglit-ai/default-workspace';
import {
  createAnthropicAgentDescriptions,
  createAnthropicRlAssistantSystemPrompt,
  createAnthropicWorkspaceExamplePhraseObjects,
} from '../shared/agent-helpers.js';
import { ANTHROPIC_BROWSER_PROFILE_IDS } from '../profiles/index.js';

export const ANTHROPIC_LUCAS_AGENT_ID = 'anthropic-lucas-agent';
export const ANTHROPIC_REDDIT_AGENT_ID = 'anthropic-reddit-agent';
export const ANTHROPIC_SOTA_AGENT_ID = 'anthropic-sota-agent';
export const ANTHROPIC_RL_AGENT_ID = 'anthropic-rl-agent';

const ANTHROPIC_CUSTOM_TOOL_IDS: ToolId[] = ['custom_web_linear'];

const ANTHROPIC_AGENT_DESCRIPTIONS = createAnthropicAgentDescriptions('general computer');

export const ANTHROPIC_LUCAS_AGENT: AgentConfig = {
  id: ANTHROPIC_LUCAS_AGENT_ID,
  name: 'Anthy',
  shortDescription: ANTHROPIC_AGENT_DESCRIPTIONS.shortDescription,
  description: ANTHROPIC_AGENT_DESCRIPTIONS.description,
  categories: ['Anthropic', 'RL', 'Product', 'Engineering'],
  toolIds: ANTHROPIC_CUSTOM_TOOL_IDS,
  providerModelSettings: {
    chatProvider: 'gemini',
    chatModel: 'default',
  },
  providerSettings: {
    avatarModel: 'avatar-sample-c',
  },
  extendedSystemPrompt: createAnthropicRlAssistantSystemPrompt(),
  examplePhrases: createAnthropicWorkspaceExamplePhraseObjects(),
  baseAgentId: ROOT_AGENT_ID,
  isDefault: false,
  prewarmOnStartup: false,
};

const buildTaskScopedAnthropicAgent = (
  id: string,
  browserProfileId: string,
  categories: string[]
): AgentConfig => ({
  ...ANTHROPIC_LUCAS_AGENT,
  id,
  categories,
  securityConfig: {
    browserProfileId,
    terminalProfileId: DEFAULT_TERMINAL_PROFILE_IDS.NO_SANDBOX,
    desktopAppProfileId: DEFAULT_DESKTOP_APP_PROFILE_IDS.ALL_APPS_AND_DESKTOP,
  },
});

export const ANTHROPIC_REDDIT_AGENT: AgentConfig = buildTaskScopedAnthropicAgent(
  ANTHROPIC_REDDIT_AGENT_ID,
  ANTHROPIC_BROWSER_PROFILE_IDS.REDDIT_REAL,
  ['Anthropic', 'Research', 'Reddit']
);

export const ANTHROPIC_SOTA_AGENT: AgentConfig = buildTaskScopedAnthropicAgent(
  ANTHROPIC_SOTA_AGENT_ID,
  ANTHROPIC_BROWSER_PROFILE_IDS.SOTA_REAL,
  ['Anthropic', 'Benchmark', 'Evaluation']
);

export const ANTHROPIC_RL_AGENT: AgentConfig = buildTaskScopedAnthropicAgent(
  ANTHROPIC_RL_AGENT_ID,
  ANTHROPIC_BROWSER_PROFILE_IDS.RL_REAL,
  ['Anthropic', 'RL', 'Engineering']
);
