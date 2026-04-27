import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ANTHROPIC_AGLIT_PACKAGE } from '../dist/src/manifest.js';
import { assertExportSanity } from '../../template-workspace/scripts/export-sanity-checks.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf8');
}

async function copyDirectoryIfExists(sourceDir: string, targetDir: string): Promise<void> {
  try {
    const stat = await fs.stat(sourceDir);
    if (!stat.isDirectory()) {
      return;
    }
  } catch {
    return;
  }
  await fs.mkdir(path.dirname(targetDir), { recursive: true });
  await fs.cp(sourceDir, targetDir, { recursive: true, force: true });
}

async function run(): Promise<void> {
  const outputRootArg = process.argv[2];
  const outputRoot = outputRootArg
    ? path.resolve(process.cwd(), outputRootArg)
    : path.resolve(__dirname, '../dist/defaults');

  const { resources } = ANTHROPIC_AGLIT_PACKAGE;
  const primaryAssistant = resources.agents.find(
    agent => agent.id === ANTHROPIC_AGLIT_PACKAGE.primaryAssistantAgentId
  );
  await assertExportSanity({
    packageRoot: path.resolve(__dirname, '..'),
    packageName: ANTHROPIC_AGLIT_PACKAGE.slug,
    companyLogoUrl: ANTHROPIC_AGLIT_PACKAGE.companyLogoUrl,
    primaryAssistantAgentId: ANTHROPIC_AGLIT_PACKAGE.primaryAssistantAgentId,
    primaryAssistantName: ANTHROPIC_AGLIT_PACKAGE.primaryAssistantName,
    resources,
  });

  await writeJson(path.join(outputRoot, 'metadata.json'), {
    generatedAt: new Date().toISOString(),
    slug: ANTHROPIC_AGLIT_PACKAGE.slug,
    displayName: ANTHROPIC_AGLIT_PACKAGE.displayName,
    companyId: ANTHROPIC_AGLIT_PACKAGE.companyId,
    companyName: ANTHROPIC_AGLIT_PACKAGE.companyName,
    primaryAssistantAgentId: ANTHROPIC_AGLIT_PACKAGE.primaryAssistantAgentId,
    primaryAssistantName: ANTHROPIC_AGLIT_PACKAGE.primaryAssistantName,
    ...(typeof ANTHROPIC_AGLIT_PACKAGE.primaryAssistantShortDescription === 'string' &&
    ANTHROPIC_AGLIT_PACKAGE.primaryAssistantShortDescription.trim().length > 0
      ? {
          primaryAssistantShortDescription:
            ANTHROPIC_AGLIT_PACKAGE.primaryAssistantShortDescription.trim(),
        }
      : typeof primaryAssistant?.shortDescription === 'string' &&
          primaryAssistant.shortDescription.trim().length > 0
        ? { primaryAssistantShortDescription: primaryAssistant.shortDescription.trim() }
        : typeof primaryAssistant?.description === 'string' &&
            primaryAssistant.description.trim().length > 0
          ? { primaryAssistantShortDescription: primaryAssistant.description.trim() }
          : {}),
    ...(Array.isArray(ANTHROPIC_AGLIT_PACKAGE.primaryAssistantExamplePhrases) &&
    ANTHROPIC_AGLIT_PACKAGE.primaryAssistantExamplePhrases.length > 0
      ? { primaryAssistantExamplePhrases: ANTHROPIC_AGLIT_PACKAGE.primaryAssistantExamplePhrases }
      : Array.isArray(primaryAssistant?.examplePhrases) &&
          primaryAssistant.examplePhrases.length > 0
        ? {
            primaryAssistantExamplePhrases: primaryAssistant.examplePhrases
              .map(example => example?.phrase)
              .filter(
                (phrase): phrase is string => typeof phrase === 'string' && phrase.trim().length > 0
              ),
          }
        : {}),
    ...(ANTHROPIC_AGLIT_PACKAGE.organizationId
      ? { organizationId: ANTHROPIC_AGLIT_PACKAGE.organizationId }
      : {}),
    ...(ANTHROPIC_AGLIT_PACKAGE.organizationName
      ? { organizationName: ANTHROPIC_AGLIT_PACKAGE.organizationName }
      : {}),
    ...(ANTHROPIC_AGLIT_PACKAGE.teamId ? { teamId: ANTHROPIC_AGLIT_PACKAGE.teamId } : {}),
    ...(ANTHROPIC_AGLIT_PACKAGE.teamName ? { teamName: ANTHROPIC_AGLIT_PACKAGE.teamName } : {}),
    ...(ANTHROPIC_AGLIT_PACKAGE.companyLogoUrl
      ? { companyLogoUrl: ANTHROPIC_AGLIT_PACKAGE.companyLogoUrl }
      : {}),
    ...(Array.isArray(resources.agentOverrides) && resources.agentOverrides.length > 0
      ? { resources: { agentOverrides: resources.agentOverrides } }
      : {}),
    version: ANTHROPIC_AGLIT_PACKAGE.version,
    counts: {
      agents: resources.agents.length,
      browserProfiles: resources.browserProfiles.length,
      terminalProfiles: resources.containerProfiles.length,
      desktopAppProfiles: resources.desktopAppProfiles.length,
      customTools: resources.customTools.length,
      tasks: resources.tasks.length,
      skills: 0,
      widgets: Array.isArray(resources.widgets) ? resources.widgets.length : 0,
      agentOverrides: Array.isArray(resources.agentOverrides) ? resources.agentOverrides.length : 0,
    },
  });

  await writeJson(path.join(outputRoot, 'agents/user-agents.json'), resources.agents);
  await writeJson(
    path.join(outputRoot, 'browsers/browser-profiles.json'),
    resources.browserProfiles
  );
  await writeJson(
    path.join(outputRoot, 'terminals/terminal-profiles.json'),
    resources.containerProfiles
  );
  await writeJson(
    path.join(outputRoot, 'desktop-apps/desktop-app-profiles.json'),
    resources.desktopAppProfiles
  );
  await writeJson(path.join(outputRoot, 'tools/custom-tools.json'), resources.customTools);
  await writeJson(path.join(outputRoot, 'skills/skills.json'), []);
  await writeJson(path.join(outputRoot, 'widgets/widgets.json'), resources.widgets || []);
  await writeJson(
    path.join(outputRoot, 'tasks/tasks.json'),
    resources.tasks.map(task => task.task)
  );
  await copyDirectoryIfExists(
    path.resolve(__dirname, '../assets'),
    path.join(outputRoot, 'assets')
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        slug: ANTHROPIC_AGLIT_PACKAGE.slug,
        outputRoot,
      },
      null,
      2
    )
  );
}

void run();
