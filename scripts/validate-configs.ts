import assert from 'node:assert/strict';
import { ANTHROPIC_AGLIT_PACKAGE } from '../dist/src/manifest.js';
import {
  ANTHROPIC_LUCAS_AGENT_ID,
  ANTHROPIC_REDDIT_AGENT_ID,
  ANTHROPIC_RL_AGENT_ID,
  ANTHROPIC_SEARCH_EVAL_BASELINE_NO_TOOLS_AGENT_ID,
  ANTHROPIC_SEARCH_EVAL_HALLUCINATION_AUDIT_AGENT_ID,
  ANTHROPIC_SEARCH_EVAL_PRIMARY_GRADER_AGENT_ID,
  ANTHROPIC_SEARCH_EVAL_RUNNER_AGENT_ID,
  ANTHROPIC_SEARCH_EVAL_WIKI_CHAMPION_COMBINED_AGENT_ID,
  ANTHROPIC_SEARCH_EVAL_WIKI_DISAMBIGUATE_CALIBRATE_AGENT_ID,
  ANTHROPIC_SEARCH_EVAL_WIKI_EVIDENCE_FIRST_AGENT_ID,
  ANTHROPIC_SEARCH_EVAL_WIKI_HEAVY_AGENT_ID,
  ANTHROPIC_SEARCH_EVAL_WIKI_MINIMAL_AGENT_ID,
  ANTHROPIC_SEARCH_EVAL_WIKI_SEARCH_POLICY_AGENT_ID,
  ANTHROPIC_SEARCH_EVAL_WIKI_VERBATIM_AGENT_ID,
  ANTHROPIC_SOTA_AGENT_ID,
} from '../dist/src/agents/index.js';

function run(): void {
  const manifest = ANTHROPIC_AGLIT_PACKAGE;
  const { resources } = manifest;

  assert(resources.agents.length === 15, 'Expected exactly 15 Anthropic managed agents.');
  assert(resources.tasks.length === 4, 'Expected exactly 4 Anthropic managed tasks.');
  assert(
    manifest.primaryAssistantAgentId === ANTHROPIC_LUCAS_AGENT_ID,
    'Anthy should remain the primary assistant.'
  );
  assert(
    manifest.primaryAssistantName === 'Anthy',
    'Manifest should keep Anthy as the primary assistant name.'
  );

  const expectedAgentIds = new Set([
    ANTHROPIC_LUCAS_AGENT_ID,
    ANTHROPIC_REDDIT_AGENT_ID,
    ANTHROPIC_SOTA_AGENT_ID,
    ANTHROPIC_RL_AGENT_ID,
    ANTHROPIC_SEARCH_EVAL_BASELINE_NO_TOOLS_AGENT_ID,
    ANTHROPIC_SEARCH_EVAL_WIKI_MINIMAL_AGENT_ID,
    ANTHROPIC_SEARCH_EVAL_WIKI_VERBATIM_AGENT_ID,
    ANTHROPIC_SEARCH_EVAL_WIKI_SEARCH_POLICY_AGENT_ID,
    ANTHROPIC_SEARCH_EVAL_WIKI_EVIDENCE_FIRST_AGENT_ID,
    ANTHROPIC_SEARCH_EVAL_WIKI_DISAMBIGUATE_CALIBRATE_AGENT_ID,
    ANTHROPIC_SEARCH_EVAL_WIKI_HEAVY_AGENT_ID,
    ANTHROPIC_SEARCH_EVAL_WIKI_CHAMPION_COMBINED_AGENT_ID,
    ANTHROPIC_SEARCH_EVAL_PRIMARY_GRADER_AGENT_ID,
    ANTHROPIC_SEARCH_EVAL_HALLUCINATION_AUDIT_AGENT_ID,
    ANTHROPIC_SEARCH_EVAL_RUNNER_AGENT_ID,
  ]);

  for (const agent of resources.agents) {
    assert(expectedAgentIds.has(agent.id), `Unexpected Anthropic agent id: ${agent.id}`);
  }

  const runner = resources.agents.find(agent => agent.id === ANTHROPIC_SEARCH_EVAL_RUNNER_AGENT_ID);
  const baseline = resources.agents.find(
    agent => agent.id === ANTHROPIC_SEARCH_EVAL_BASELINE_NO_TOOLS_AGENT_ID
  );
  const wikiChampion = resources.agents.find(
    agent => agent.id === ANTHROPIC_SEARCH_EVAL_WIKI_CHAMPION_COMBINED_AGENT_ID
  );
  const primaryGrader = resources.agents.find(
    agent => agent.id === ANTHROPIC_SEARCH_EVAL_PRIMARY_GRADER_AGENT_ID
  );
  const auditGrader = resources.agents.find(
    agent => agent.id === ANTHROPIC_SEARCH_EVAL_HALLUCINATION_AUDIT_AGENT_ID
  );

  assert(runner, 'Search eval runner agent is required.');
  assert(baseline, 'No-tool baseline agent is required.');
  assert(wikiChampion, 'Champion Wikipedia agent is required.');
  assert(primaryGrader, 'Primary search-eval grader agent is required.');
  assert(auditGrader, 'Audit search-eval grader agent is required.');

  assert(
    !baseline.toolIds.includes('custom_web_wikipedia'),
    'No-tool baseline should not expose Wikipedia.'
  );
  assert(
    wikiChampion.toolIds.includes('custom_web_wikipedia'),
    'Champion search-eval agent should expose Wikipedia.'
  );
  assert(
    primaryGrader.systemPrompt?.includes('"correctness_score"') &&
      primaryGrader.systemPrompt?.includes('"overall_score"'),
    'Primary grader agent should require weighted rubric JSON output.'
  );
  assert(
    auditGrader.systemPrompt?.includes('"unsupported_claims_present"'),
    'Audit grader agent should require audit JSON output.'
  );
  assert(
    runner.systemPrompt?.includes('Models') &&
      runner.systemPrompt?.includes('Graders') &&
      runner.toolIds.includes('custom_web_google_sheets'),
    'Runner should target the current workbook tabs and include Google Sheets tooling.'
  );
  assert(
    baseline.providerSettings?.chatProvider === 'codex' &&
      wikiChampion.providerSettings?.chatProvider === 'codex' &&
      primaryGrader.providerSettings?.chatProvider === 'codex' &&
      runner.providerSettings?.chatProvider === 'codex',
    'Search-eval benchmark, grading, and orchestration agents should stay on Codex.'
  );

  const taskIds = new Set(resources.tasks.map(task => task.id));
  assert(taskIds.has('anthropic-search-evaluation-on-demand'), 'Search evaluation task missing.');

  console.log(
    JSON.stringify(
      {
        ok: true,
        slug: manifest.slug,
        counts: {
          agents: resources.agents.length,
          tasks: resources.tasks.length,
          browserProfiles: resources.browserProfiles.length,
          containerProfiles: resources.containerProfiles.length,
          desktopAppProfiles: resources.desktopAppProfiles.length,
          customTools: resources.customTools.length,
        },
      },
      null,
      2
    )
  );
}

run();
