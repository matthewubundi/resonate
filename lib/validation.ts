import { z } from 'zod';

export const transformSchema = z.object({
    inputText: z.string()
        .min(1, 'Input text is required')
        .max(50000, 'Input text must be less than 50,000 characters'),
    temperature: z.number()
        .min(0)
        .max(1.5)
        .optional()
        .default(0.7),
    instructions: z.string()
        .max(1000, 'Instructions must be less than 1000 characters')
        .optional(),
    model_id: z.enum(['gpt-4o-mini', 'gemini-flash-latest'])
        .optional()
        .default('gpt-4o-mini'),
});

export const memorySchema = z.object({
    content: z.string()
        .min(1, 'Content is required')
        .max(5000, 'Content must be less than 5,000 characters'),
});

export const personaSchema = z.object({
    name: z.string()
        .min(1, 'Name is required')
        .max(100, 'Name must be less than 100 characters'),
    baseConfig: z.enum(['clone', 'scratch']),
    description: z.string()
        .max(500, 'Description must be less than 500 characters')
        .optional(),
});
