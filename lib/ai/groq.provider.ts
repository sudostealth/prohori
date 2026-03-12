import { BaseAIProvider, AIProviderConfig, AICompletionResponse, AIProvider } from './provider';

export class GroqProvider extends BaseAIProvider implements AIProvider {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private client: any;

  constructor(config: AIProviderConfig) {
    super(config);
    // Lazy load groq-sdk to avoid bundling issues
    this.client = null;
  }

  private async initClient() {
    if (!this.client) {
      const { default: Groq } = await import('groq-sdk');
      this.client = new Groq({ apiKey: this.config.apiKey });
    }
    return this.client;
  }

  async generateCompletion(messages: { role: string; content: string }[]): Promise<AICompletionResponse> {
    try {
      const groq = await this.initClient();
      
      const completion = await groq.chat.completions.create({
        model: this.config.model,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        messages: messages as any,
        max_tokens: this.config.maxTokens || 600,
        temperature: this.config.temperature || 0.5,
      });

      const text = completion.choices[0]?.message?.content || '';
      
      return {
        text,
        usage: {
          promptTokens: completion.usage?.prompt_tokens,
          completionTokens: completion.usage?.completion_tokens,
          totalTokens: completion.usage?.total_tokens,
        },
        model: this.config.model,
        provider: 'groq'
      };
    } catch (error) {
      throw new Error(`Groq provider error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  getProviderName(): string {
    return 'groq';
  }
}