
import { ILLMProvider, ModelId } from './types';
import { OpenAIProvider } from './providers/OpenAIProvider';
import { GeminiProvider } from './providers/GeminiProvider';

export class LLMFactory {
    static getProvider(modelId: ModelId): ILLMProvider {
        if (modelId === 'gemini-flash-latest') {
            return new GeminiProvider(modelId);
        }
        // Default to OpenAI for gpt-4o, gpt-4o-mini, and others
        return new OpenAIProvider(modelId);
    }
}
