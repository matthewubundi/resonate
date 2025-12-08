import { describe, it, expect } from 'vitest'
import { transformSchema, memorySchema, personaSchema } from '../validation'

describe('Validation Schemas', () => {
    describe('transformSchema', () => {
        it('validates correct input', () => {
            const result = transformSchema.safeParse({ inputText: 'Hello world' })
            expect(result.success).toBe(true)
        })

        it('fails on empty input content', () => {
            const result = transformSchema.safeParse({ inputText: '' })
            expect(result.success).toBe(false)
        })

        it('fails on input text strictly less than 1 char (if empty string case covered above implies min(1))', () => {
            // Already covered, but checking large input
            const largeText = 'a'.repeat(50001)
            const result = transformSchema.safeParse({ inputText: largeText })
            expect(result.success).toBe(false)
        })

        it('uses default temperature if omitted', () => {
            const result = transformSchema.parse({ inputText: 'test' })
            expect(result.temperature).toBe(0.7)
        })
    })

    describe('memorySchema', () => {
        it('fails on empty content', () => {
            const result = memorySchema.safeParse({ content: '' })
            expect(result.success).toBe(false)
        })

        it('passes on valid content', () => {
            const result = memorySchema.safeParse({ content: 'Remember this' })
            expect(result.success).toBe(true)
        })
    })

    describe('personaSchema', () => {
        it('requires name', () => {
            const result = personaSchema.safeParse({ baseConfig: 'scratch' })
            expect(result.success).toBe(false)
        })

        it('validates baseConfig enum', () => {
            const result = personaSchema.safeParse({ name: 'Test', baseConfig: 'invalid' })
            expect(result.success).toBe(false)
        })

        it('passes with correct data', () => {
            const result = personaSchema.safeParse({ name: 'Work', baseConfig: 'clone' })
            expect(result.success).toBe(true)
        })
    })
})
