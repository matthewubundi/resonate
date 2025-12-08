import { render, screen } from '@testing-library/react'
import { Button } from '../Components'
import { describe, it, expect } from 'vitest'

describe('Button Component', () => {
    it('renders children correctly', () => {
        render(<Button>Click Me</Button>)
        expect(screen.getByText('Click Me')).toBeInTheDocument()
    })

    it('applies primary variant classes by default', () => {
        const { container } = render(<Button>Primary</Button>)
        const button = container.firstChild as HTMLElement
        expect(button).toHaveClass('bg-azure')
        expect(button).toHaveClass('text-white')
    })

    it('applies ghost variant classes when specified', () => {
        const { container } = render(<Button variant="ghost">Ghost</Button>)
        const button = container.firstChild as HTMLElement
        expect(button).toHaveClass('text-ink/70')
        expect(button).not.toHaveClass('bg-azure')
    })

    it('shows loader when isLoading is true', () => {
        const { container } = render(<Button isLoading>Loading</Button>)
        // Check for loader SVG or element. The component renders <Loader2 /> which usually renders an svg.
        const svg = container.querySelector('svg')
        expect(svg).toBeInTheDocument()
        expect(svg).toHaveClass('animate-spin')
    })

    it('is disabled when disabled prop is true', () => {
        render(<Button disabled>Disabled</Button>)
        expect(screen.getByText('Disabled').closest('button')).toBeDisabled()
    })

    it('is disabled when isLoading is true', () => {
        render(<Button isLoading>Loading</Button>)
        expect(screen.getByText('Loading').closest('button')).toBeDisabled()
    })
})
