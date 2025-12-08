export const buildTransformationPrompt = (
    identityJson: any,
    memories: any[], // Accepts raw memory array
    inputText: string,
    instructions?: string
): string => {
    // Format memory context
    const memoryContext = memories.length > 0
        ? memories.map((m: any) => `- ${m.content}`).join('\n')
        : "No relevant memories found.";

    const instructionContext = instructions
        ? `\nCONTEXTUAL_INSTRUCTIONS (OVERRIDE):\n${instructions}\n`
        : "";

    return `IDENTITY_PROFILE:
${JSON.stringify(identityJson)}

RELEVANT_MEMORIES:
${memoryContext}
${instructionContext}
INPUT_TEXT:
${inputText}`;
};

export const buildEvaluationPrompt = (
    identityJson: any,
    rewrittenText: string
): string => {
    return `IDENTITY:
${JSON.stringify(identityJson)}

TEXT_TO_AUDIT:
${rewrittenText}`;
};

export const buildRetryPrompt = (
    currentScore: number,
    reasoning: string,
    suggestions: string
): string => {
    return `CRITICAL FEEDBACK: The alignment score was only ${currentScore}/10. Reasoning: ${reasoning}. 

Fix the text specifically to address: ${suggestions}.`;
};
