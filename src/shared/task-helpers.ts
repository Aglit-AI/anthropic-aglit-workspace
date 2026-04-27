import type { AglitTaskTemplate } from '@aglit-ai/template-workspace';

const TASK_EXECUTION_METADATA_KEY = 'taskExecution';

interface CreateOnDemandCreateChatTaskInput {
  id: string;
  name: string;
  description: string;
  agentId: string;
  message: string;
  categories?: string[];
  openWindowedChat?: boolean;
  autoApproveTools?: boolean;
  awaitFinalMessage?: boolean;
  timeoutMs?: number;
  chatArguments?: Record<string, unknown>;
}

export function createOnDemandCreateChatTask(
  input: CreateOnDemandCreateChatTaskInput
): AglitTaskTemplate {
  const categories = Array.from(new Set([...(input.categories ?? []), 'on-demand']));

  return {
    id: input.id,
    runMode: 'on_demand',
    task: {
      name: input.name,
      description: input.description,
      status: 'active',
      categories,
      trigger: [],
      sequence: {
        tool: {
          id: `task-node-${input.id}`,
          type: 'call-tool',
          label: 'Create chat',
          description: 'Launch an on-demand create-chat task.',
          config: {
            toolId: 'p1_chat',
            ...(typeof input.timeoutMs === 'number' &&
            Number.isFinite(input.timeoutMs) &&
            input.timeoutMs > 0
              ? { timeoutMs: input.timeoutMs }
              : {}),
            arguments: {
              action: 'send_message',
              agent_id: input.agentId,
              message: input.message,
              await_final_message: input.awaitFinalMessage ?? true,
              ...(input.autoApproveTools ? { enable_agent_mode: true } : {}),
              ...(input.chatArguments ?? {}),
            },
            metadata: {
              [TASK_EXECUTION_METADATA_KEY]: {
                openWindowedChat: input.openWindowedChat ?? true,
                autoApproveTools: input.autoApproveTools ?? false,
              },
            },
          },
        },
      },
    },
  };
}
