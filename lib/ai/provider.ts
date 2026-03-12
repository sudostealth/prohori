// Base AI provider interfaces and abstract class

export interface AIProviderConfig {
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AICompletionResponse {
  text: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  model: string;
  provider: string;
}

export interface AIProvider {
  generateCompletion(messages: { role: string; content: string }[]): Promise<AICompletionResponse>;
  getProviderName(): string;
}

export abstract class BaseAIProvider implements AIProvider {
  protected config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    if (!config.apiKey) {
      throw new Error('API key is required for AI provider');
    }
    if (!config.model) {
      throw new Error('Model is required for AI provider');
    }
    this.config = config;
  }

  abstract generateCompletion(messages: { role: string; content: string }[]): Promise<AICompletionResponse>;
  abstract getProviderName(): string;

  protected formatMessagesForPrompt(messages: { role: string; content: string }[]): string {
    return messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
  }
}