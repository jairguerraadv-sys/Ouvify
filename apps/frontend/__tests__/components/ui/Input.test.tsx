import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/ui/input'

describe('Input Component', () => {
  it('renders correctly', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('accepts user input', async () => {
    const user = userEvent.setup()
    render(<Input placeholder="Type here" />)
    
    const input = screen.getByPlaceholderText('Type here')
    await user.type(input, 'Hello World')
    
    expect(input).toHaveValue('Hello World')
  })

  it('handles onChange event', async () => {
    const handleChange = jest.fn()
    const user = userEvent.setup()
    render(<Input onChange={handleChange} placeholder="Test" />)
    
    const input = screen.getByPlaceholderText('Test')
    await user.type(input, 'a')
    
    expect(handleChange).toHaveBeenCalled()
  })

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled placeholder="Disabled" />)
    expect(screen.getByPlaceholderText('Disabled')).toBeDisabled()
  })

  it('renders with different types', () => {
    const { rerender } = render(<Input type="text" placeholder="Text" />)
    expect(screen.getByPlaceholderText('Text')).toHaveAttribute('type', 'text')

    rerender(<Input type="email" placeholder="Email" />)
    expect(screen.getByPlaceholderText('Email')).toHaveAttribute('type', 'email')

    rerender(<Input type="password" placeholder="Password" />)
    expect(screen.getByPlaceholderText('Password')).toHaveAttribute('type', 'password')
  })

  it('applies custom className', () => {
    render(<Input className="custom-input" placeholder="Custom" />)
    const input = screen.getByPlaceholderText('Custom')
    expect(input).toHaveClass('custom-input')
  })

  it('renders with default value', () => {
    render(<Input defaultValue="Default text" />)
    expect(screen.getByDisplayValue('Default text')).toBeInTheDocument()
  })

  it('can be cleared', async () => {
    const user = userEvent.setup()
    render(<Input placeholder="Clear me" />)
    
    const input = screen.getByPlaceholderText('Clear me')
    await user.type(input, 'Text to clear')
    expect(input).toHaveValue('Text to clear')
    
    await user.clear(input)
    expect(input).toHaveValue('')
  })

  it('respects maxLength attribute', async () => {
    const user = userEvent.setup()
    render(<Input maxLength={5} placeholder="Max 5" />)
    
    const input = screen.getByPlaceholderText('Max 5')
    await user.type(input, '123456789')
    
    expect(input).toHaveValue('12345')
  })

  it('handles required attribute', () => {
    render(<Input required placeholder="Required" />)
    expect(screen.getByPlaceholderText('Required')).toBeRequired()
  })
})
