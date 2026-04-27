import type { AgentConfig, ToolId } from '@aglit-ai/types';
import {
  ANTHROPIC_SEARCH_EVAL_GRADERS_SHEET,
  ANTHROPIC_SEARCH_EVAL_MODELS_SHEET,
  ANTHROPIC_SEARCH_EVAL_PROMPTS_SHEET,
  ANTHROPIC_SEARCH_EVAL_RESULTS_SHEET,
  ANTHROPIC_SEARCH_EVAL_RUBRIC_SHEET,
  ANTHROPIC_SEARCH_EVAL_RUNS_SHEET,
  ANTHROPIC_SEARCH_EVAL_SHEET_URL,
  ANTHROPIC_SEARCH_EVAL_TOOL_RESULTS_SHEET,
  ANTHROPIC_SEARCH_EVAL_TEMPLATE_SHEET_IDS,
} from '../search-eval/config.js';
import {
  createPlainAgentResponsePrompt,
  createSearchEvalRunnerSystemPrompt,
  SEARCH_EVAL_HALLUCINATION_AUDIT_SYSTEM_PROMPT,
  SEARCH_EVAL_PRIMARY_GRADER_SYSTEM_PROMPT,
} from '../shared/agent-helpers.js';

export const ANTHROPIC_SEARCH_EVAL_BASELINE_NO_TOOLS_AGENT_ID =
  'anthropic-search-eval-baseline-no-tools-agent';
export const ANTHROPIC_SEARCH_EVAL_WIKI_MINIMAL_AGENT_ID =
  'anthropic-search-eval-wiki-minimal-agent';
export const ANTHROPIC_SEARCH_EVAL_WIKI_VERBATIM_AGENT_ID =
  'anthropic-search-eval-wiki-verbatim-agent';
export const ANTHROPIC_SEARCH_EVAL_WIKI_SEARCH_POLICY_AGENT_ID =
  'anthropic-search-eval-wiki-search-policy-agent';
export const ANTHROPIC_SEARCH_EVAL_WIKI_EVIDENCE_FIRST_AGENT_ID =
  'anthropic-search-eval-wiki-evidence-first-agent';
export const ANTHROPIC_SEARCH_EVAL_WIKI_DISAMBIGUATE_CALIBRATE_AGENT_ID =
  'anthropic-search-eval-wiki-disambiguate-calibrate-agent';
export const ANTHROPIC_SEARCH_EVAL_WIKI_HEAVY_AGENT_ID = 'anthropic-search-eval-wiki-heavy-agent';
export const ANTHROPIC_SEARCH_EVAL_WIKI_CHAMPION_COMBINED_AGENT_ID =
  'anthropic-search-eval-wiki-champion-combined-agent';
export const ANTHROPIC_SEARCH_EVAL_PRIMARY_GRADER_AGENT_ID =
  'anthropic-search-eval-primary-grader-agent';
export const ANTHROPIC_SEARCH_EVAL_HALLUCINATION_AUDIT_AGENT_ID =
  'anthropic-search-eval-hallucination-audit-agent';
export const ANTHROPIC_SEARCH_EVAL_RUNNER_AGENT_ID = 'anthropic-search-eval-runner-agent';

const SEARCH_EVAL_RUNNER_MODEL_IDS = new Set<string>([
  'm0_baseline_no_tools',
  'm1_wiki_minimal',
  'm5_wiki_heavy',
]);

const NO_RETRIEVAL_TOOL_IDS: ToolId[] = ['p1_system'];
const WIKIPEDIA_TOOL_IDS: ToolId[] = ['p1_system', 'custom_wiki_search'];

type SearchEvalModelDefinition = {
  agentId: string;
  modelId: string;
  name: string;
  shortDescription: string;
  categories: string[];
  toolIds: ToolId[];
  systemPrompt: string;
  mappingDescription: string;
};

const createSearchEvalModelAgent = (definition: SearchEvalModelDefinition): AgentConfig => ({
  id: definition.agentId,
  name: definition.name,
  shortDescription: definition.shortDescription,
  description: definition.shortDescription,
  categories: definition.categories,
  toolIds: definition.toolIds,
  providerSettings: {
    chatProvider: 'claude',
    chatModel: 'claude-sonnet-4-6',
  },
  ...createPlainAgentResponsePrompt(definition.systemPrompt),
  isDefault: false,
  prewarmOnStartup: false,
});

const SEARCH_EVAL_MODEL_DEFINITIONS: SearchEvalModelDefinition[] = [
  {
    agentId: ANTHROPIC_SEARCH_EVAL_BASELINE_NO_TOOLS_AGENT_ID,
    modelId: 'm0_baseline_no_tools',
    name: 'Search Eval No Wiki Tool',
    shortDescription: 'Baseline model with no wiki tool available.',
    categories: ['Anthropic', 'Search Eval', 'Codex', 'No Tools'],
    toolIds: NO_RETRIEVAL_TOOL_IDS,
    mappingDescription: 'No wiki tool available.',
    systemPrompt: `You are a concise QA assistant.
Answer directly from your own knowledge.
You do not have access to external tools or sources.
If you are uncertain, say so briefly instead of guessing.
Default to one sentence for simple factual questions and no more than four short sentences otherwise.`,
  },
  {
    agentId: ANTHROPIC_SEARCH_EVAL_WIKI_MINIMAL_AGENT_ID,
    modelId: 'm1_wiki_minimal',
    name: 'Search Eval Wiki Tool Available',
    shortDescription: 'Wiki tool available when needed, but not mandatory.',
    categories: ['Anthropic', 'Search Eval', 'Codex', 'Wikipedia'],
    toolIds: WIKIPEDIA_TOOL_IDS,
    mappingDescription: 'Wiki tool available when needed.',
    systemPrompt: `You are a concise QA assistant with access to search_wikipedia(query: str).
Answer the user's question directly.
Use Wikipedia search when the answer is not obvious or should be verified.
Cite the Wikipedia page title or titles you relied on.
If Wikipedia does not clearly support the answer, say so briefly instead of guessing.`,
  },
  {
    agentId: ANTHROPIC_SEARCH_EVAL_WIKI_VERBATIM_AGENT_ID,
    modelId: 'm2_wiki_verbatim',
    name: 'Search Eval Wiki Verbatim',
    shortDescription: 'Exact-extraction Wikipedia agent for verbatim lookup tasks.',
    categories: ['Anthropic', 'Search Eval', 'Codex', 'Wikipedia', 'Verbatim'],
    toolIds: WIKIPEDIA_TOOL_IDS,
    mappingDescription: 'Wikipedia tool available for exact extraction and verbatim evidence.',
    systemPrompt: `You are a Wikipedia extraction assistant.
Use search_wikipedia(query: str) before answering.
For extraction tasks, copy the requested word, phrase, sentence, or field exactly from the retrieved Wikipedia article.
Do not paraphrase exact-extraction answers.
When the prompt asks for a citation, include the article URL you used.
If the page or extraction target is ambiguous, say so briefly instead of fabricating an answer.`,
  },
  {
    agentId: ANTHROPIC_SEARCH_EVAL_WIKI_SEARCH_POLICY_AGENT_ID,
    modelId: 'm3_wiki_search_policy',
    name: 'Search Eval Wiki Search Policy',
    shortDescription: 'Wikipedia agent optimized for disciplined search decisions.',
    categories: ['Anthropic', 'Search Eval', 'Codex', 'Wikipedia'],
    toolIds: WIKIPEDIA_TOOL_IDS,
    mappingDescription: 'Wikipedia tool available with strong search-decision discipline.',
    systemPrompt: `You are a QA assistant with access to search_wikipedia(query: str).
Search only when verification is needed, the question is ambiguous, or the answer depends on a specific source.
Do not search for trivial arithmetic or obvious common-knowledge facts unless the user explicitly asks for sourced verification.
When you do search, cite the article title or URL used.
If the available Wikipedia evidence is weak or ambiguous, say so briefly instead of overstating confidence.`,
  },
  {
    agentId: ANTHROPIC_SEARCH_EVAL_WIKI_EVIDENCE_FIRST_AGENT_ID,
    modelId: 'm4_wiki_evidence_first',
    name: 'Search Eval Wiki Evidence First',
    shortDescription: 'Wikipedia agent that prioritizes quoted evidence and grounded answers.',
    categories: ['Anthropic', 'Search Eval', 'Codex', 'Wikipedia'],
    toolIds: WIKIPEDIA_TOOL_IDS,
    mappingDescription: 'Wikipedia tool available with evidence-first answer construction.',
    systemPrompt: `You are a Wikipedia-grounded QA assistant.
Use search_wikipedia(query: str) whenever the answer should be sourced.
Base the answer on retrieved evidence, and prefer short direct supporting quotes when they help verify the claim.
Keep the final answer concise, but make the evidence path explicit by citing the article URL or title.
If the retrieved page does not actually support the claim, do not use it as proof.`,
  },
  {
    agentId: ANTHROPIC_SEARCH_EVAL_WIKI_DISAMBIGUATE_CALIBRATE_AGENT_ID,
    modelId: 'm6_wiki_disambiguate_calibrate',
    name: 'Search Eval Wiki Disambiguate Calibrate',
    shortDescription: 'Wikipedia agent focused on ambiguity handling and calibrated uncertainty.',
    categories: ['Anthropic', 'Search Eval', 'Codex', 'Wikipedia'],
    toolIds: WIKIPEDIA_TOOL_IDS,
    mappingDescription:
      'Wikipedia tool available with strong disambiguation and calibration behavior.',
    systemPrompt: `You are a calibrated Wikipedia QA assistant.
Use search_wikipedia(query: str) to resolve ambiguity, verify claims, and compare closely related pages.
If the prompt lacks context or multiple entities plausibly match, ask for the missing context or explain the ambiguity instead of choosing arbitrarily.
When you answer, cite the article title or URL you used.
Prefer a cautious answer over a confident but unsupported one.`,
  },
  {
    agentId: ANTHROPIC_SEARCH_EVAL_WIKI_HEAVY_AGENT_ID,
    modelId: 'm5_wiki_heavy',
    name: 'Search Eval Always Use Wiki Tool',
    shortDescription: 'Prompt explicitly says to always use the wiki tool.',
    categories: ['Anthropic', 'Search Eval', 'Codex', 'Wikipedia'],
    toolIds: WIKIPEDIA_TOOL_IDS,
    mappingDescription: 'Prompt explicitly says to always use the wiki tool.',
    systemPrompt: `You are a Wikipedia-first QA assistant.
Always start by using search_wikipedia(query: str) before answering, even when you think you know the answer already.
Only skip Wikipedia for trivial arithmetic or purely self-contained reasoning.
When one page is not enough, search again and combine evidence from multiple relevant pages.
Base the final answer on retrieved Wikipedia evidence, mention ambiguity when it matters, and cite the page title or titles used.
Keep the final answer concise even if you searched multiple times.`,
  },
  {
    agentId: ANTHROPIC_SEARCH_EVAL_WIKI_CHAMPION_COMBINED_AGENT_ID,
    modelId: 'm7_wiki_champion_combined',
    name: 'Search Eval Wiki Champion',
    shortDescription: 'Combined best-practice Wikipedia benchmark agent.',
    categories: ['Anthropic', 'Search Eval', 'Codex', 'Wikipedia', 'Champion'],
    toolIds: WIKIPEDIA_TOOL_IDS,
    mappingDescription:
      'Combined Wikipedia benchmark agent with disciplined search, grounding, and ambiguity handling.',
    systemPrompt: `You are a high-discipline Wikipedia QA assistant.
Use search_wikipedia(query: str) when verification, ambiguity resolution, or exact evidence is needed.
Avoid unnecessary search on trivial self-contained questions.
When you do search:
- choose the most relevant article rather than a merely related one
- quote short direct evidence when it materially supports the answer
- cite the exact article URL or title used
- disambiguate explicitly when multiple entities or interpretations are plausible
- stay calibrated and say when Wikipedia does not clearly support the claim
Keep the final answer concise and grounded in the retrieved evidence.`,
  },
];

export const ANTHROPIC_SEARCH_EVAL_BASELINE_NO_TOOLS_AGENT = createSearchEvalModelAgent(
  SEARCH_EVAL_MODEL_DEFINITIONS[0]
);
export const ANTHROPIC_SEARCH_EVAL_WIKI_MINIMAL_AGENT = createSearchEvalModelAgent(
  SEARCH_EVAL_MODEL_DEFINITIONS[1]
);
export const ANTHROPIC_SEARCH_EVAL_WIKI_VERBATIM_AGENT = createSearchEvalModelAgent(
  SEARCH_EVAL_MODEL_DEFINITIONS[2]
);
export const ANTHROPIC_SEARCH_EVAL_WIKI_SEARCH_POLICY_AGENT = createSearchEvalModelAgent(
  SEARCH_EVAL_MODEL_DEFINITIONS[3]
);
export const ANTHROPIC_SEARCH_EVAL_WIKI_EVIDENCE_FIRST_AGENT = createSearchEvalModelAgent(
  SEARCH_EVAL_MODEL_DEFINITIONS[4]
);
export const ANTHROPIC_SEARCH_EVAL_WIKI_DISAMBIGUATE_CALIBRATE_AGENT = createSearchEvalModelAgent(
  SEARCH_EVAL_MODEL_DEFINITIONS[5]
);
export const ANTHROPIC_SEARCH_EVAL_WIKI_HEAVY_AGENT = createSearchEvalModelAgent(
  SEARCH_EVAL_MODEL_DEFINITIONS[6]
);
export const ANTHROPIC_SEARCH_EVAL_WIKI_CHAMPION_COMBINED_AGENT = createSearchEvalModelAgent(
  SEARCH_EVAL_MODEL_DEFINITIONS[7]
);

const SEARCH_EVAL_RUNNER_MODEL_DEFINITIONS = SEARCH_EVAL_MODEL_DEFINITIONS.filter(definition =>
  SEARCH_EVAL_RUNNER_MODEL_IDS.has(definition.modelId)
);

export const ANTHROPIC_SEARCH_EVAL_PRIMARY_GRADER_AGENT: AgentConfig = {
  id: ANTHROPIC_SEARCH_EVAL_PRIMARY_GRADER_AGENT_ID,
  name: 'Search Eval Primary Grader',
  shortDescription: 'Primary weighted rubric grader for search evaluation runs.',
  description: 'Primary weighted rubric grader for search evaluation runs.',
  categories: ['Anthropic', 'Search Eval', 'Grader'],
  toolIds: ['p1_system'],
  providerSettings: {
    chatProvider: 'claude',
    chatModel: 'claude-sonnet-4-6',
  },
  systemPrompt: SEARCH_EVAL_PRIMARY_GRADER_SYSTEM_PROMPT,
  isDefault: false,
  prewarmOnStartup: false,
};

export const ANTHROPIC_SEARCH_EVAL_HALLUCINATION_AUDIT_AGENT: AgentConfig = {
  id: ANTHROPIC_SEARCH_EVAL_HALLUCINATION_AUDIT_AGENT_ID,
  name: 'Search Eval Hallucination Audit',
  shortDescription: 'Optional audit grader for unsupported-claim and citation issues.',
  description: 'Optional audit grader for unsupported-claim and citation issues.',
  categories: ['Anthropic', 'Search Eval', 'Grader', 'Audit'],
  toolIds: ['p1_system'],
  providerSettings: {
    chatProvider: 'claude',
    chatModel: 'claude-sonnet-4-6',
  },
  systemPrompt: SEARCH_EVAL_HALLUCINATION_AUDIT_SYSTEM_PROMPT,
  isDefault: false,
  prewarmOnStartup: false,
};

export const ANTHROPIC_SEARCH_EVAL_RUNNER_AGENT: AgentConfig = {
  id: ANTHROPIC_SEARCH_EVAL_RUNNER_AGENT_ID,
  name: 'Search Eval Runner',
  shortDescription: 'Runs the workbook models against prompts and appends graded results.',
  description: 'Runs the workbook models against prompts and appends graded results.',
  categories: ['Anthropic', 'Search Eval', 'Automation'],
  toolIds: [
    'p1_browser',
    'p1_chat',
    'p1_custom',
    'p1_file',
    'p1_system',
    'p1_todo',
    'custom_web_google_sheets',
  ],
  providerSettings: {
    chatProvider: 'claude',
    chatModel: 'claude-sonnet-4-6',
  },
  systemPrompt: createSearchEvalRunnerSystemPrompt({
    sheetUrl: ANTHROPIC_SEARCH_EVAL_SHEET_URL,
    promptsSheetName: ANTHROPIC_SEARCH_EVAL_PROMPTS_SHEET,
    modelsSheetName: ANTHROPIC_SEARCH_EVAL_MODELS_SHEET,
    gradersSheetName: ANTHROPIC_SEARCH_EVAL_GRADERS_SHEET,
    rubricSheetName: ANTHROPIC_SEARCH_EVAL_RUBRIC_SHEET,
    runsSheetName: ANTHROPIC_SEARCH_EVAL_RUNS_SHEET,
    resultsSheetName: ANTHROPIC_SEARCH_EVAL_RESULTS_SHEET,
    toolResultsSheetName: ANTHROPIC_SEARCH_EVAL_TOOL_RESULTS_SHEET,
    templateSheetIds: ANTHROPIC_SEARCH_EVAL_TEMPLATE_SHEET_IDS,
    benchmarkAgentMappings: SEARCH_EVAL_RUNNER_MODEL_DEFINITIONS.map(definition => ({
      modelId: definition.modelId,
      agentId: definition.agentId,
      description: definition.mappingDescription,
    })),
    graderAgentMappings: [
      {
        graderId: 'g1_primary_weighted_rubric',
        agentId: ANTHROPIC_SEARCH_EVAL_PRIMARY_GRADER_AGENT_ID,
        description: 'Recommended weighted rubric grader.',
      },
      {
        graderId: 'g2_hallucination_audit',
        agentId: ANTHROPIC_SEARCH_EVAL_HALLUCINATION_AUDIT_AGENT_ID,
        description: 'Optional audit grader for unsupported claims and citation mismatch.',
      },
    ],
  }),
  isDefault: false,
  prewarmOnStartup: false,
};
