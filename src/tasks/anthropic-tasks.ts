import type { AglitTaskTemplate } from '@aglit-ai/template-workspace';
import { createOnDemandCreateChatTask } from '../shared/task-helpers.js';
import {
  ANTHROPIC_LUCAS_AGENT_ID,
  ANTHROPIC_REDDIT_AGENT_ID,
  ANTHROPIC_RL_AGENT_ID,
  ANTHROPIC_SOTA_AGENT_ID,
  ANTHROPIC_SEARCH_EVAL_RUNNER_AGENT_ID,
} from '../agents/index.js';
import {
  ANTHROPIC_SEARCH_EVAL_GRADERS_SHEET,
  ANTHROPIC_SEARCH_EVAL_MODELS_SHEET,
  ANTHROPIC_SEARCH_EVAL_PROMPTS_SHEET,
  ANTHROPIC_SEARCH_EVAL_RESULTS_SHEET,
  ANTHROPIC_SEARCH_EVAL_RUBRIC_SHEET,
  ANTHROPIC_SEARCH_EVAL_RUNS_SHEET,
  ANTHROPIC_SEARCH_EVAL_SHEET_URL,
  ANTHROPIC_SEARCH_EVAL_TOOL_RESULTS_SHEET,
} from '../search-eval/config.js';

export const ANTHROPIC_TASKS: AglitTaskTemplate[] = [
  createOnDemandCreateChatTask({
    id: 'anthropic-sample-benchmark-on-demand',
    name: 'SOTA Basic Eval',
    description: 'Run a lightweight Anthropic benchmark and return a concise evaluation summary.',
    agentId: ANTHROPIC_SOTA_AGENT_ID,
    categories: ['joinanthropic', 'benchmark', 'evaluation'],
    autoApproveTools: true,
    message: `Run a lightweight benchmark for Anthropic.

Goals:
1. Compare a small set of model responses for quality and evidence use.
2. Keep the output concise and auditable.
3. Return the compared models, the prompt set used, and the main quality differences.`,
  }),
  createOnDemandCreateChatTask({
    id: 'anthropic-create-rl-environment-on-demand',
    name: 'Create RL Environment',
    description:
      'Explore a target workflow, write the RL-environment PRD, implement the environment, and return the delivery links.',
    agentId: ANTHROPIC_RL_AGENT_ID,
    categories: ['joinanthropic', 'rl', 'prd', 'website'],
    autoApproveTools: true,
    timeoutMs: 30 * 60 * 1000,
    message: `Create and ship an RL environment for the requested target workflow.

Default requirements:
1. If no repo is provided, use ~/Projects/anthropic-aglit/deliveries/<project-slug>.
2. Produce a Google Docs PRD, a working implementation, QA proof, and a PR or draft PR.
3. Keep the environment restorable, OpenAPI-defined, and locally launchable.`,
  }),
  createOnDemandCreateChatTask({
    id: 'anthropic-latest-reddit-feedback-on-demand',
    name: 'Get Latest Reddit Feedback',
    description:
      'Collect recent Reddit feedback about Anthropic, categorize it in Google Sheets, and summarize the major themes.',
    agentId: ANTHROPIC_REDDIT_AGENT_ID,
    categories: ['joinanthropic', 'research', 'reddit', 'google-sheets'],
    autoApproveTools: true,
    message: `Collect recent Reddit feedback about Anthropic.

Requirements:
1. Focus on recent, direct user feedback.
2. Organize the evidence into a Google Sheet.
3. Return the sheet link plus the main positive and negative themes.`,
  }),
  createOnDemandCreateChatTask({
    id: 'anthropic-search-evaluation-on-demand',
    name: 'Search Evaluation',
    description:
      'Run the Anthropic 3-model wiki evaluation workbook in-place on the original sheet, fill missing model responses first, then grade them.',
    agentId: ANTHROPIC_SEARCH_EVAL_RUNNER_AGENT_ID,
    categories: ['joinanthropic', 'search-eval', 'benchmark', 'google-sheets'],
    autoApproveTools: true,
    timeoutMs: 45 * 60 * 1000,
    message: `Run the Anthropic search evaluation workbook.

Workbook:
${ANTHROPIC_SEARCH_EVAL_SHEET_URL}

Tabs:
- ${ANTHROPIC_SEARCH_EVAL_PROMPTS_SHEET}
- ${ANTHROPIC_SEARCH_EVAL_MODELS_SHEET}
- ${ANTHROPIC_SEARCH_EVAL_GRADERS_SHEET}
- ${ANTHROPIC_SEARCH_EVAL_RUBRIC_SHEET}
- ${ANTHROPIC_SEARCH_EVAL_RUNS_SHEET}
- ${ANTHROPIC_SEARCH_EVAL_RESULTS_SHEET}
- ${ANTHROPIC_SEARCH_EVAL_TOOL_RESULTS_SHEET}

Execution requirements:
1. Use the linked workbook itself as the working result file. Do not fork it, clone it, or create a second working sheet.
2. Write directly into the existing tabs, especially ${ANTHROPIC_SEARCH_EVAL_RUNS_SHEET} and ${ANTHROPIC_SEARCH_EVAL_RESULTS_SHEET}.
3. Only run these three model variants for this experiment:
   - m0_baseline_no_tools: no wiki tool available
   - m1_wiki_minimal: wiki tool available when needed
   - m5_wiki_heavy: prompt explicitly says to always use the wiki tool
4. Use the existing columns in ${ANTHROPIC_SEARCH_EVAL_RUNS_SHEET}, including Model Response, Assistant Turns, Tool Count, and Grader Response.
5. Always write Grader Response as the raw JSON string returned by the grader. Do not write prose summaries or key=value strings there.
6. Read ${ANTHROPIC_SEARCH_EVAL_PROMPTS_SHEET}, ${ANTHROPIC_SEARCH_EVAL_MODELS_SHEET}, ${ANTHROPIC_SEARCH_EVAL_GRADERS_SHEET}, and ${ANTHROPIC_SEARCH_EVAL_RUBRIC_SHEET} as the source of truth for prompts, enabled models, graders, and rubric weights.
7. Skip any prompt-model pair that already has a completed row in ${ANTHROPIC_SEARCH_EVAL_RUNS_SHEET} for the same Prompt ID and Model ID.
8. Use a strict serial loop only: process one missing prompt-model pair at a time.
9. For each missing pair, run the matching benchmark agent first and append the scrape result to ${ANTHROPIC_SEARCH_EVAL_RUNS_SHEET} immediately.
10. After the scrape row exists, grade that same row and fill the grading columns. Do not block the scrape append on long grader work for later rows.
11. For wiki-enabled models, include a Wikipedia citation URL in Model Response. For m5_wiki_heavy, include a short direct quote from Wikipedia plus the article URL.
12. For m0_baseline_no_tools, do not claim wiki usage or fabricate wiki citations.
13. If Google Sheets auth is required, sign in with demoaglit@gmail.com, complete any Google consent flow, and then continue the same workbook run.
14. Report the workbook link and processed and skipped counts.
15. Run autonomously across the full missing matrix. Do not stop after a single validation row just to ask whether to continue.
16. If some prompt-model pairs fail, keep going on the remaining rows and preserve the concrete failure text for those failed rows instead of pausing the whole run.
17. Only ask for clarification when there is a truly external blocker that cannot be recovered in-session after finishing the visible sign-in or consent flow.
18. Do not run pilot experiments or trial prompts once the workbook is ready; start the real missing-pair loop immediately.
18. On every restart or retry, treat the existing rows in ${ANTHROPIC_SEARCH_EVAL_RUNS_SHEET} as the source of truth for progress. Resume from the missing pairs only.
19. Never rerun, rescrape, overwrite, or duplicate a prompt-model pair that already has a completed row in ${ANTHROPIC_SEARCH_EVAL_RUNS_SHEET}, even if the task itself was restarted.
20. If the workbook already contains partial progress, continue from that progress instead of restarting the full matrix.
21. If a prior delegated benchmark chat already produced a usable answer for a missing pair, reuse that answer, append the missing row, and then finish grading it instead of rerunning the benchmark prompt.
22. If a prior benchmark row exists but grading failed, finish the grading work for that pair before starting any brand-new benchmark pair.`,
  }),
];
