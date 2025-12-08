
export type ModelId = 'gpt-4o-mini' | 'gemini-flash-latest';

export interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export interface LLMRequest {
    systemPrompt: string;
    messages: Message[];
    temperature?: number;
    jsonMode?: boolean;
}

export interface LLMResponse {
    content: string;
    modelUsed: string;
}

export interface ILLMProvider {
    generate(request: LLMRequest): Promise<LLMResponse>;
}
