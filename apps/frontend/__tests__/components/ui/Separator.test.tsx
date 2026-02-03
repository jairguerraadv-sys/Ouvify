import { render } from '@testing-library/react'
import { Separator } from '@/components/ui/separator'

describe('Separator Component', () => {
  it('renders horizontal separator by default', () => {
    const { container } = render(<Separator />)
    const separator = container.firstChild
    expect(separator).toBeInTheDocument()
    expect(separator).toHaveAttribute('data-orientation', 'horizontal')
  })

  it('renders vertical separator', () => {
    const { container } = render(<Separator orientation="vertical" />)
    const separator = container.firstChild
    expect(separator).toHaveAttribute('data-orientation', 'vertical')
  })

  it('applies custom className', () => {
    const { container } = render(<Separator className="custom-separator" />)
    expect(container.firstChild).toHaveClass('custom-separator')
  })

  it('renders decorative separator', () => {
    const { container } = render(<Separator decorative />)
    const separator = container.firstChild
    expect(separator).toBeInTheDocument()
  })
})
