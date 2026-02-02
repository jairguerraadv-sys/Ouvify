import { render, screen } from '@testing-library/react';
import { Logo } from '@/components/ui/logo';

describe('Logo Component', () => {
  it('renders logo image', () => {
    render(<Logo />);
    const logo = screen.getByAltText(/ouvify/i);
    expect(logo).toBeInTheDocument();
  });

  it('renders with correct default size', () => {
    const { container } = render(<Logo />);
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    // Default variant is 'full' and size is 'md'
    expect(img?.getAttribute('width')).toBe('130');
    expect(img?.getAttribute('height')).toBe('40');
  });

  it('renders different sizes with correct proportions', () => {
    const { rerender, container } = render(<Logo size="sm" />);
    let img = container.querySelector('img');
    expect(img?.getAttribute('width')).toBe('100');
    expect(img?.getAttribute('height')).toBe('32');

    rerender(<Logo size="md" />);
    img = container.querySelector('img');
    expect(img?.getAttribute('width')).toBe('130');
    expect(img?.getAttribute('height')).toBe('40');

    rerender(<Logo size="xl" />);
    img = container.querySelector('img');
    expect(img?.getAttribute('width')).toBe('260');
    expect(img?.getAttribute('height')).toBe('80');
  });

  it('renders as link by default (href="/")', () => {
    const { container } = render(<Logo />);
    const link = container.querySelector('a');
    expect(link).toBeInTheDocument();
    expect(link?.getAttribute('href')).toBe('/');
  });

  it('renders without link when href is null', () => {
    const { container } = render(<Logo href={null} />);
    const link = container.querySelector('a');
    expect(link).not.toBeInTheDocument();
  });

  it('accepts priority loading for LCP optimization', () => {
    const { container } = render(<Logo priority />);
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
  });
});
