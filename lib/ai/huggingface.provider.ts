import { BaseAIProvider, AIProviderConfig, AICompletionResponse, AIProvider } from './provider';

export class HuggingFaceProvider extends BaseAIProvider implements AIProvider {
  private apiUrl: string;

  constructor(config: AIProviderConfig) {
    super(config);
    // For Hugging Face Inference API, we need the full model path
    this.apiUrl = `https://api-inference.huggingface.co/models/${config.model}`;
  }

  async generateCompletion(messages: { role: string; content: string }[]): Promise<AICompletionResponse> {
    try {
      // Convert messages to a single prompt for HF inference API
      const prompt = this.formatMessagesForPrompt(messages);
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            temperature: this.config.temperature || 0.5,
            max_new_tokens: this.config.maxTokens || 600,
            return_full_text: false, // We only want the generated part
          },
        }),
      });

      if (!response.ok) {
        // Handle rate limiting or model loading
        const errorText = await response.text();
        throw new Error(`Hugging Face API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      
      // Extract text from HF response (format varies by model)
      let text = '';
      if (Array.isArray(result) && result.length > 0) {
        // Some models return [{ generated_text: "..." }]
        text = result[0].generated_text || '';
      } else if (typeof result === 'string') {
        text = result;
      } else if (result.generated_text) {
        text = result.generated_text;
      }

      // HF Inference API doesn't reliably return token usage, so we estimate
      const usage = {
        promptTokens: this.estimateTokens(prompt),
        completionTokens: this.estimateTokens(text),
        totalTokens: this.estimateTokens(prompt) + this.estimateTokens(text),
      };

      return {
        text,
        usage,
        model: this.config.model,
        provider: 'huggingface'
      };
    } catch (error) {
      throw new Error(`Hugging Face provider error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  getProviderName(): string {
    return 'huggingface';
  }

  // Simple token estimation (rough approximation)
  private estimateTokens(text: string): number {
    // Rough estimate: 4 characters per token for English text
    return Math.ceil(text.length / 4);
  }
}