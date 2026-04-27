'use strict';

const { executeTool, closeLocalSdkIpcConnections } = require('@aglit-ai/sdk');

const WIKIPEDIA_API_URL = 'https://en.wikipedia.org/w/api.php';
const ARTICLE_TEXT_SCRIPT = `(() => {\n  const normalize = (value) =>\n    String(value || '')\n      .replace(/\\[[^\\]]*\\]/g, '')\n      .replace(/\\s+/g, ' ')\n      .trim();\n\n  const root =\n    document.querySelector('#mw-content-text') ||\n    document.querySelector('#bodyContent') ||\n    document.body;\n  if (!root) return null;\n\n  const clone = root.cloneNode(true);\n  clone\n    .querySelectorAll('script, style, .metadata, .navbox, .infobox, .reference')\n    .forEach(el => {\n      el.remove();\n    });\n\n  return normalize(clone.textContent).slice(0, 14000);\n})();`;

function parseArgs() {
  const args = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    if (key.includes('=')) {
      const [k, ...rest] = key.split('=');
      args[k] = parseValue(rest.join('='));
      continue;
    }
    if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) {
      args[key] = parseValue(argv[i + 1]);
      i += 1;
      continue;
    }
    args[key] = true;
  }
  return args;
}

function parseValue(value) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function getAgentId() {
  return process.env.AGLIT_AGENT_ID || 'root-agent';
}

function getSessionId() {
  return process.env.AGLIT_SESSION_ID || undefined;
}

function getInternalCustomToolId() {
  return process.env.AGLIT_INTERNAL_CUSTOM_TOOL_ID || undefined;
}

function toNonEmptyString(value) {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseToolPayload(responseData) {
  const result = responseData;
  if (!result || typeof result !== 'object') return result;
  return (
    result.returnValue ??
    (result.structuredResponse && result.structuredResponse.result) ??
    result.result ??
    result
  );
}

async function invokeTool(toolName, args, reason) {
  const response = await executeTool({
    agentId: getAgentId(),
    request: {
      params: {
        name: toolName,
        arguments: { ...args, x_aglit_ai_tool_reason: reason },
      },
      _meta: {
        ...(getSessionId() ? { sessionId: getSessionId() } : {}),
        stream: false,
        ...(getInternalCustomToolId() ? { internalCustomToolId: getInternalCustomToolId() } : {}),
      },
    },
    timeoutMs: 2147483647,
  });

  if (response.data && response.data.error) {
    throw new Error(response.data.error.message || String(response.data.error));
  }

  return response.data ? response.data.result : null;
}

async function navigateWikipedia(url, tabId) {
  const response = await invokeTool(
    'p1_browser',
    {
      openInNewTab: tabId === undefined,
      openInBackground: true,
      background: true,
      active: false,
      ...(typeof tabId === 'string' || typeof tabId === 'number' ? { tabId } : {}),
      url,
    },
    `Anthropic workspace: open Wikipedia URL ${url}`
  );

  const payload = parseToolPayload(response);
  const resolvedTabId = payload && payload.tabId ? String(payload.tabId) : undefined;

  return {
    url: toNonEmptyString(payload?.url) || url,
    tabId: resolvedTabId,
    appId: toNonEmptyString(payload?.appId),
    capturePath: toNonEmptyString(payload?.capturePath),
    screenshotPath: toNonEmptyString(payload?.screenshotPath),
  };
}

async function extractWikipediaText(tabId) {
  const response = await invokeTool(
    'p1_browser',
    {
      ...(tabId !== undefined ? { tabId } : {}),
      code: ARTICLE_TEXT_SCRIPT,
      timeout: 10_000,
    },
    'Anthropic workspace: extract Wikipedia page text'
  );

  const payload = parseToolPayload(response);
  if (!payload) return undefined;
  if (typeof payload === 'string') return payload.trim();
  if (payload.text && typeof payload.text === 'string') return payload.text.trim();
  if (payload.bodyText && typeof payload.bodyText === 'string') return payload.bodyText.trim();
  if (Array.isArray(payload.content)) {
    return payload.content
      .filter(entry => entry && entry.type === 'text' && typeof entry.text === 'string')
      .map(entry => entry.text)
      .join('\n')
      .trim();
  }
  return undefined;
}

async function main() {
  const input = parseArgs();
  const action = typeof input.action === 'string' ? input.action.trim() : 'search';
  const query = typeof input.query === 'string' ? input.query.trim() : '';
  const returnView = Boolean(input.returnView);
  const tabId = input.tabId;

  if (!query) {
    throw new Error('query is required');
  }
  if (action !== 'search') {
    throw new Error(`unsupported action "${action}" for custom_wiki_search`);
  }

  const apiUrl = new URL(WIKIPEDIA_API_URL);
  apiUrl.searchParams.set('action', 'opensearch');
  apiUrl.searchParams.set('search', query);
  apiUrl.searchParams.set('limit', '1');
  apiUrl.searchParams.set('namespace', '0');
  apiUrl.searchParams.set('format', 'json');
  apiUrl.searchParams.set('origin', '*');

  const wikipediaResponse = await fetch(apiUrl, {
    headers: {
      'user-agent': 'Aglit-AI-Wikipedia-Tool/1.0',
    },
  });
  if (!wikipediaResponse.ok) {
    throw new Error(`Wikipedia API request failed with status ${wikipediaResponse.status}`);
  }

  const payload = await wikipediaResponse.json();
  const resolvedTitle = Array.isArray(payload?.[1]) ? toNonEmptyString(payload[1]?.[0]) : undefined;
  const resolvedUrl = Array.isArray(payload?.[3]) ? toNonEmptyString(payload[3]?.[0]) : undefined;
  const wikiUrl =
    resolvedUrl || `https://en.wikipedia.org/w/index.php?search=${encodeURIComponent(query)}`;
  const wikiTitle = resolvedTitle || query;

  const nav = await navigateWikipedia(wikiUrl, tabId);
  const extractedText = await extractWikipediaText(nav.tabId);
  const text = extractedText || '';
  const content = text ? [{ type: 'text', text }] : undefined;
  const result = {
    success: true,
    action,
    query,
    title: wikiTitle,
    url: wikiUrl,
    tabId: nav.tabId,
    appId: nav.appId,
    ...(nav.capturePath ? { capturePath: nav.capturePath } : {}),
    ...(nav.screenshotPath ? { screenshotPath: nav.screenshotPath } : {}),
    ...(content ? { content } : {}),
  };

  if (returnView) {
    const viewResponse = await invokeTool(
      'p1_desktop',
      { action: 'view', appId: nav.appId || 'wikipedia' },
      'Anthropic workspace: capture wikipedia browser view'
    ).catch(() => null);
    const viewPayload = parseToolPayload(viewResponse);
    if (viewPayload) {
      const firstWindow = Array.isArray(viewPayload.windows) ? viewPayload.windows[0] : undefined;
      const vision = firstWindow?.vision || viewPayload.vision;
      result.view = {
        indexPath: toNonEmptyString(vision?.indexPath),
        indexUri: toNonEmptyString(vision?.indexUri),
      };
    }
  }

  process.stdout.write(
    `${JSON.stringify(
      {
        ...result,
        query,
        text,
      },
      null,
      2
    )}\n`
  );
}

main()
  .catch(error => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeLocalSdkIpcConnections().catch(() => {});
  });
