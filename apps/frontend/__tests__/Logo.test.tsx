import { render, screen } from '@testing-library/react';
import { Logo } from '@/components/ui/logo';

describe('Logo Component', () => {
  it('renders logo image', () => {
    render(<Logo />);
    const logo = screen.getByAltText(/ouvy/i);
    expect(logo).toBeInTheDocument();
  });

  it('renders with icon variant by default', () => {
    const { container } = render(<Logo />);
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
  });

  it('renders different sizes', () => {
    const { rerender, container } = render(<Logo size="xs" />);
    let img = container.querySelector('img');
    expect(img?.getAttribute('width')).toBe('80');

    rerender(<Logo size="md" />);
    img = container.querySelector('img');
    expect(img?.getAttribute('width')).toBe('120');

    rerender(<Logo size="xl" />);
    img = container.querySelector('img');
    expect(img?.getAttribute('width')).toBe('180');
  });

  it('renders full variant with text', () => {
    render(<Logo variant="full" />);
    expect(screen.getByText('Ouvy')).toBeInTheDocument();
  });

  it('has priority loading for LCP optimization', () => {
    const { container } = render(<Logo />);
    const img = container.querySelector('img');
    expect(img?.getAttribute('loading')).toBe(null); // priority removes loading attr
  });
});
