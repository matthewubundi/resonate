
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ILLMProvider, LLMRequest, LLMResponse, ModelId } from '../types';
import { logger } from '@/lib/logger';
import { isDemoMode } from '@/lib/demo';

export class GeminiProvider implements ILLMProvider {
    private genAI: GoogleGenerativeAI;
    private modelId: ModelId;

    constructor(modelId: ModelId = 'gemini-flash-latest') {
        const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || (isDemoMode ? 'demo-gemini-key' : undefined);
        if (!apiKey) {
            throw new Error('Missing GOOGLE_API_KEY or GEMINI_API_KEY environment variable');
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.modelId = modelId;
    }

    async generate(request: LLMRequest): Promise<LLMResponse> {
        try {
            // Map internal ID to Gemini model name
            const modelName = this.modelId === 'gemini-flash-latest' ? 'gemini-2.5-flash' : this.modelId;

            const model = this.genAI.getGenerativeModel({
                model: modelName,
                systemInstruction: request.systemPrompt,
                generationConfig: {
                    responseMimeType: request.jsonMode ? "application/json" : "text/plain",
                    temperature: request.temperature,
                }
            });

            // Convert messages to Gemini format
            // Open AI roles: 'user', 'assistant' -> Gemini roles: 'user', 'model'
            const history = request.messages.slice(0, -1).map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));

            const lastMessage = request.messages[request.messages.length - 1];
            if (!lastMessage) {
                throw new Error('No messages provided to generate function');
            }

            const chat = model.startChat({
                history: history
            });

            const result = await chat.sendMessage(lastMessage.content);
            const response = result.response;
            const text = response.text();

            return {
                content: text,
                modelUsed: this.modelId
            };

        } catch (error: any) {
            logger.error('Gemini generation error', { error: error.message || error, model: this.modelId });
            throw error;
        }
    }
}
