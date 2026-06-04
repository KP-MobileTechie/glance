export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export type AiProvider = 'openai' | 'anthropic';

/**
 * Builds the messages array for the standup prompt.
 * Returns a two-element array: system message + user message.
 */
export function buildStandupPrompt(todos: string[], commits: string[]): ChatMessage[] {
  const systemPrompt =
    'You are a concise standup assistant. Generate a brief daily standup report in three sections: Yesterday, Today (planned), Blockers. Use plain text, no markdown headers.';

  const todosPart = todos.length > 0 ? todos.join(', ') : 'none';
  const commitsPart = commits.length > 0 ? commits.join(', ') : 'none';
  const userContent = `Completed tasks: ${todosPart}\nRecent commits: ${commitsPart}\n\nWrite a standup draft based on these.`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ];
}

/**
 * Appends a new user message to the conversation history.
 */
export function buildChatMessages(history: ChatMessage[], userText: string): ChatMessage[] {
  return [...history, { role: 'user', content: userText }];
}

/**
 * Selects the appropriate provider based on which key is available.
 * Returns null if neither key is truthy.
 */
export function selectProvider(
  openaiKey: string | undefined,
  anthropicKey: string | undefined,
): { provider: AiProvider; model: string; apiKey: string } | null {
  if (openaiKey) {
    return { provider: 'openai', model: 'gpt-4o-mini', apiKey: openaiKey };
  }
  if (anthropicKey) {
    return { provider: 'anthropic', model: 'claude-haiku-4-5-20251001', apiKey: anthropicKey };
  }
  return null;
}
