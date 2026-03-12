import { AIProvider, AIProviderConfig, AICompletionResponse } from './provider';
import { GroqProvider } from './groq.provider';
import { GeminiProvider } from './gemini.provider';
import { OpenRouterProvider } from './openrouter.provider';
import { HuggingFaceProvider } from './huggingface.provider';

export type AIProviderType = 'groq' | 'gemini' | 'openrouter' | 'huggingface';

export interface AIServiceConfig {
  providers: Record<AIProviderType, AIProviderConfig>;
  priority: AIProviderType[];
  fallbackEnabled: boolean;
}

export class AIService {
  private providers: Map<AIProviderType, AIProvider>;
  private priority: AIProviderType[];
  private fallbackEnabled: boolean;

  constructor(config: AIServiceConfig) {
    this.providers = new Map();
    this.priority = config.priority;
    this.fallbackEnabled = config.fallbackEnabled;

    // Initialize providers based on configuration
    Object.entries(config.providers).forEach(([type, providerConfig]) => {
      if (providerConfig.apiKey) { // Only initialize if API key is provided
        try {
          let provider: AIProvider;
          switch (type) {
            case 'groq':
              provider = new GroqProvider(providerConfig);
              break;
            case 'gemini':
              provider = new GeminiProvider(providerConfig);
              break;
            case 'openrouter':
              provider = new OpenRouterProvider(providerConfig);
              break;
            case 'huggingface':
              provider = new HuggingFaceProvider(providerConfig);
              break;
            default:
              console.warn(`Unknown AI provider type: ${type}`);
              return;
          }
          this.providers.set(type as AIProviderType, provider);
        } catch (error) {
          console.error(`Failed to initialize ${type} provider:`, error);
        }
      }
    });
  }

  private getAvailableProviders(): AIProviderType[] {
    return this.priority.filter(type => this.providers.has(type));
  }

  async generateCompletion(messages: { role: string; content: string }[]): Promise<AICompletionResponse> {
    const availableProviders = this.getAvailableProviders();
    
    if (availableProviders.length === 0) {
      throw new Error('No AI providers are configured. Please set up at least one AI provider API key.');
    }

    // Try providers in priority order
    for (const providerType of availableProviders) {
      try {
        const provider = this.providers.get(providerType);
        if (!provider) continue;
        
        const response = await provider.generateCompletion(messages);
        return response;
      } catch (error) {
        console.error(`AI provider ${providerType} failed:`, error);
        
        // If fallback is disabled or this is the last provider, throw the error
        if (!this.fallbackEnabled || providerType === availableProviders[availableProviders.length - 1]) {
          throw new Error(`All AI providers failed. Last error from ${providerType}: ${error instanceof Error ? error.message : String(error)}`);
        }
        // Otherwise, continue to next provider
      }
    }
    
    // This should never be reached due to the check above, but just in case
    throw new Error('Unable to generate completion from any AI provider');
  }

  getProviderStatus(): Record<AIProviderType, { available: boolean; configured: boolean }> {
    const status: Record<AIProviderType, { available: boolean; configured: boolean }> = {
      groq: { available: false, configured: false },
      gemini: { available: false, configured: false },
      openrouter: { available: false, configured: false },
      huggingface: { available: false, configured: false }
    };

    Object.keys(status).forEach(key => {
      const type = key as AIProviderType;
      status[type].configured = !!process.env[`${type.toUpperCase()}_API_KEY`];
      status[type].available = this.providers.has(type);
    });

    return status;
  }
}