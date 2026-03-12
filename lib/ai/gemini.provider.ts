import { BaseAIProvider, AIProviderConfig, AICompletionResponse, AIProvider } from './provider';

export class GeminiProvider extends BaseAIProvider implements AIProvider {
  private apiUrl: string;

  constructor(config: AIProviderConfig) {
    super(config);
    this.apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`;
  }

  async generateCompletion(messages: { role: string; content: string }[]): Promise<AICompletionResponse> {
    try {
      // Convert messages to Gemini format
      const geminiMessages = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const requestBody = {
        contents: geminiMessages,
        generationConfig: {
          temperature: this.config.temperature || 0.5,
          maxOutputTokens: this.config.maxTokens || 600,
        }
      };

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract text from Gemini response
      let text = '';
      if (data.candidates?.[0]?.content?.parts?.[0]) {
        text = data.candidates[0].content.parts[0].text || '';
      }

      // Extract usage information if available
      const usage = data.usageMetadata ? {
        promptTokens: data.usageMetadata.promptTokenCount,
        completionTokens: data.usageMetadata.candidatesTokenCount,
        totalTokens: data.usageMetadata.totalTokenCount,
      } : undefined;

      return {
        text,
        usage,
        model: this.config.model,
        provider: 'gemini'
      };
    } catch (error) {
      throw new Error(`Gemini provider error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  getProviderName(): string {
    return 'gemini';
  }
}