import { render, screen } from '@testing-library/react'
import { Label } from '@/components/ui/label'

describe('Label Component', () => {
  it('renders correctly', () => {
    render(<Label>Email Address</Label>)
    expect(screen.getByText('Email Address')).toBeInTheDocument()
  })

  it('renders with htmlFor attribute', () => {
    render(<Label htmlFor="email-input">Email</Label>)
    const label = screen.getByText('Email')
    expect(label).toHaveAttribute('for', 'email-input')
  })

  it('applies custom className', () => {
    const { container } = render(
      <Label className="custom-label">Custom</Label>
    )
    expect(container.firstChild).toHaveClass('custom-label')
  })

  it('renders with required indicator', () => {
    render(<Label>Name *</Label>)
    expect(screen.getByText(/Name \*/)).toBeInTheDocument()
  })

  it('associates with input element', () => {
    render(
      <div>
        <Label htmlFor="test-input">Test Label</Label>
        <input id="test-input" />
      </div>
    )
    
    const label = screen.getByText('Test Label')
    const input = document.getElementById('test-input')
    
    expect(label).toHaveAttribute('for', 'test-input')
    expect(input).toBeInTheDocument()
  })
})
