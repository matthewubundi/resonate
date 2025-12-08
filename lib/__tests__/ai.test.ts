import { describe, it, expect } from 'vitest'
import { buildTransformationPrompt, buildEvaluationPrompt, buildRetryPrompt } from '../ai'

describe('AI Prompt Builders', () => {

    describe('buildTransformationPrompt', () => {
        const dummyIdentity = { tone: "Formal", rules: { always: ["Be blunt"] } }

        it('includes identity JSON stringified', () => {
            const result = buildTransformationPrompt(dummyIdentity, [], "Hello")
            expect(result).toContain(JSON.stringify(dummyIdentity))
            expect(result).toContain('tone":"Formal')
        })

        it('includes input text', () => {
            const result = buildTransformationPrompt(dummyIdentity, [], "Make this shorter")
            expect(result).toContain("INPUT_TEXT:\nMake this shorter")
        })

        it('handles empty memories correctly', () => {
            const result = buildTransformationPrompt(dummyIdentity, [], "Hello")
            expect(result).toContain("No relevant memories found.")
        })

        it('formats memories as a hyphenated list', () => {
            const memories = [{ content: "Fact A" }, { content: "Fact B" }]
            const result = buildTransformationPrompt(dummyIdentity, memories, "Hello")
            expect(result).toContain("- Fact A")
            expect(result).toContain("- Fact B")
        })
    })

    describe('buildEvaluationPrompt', () => {
        const dummyIdentity = { tone: "Casual" }

        it('includes identity and text to audit', () => {
            const result = buildEvaluationPrompt(dummyIdentity, "Hey there")
            expect(result).toContain('tone":"Casual')
            expect(result).toContain("TEXT_TO_AUDIT:\nHey there")
        })
    })

    describe('buildRetryPrompt', () => {
        it('includes score, reasoning, and suggestions', () => {
            const result = buildRetryPrompt(6, "Too casual", "Use simpler words")
            expect(result).toContain("score was only 6/10")
            expect(result).toContain("Reasoning: Too casual")
            expect(result).toContain("address: Use simpler words")
        })
    })

})
