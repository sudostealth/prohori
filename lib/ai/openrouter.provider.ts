import { BaseAIProvider, AIProviderConfig, AICompletionResponse, AIProvider } from './provider';

export class OpenRouterProvider extends BaseAIProvider implements AIProvider {
  private apiUrl: string;

  constructor(config: AIProviderConfig) {
    super(config);
    this.apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
  }

  async generateCompletion(messages: { role: string; content: string }[]): Promise<AICompletionResponse> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://prohori.app', // Optional, for OpenRouter analytics
          'X-Title': 'Prohori Security Platform', // Optional, for OpenRouter analytics
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: messages,
          temperature: this.config.temperature || 0.5,
          max_tokens: this.config.maxTokens || 600,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extract text from OpenRouter response
      let text = '';
      if (data.choices?.[0]?.message?.content) {
        text = data.choices[0].message.content || '';
      }

      // Extract usage information
      const usage = data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      } : undefined;

      return {
        text,
        usage,
        model: this.config.model,
        provider: 'openrouter'
      };
    } catch (error) {
      throw new Error(`OpenRouter provider error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  getProviderName(): string {
    return 'openrouter';
  }
}