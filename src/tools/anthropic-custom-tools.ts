import type { CustomToolRecordDef } from '@aglit-ai/types';

const TIMESTAMP = '2026-04-25T00:00:00.000Z';

export const ANTHROPIC_CUSTOM_TOOL_ALLOWLIST = ['custom_web_linear', 'custom_wiki_search'] as const;

export const ANTHROPIC_CUSTOM_TOOLS: CustomToolRecordDef[] = [
  {
    id: 'custom_wiki_search',
    tool: {
      id: 'custom_wiki_search',
      name: 'Wikipedia Search',
      normalizedName: 'custom_wiki_search',
      displayName: 'Wikipedia',
      description:
        'Search Wikipedia, open the matched article in browser, and return extracted page text for grounded answers.',
      categories: ['Anthropic', 'Search', 'Reference', 'Wikipedia'],
      inputSchema: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            description: 'The action to run.',
            enum: ['search'],
          },
          query: {
            type: 'string',
            description: 'Wikipedia search query.',
          },
          tabId: {
            description: 'Optional existing browser tab id to reuse.',
            oneOf: [{ type: 'string' }, { type: 'number' }],
          },
          returnView: {
            type: 'boolean',
            description: 'Whether to also capture a desktop view reference.',
          },
        },
        required: ['action', 'query'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          action: { type: 'string' },
          query: { type: 'string' },
          url: { type: 'string' },
          title: { type: 'string' },
          tabId: { type: 'string' },
          appId: { type: 'string' },
          content: {
            type: 'array',
            items: {
              type: 'object',
              properties: { type: { type: 'string' }, text: { type: 'string' } },
            },
          },
          screenshotPath: { type: 'string' },
          capturePath: { type: 'string' },
        },
        required: ['success'],
      },
      type: 'script',
    },
    createdAt: TIMESTAMP,
    updatedAt: TIMESTAMP,
    testCases: [],
    version: 1,
    isLatest: true,
    storage: {
      sessionId: 'anthropic-aglit-workspace',
      relativePath: 'tools/custom_wiki_search',
    },
  },
];
