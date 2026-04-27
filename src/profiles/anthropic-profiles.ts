import {
  DEFAULT_BROWSER_APP_BUNDLE_IDS,
  DEFAULT_DESKTOP_APP_PROFILE_IDS,
  DEFAULT_TERMINAL_PROFILE_IDS,
  type BrowserProfile,
  type DesktopAppProfile,
  type TerminalProfile,
} from '@aglit-ai/types';

const ANTHROPIC_PROFILE_TIMESTAMP = '2026-04-15T00:00:00.000Z';

export const ANTHROPIC_BROWSER_PROFILE_IDS = {
  REDDIT_REAL: 'browser-profile-anthropic-reddit-real',
  SOTA_REAL: 'browser-profile-anthropic-sota-real',
  RL_REAL: 'browser-profile-anthropic-rl-real',
} as const;

export const ANTHROPIC_BROWSER_PROFILES: BrowserProfile[] = [
  {
    id: ANTHROPIC_BROWSER_PROFILE_IDS.REDDIT_REAL,
    name: 'Anthropic Reddit Real Browser',
    description:
      'Dedicated real-browser profile for Anthropic Reddit research tasks to avoid debugger contention.',
    version: 1,
    createdAt: ANTHROPIC_PROFILE_TIMESTAMP,
    updatedAt: ANTHROPIC_PROFILE_TIMESTAMP,
    isActive: true,
    settings: {
      securitySettings: {},
      metadata: {
        managed: true,
        categories: ['Anthropic', 'Research'],
      },
      sessionOptions: {
        mode: 'real',
      },
    },
  },
  {
    id: ANTHROPIC_BROWSER_PROFILE_IDS.SOTA_REAL,
    name: 'Anthropic SOTA Real Browser',
    description:
      'Dedicated real-browser profile for Anthropic benchmark tasks to avoid debugger contention.',
    version: 1,
    createdAt: ANTHROPIC_PROFILE_TIMESTAMP,
    updatedAt: ANTHROPIC_PROFILE_TIMESTAMP,
    isActive: true,
    settings: {
      securitySettings: {},
      metadata: {
        managed: true,
        categories: ['Anthropic', 'Benchmark'],
      },
      sessionOptions: {
        mode: 'real',
      },
    },
  },
  {
    id: ANTHROPIC_BROWSER_PROFILE_IDS.RL_REAL,
    name: 'Anthropic RL Real Browser',
    description:
      'Dedicated real-browser profile for Anthropic RL delivery tasks to avoid debugger contention.',
    version: 1,
    createdAt: ANTHROPIC_PROFILE_TIMESTAMP,
    updatedAt: ANTHROPIC_PROFILE_TIMESTAMP,
    isActive: true,
    settings: {
      securitySettings: {},
      metadata: {
        managed: true,
        categories: ['Anthropic', 'RL'],
      },
      sessionOptions: {
        mode: 'real',
      },
    },
  },
];

export const ANTHROPIC_CONTAINER_PROFILES: TerminalProfile[] = [
  {
    id: DEFAULT_TERMINAL_PROFILE_IDS.NO_SANDBOX,
    name: 'Full Terminal Access',
    description: 'Full terminal access with no restrictions. Use with caution.',
    createdAt: ANTHROPIC_PROFILE_TIMESTAMP,
    isActive: true,
    settings: {
      metadata: {
        managed: false,
        slug: 'no-sandbox',
        categories: ['System', 'Anthropic'],
      },
    },
  },
];

export const ANTHROPIC_DESKTOP_APP_PROFILES: DesktopAppProfile[] = [
  {
    id: DEFAULT_DESKTOP_APP_PROFILE_IDS.ALL_APPS_AND_DESKTOP,
    name: 'All Apps & Desktop Access',
    description: 'Allows interacting with any macOS application and the raw desktop.',
    createdAt: ANTHROPIC_PROFILE_TIMESTAMP,
    updatedAt: ANTHROPIC_PROFILE_TIMESTAMP,
    isActive: true,
    isDefault: false,
    version: 2,
    settings: {
      securitySettings: {
        allowedAppIds: ['*', 'desktop'],
      },
      metadata: {
        managed: false,
        slug: 'all-apps-desktop',
        categories: ['System', 'Anthropic'],
      },
    },
  },
  {
    id: 'desktop-app-profile-anthropic-browser-only',
    name: 'Anthropic Browser-Only Desktop Access',
    description: 'Restrict desktop automation to browser applications for Anthropic web workflows.',
    createdAt: ANTHROPIC_PROFILE_TIMESTAMP,
    updatedAt: ANTHROPIC_PROFILE_TIMESTAMP,
    isActive: true,
    isDefault: false,
    version: 1,
    settings: {
      securitySettings: {
        allowedAppIds: [...DEFAULT_BROWSER_APP_BUNDLE_IDS],
      },
      metadata: {
        managed: false,
        slug: 'anthropic-browser-only',
        categories: ['Anthropic'],
      },
    },
  },
];
