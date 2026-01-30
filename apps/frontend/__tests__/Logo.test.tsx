import { render, screen } from '@testing-library/react';
import { Logo } from '@/components/ui/logo';

describe('Logo Component', () => {
  it('renders logo image', () => {
    render(<Logo />);
    const logo = screen.getByAltText(/ouvify/i);
    expect(logo).toBeInTheDocument();
  });

  it('renders with icon variant by default', () => {
    const { container } = render(<Logo />);
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
  });

  it('renders different sizes', () => {
    const { rerender, container } = render(<Logo size="sm" />);
    let img = container.querySelector('img');
    expect(img?.getAttribute('width')).toBe('32');

    rerender(<Logo size="md" />);
    img = container.querySelector('img');
    expect(img?.getAttribute('width')).toBe('40');

    rerender(<Logo size="xl" />);
    img = container.querySelector('img');
    expect(img?.getAttribute('width')).toBe('64');
  });

  it('renders logo with text when showText is true', () => {
    render(<Logo showText={true} />);
    expect(screen.getByText('Ouvify')).toBeInTheDocument();
  });

  it('has priority loading for LCP optimization', () => {
    const { container } = render(<Logo priority />);
    const img = container.querySelector('img');
    expect(img?.getAttribute('loading')).toBe(null); // priority removes loading attr
  });
});
