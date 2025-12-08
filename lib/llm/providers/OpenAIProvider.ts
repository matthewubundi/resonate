
import OpenAI from 'openai';
import { ILLMProvider, LLMRequest, LLMResponse, ModelId } from '../types';
import { logger } from '@/lib/logger';

export class OpenAIProvider implements ILLMProvider {
    private openai: OpenAI;
    private modelId: ModelId;

    constructor(modelId: ModelId = 'gpt-4o-mini') {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        this.modelId = modelId;
    }

    async generate(request: LLMRequest): Promise<LLMResponse> {
        try {
            const messages: any[] = [
                { role: 'system', content: request.systemPrompt },
                ...request.messages
            ];

            const completion = await this.openai.chat.completions.create({
                model: this.modelId,
                messages: messages,
                temperature: request.temperature ?? 0.7,
                response_format: request.jsonMode ? { type: 'json_object' } : undefined
            });

            return {
                content: completion.choices[0].message.content || '',
                modelUsed: this.modelId
            };
        } catch (error: any) {
            logger.error('OpenAI generation error', { error: error.message || error, model: this.modelId });
            throw error;
        }
    }
}
