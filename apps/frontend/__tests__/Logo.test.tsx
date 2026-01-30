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
    // Default size is 'md' with width 75
    expect(img?.getAttribute('width')).toBe('75');
  });

  it('renders different sizes with correct proportions', () => {
    const { rerender, container } = render(<Logo size="sm" />);
    let img = container.querySelector('img');
    expect(img?.getAttribute('width')).toBe('60');
    expect(img?.getAttribute('height')).toBe('32');

    rerender(<Logo size="md" />);
    img = container.querySelector('img');
    expect(img?.getAttribute('width')).toBe('75');
    expect(img?.getAttribute('height')).toBe('40');

    rerender(<Logo size="xl" />);
    img = container.querySelector('img');
    expect(img?.getAttribute('width')).toBe('120');
    expect(img?.getAttribute('height')).toBe('64');
  });

  it('renders as link when clickable', () => {
    const { container } = render(<Logo clickable />);
    const link = container.querySelector('a');
    expect(link).toBeInTheDocument();
    expect(link?.getAttribute('href')).toBe('/');
  });

  it('renders without link when not clickable', () => {
    const { container } = render(<Logo clickable={false} />);
    const link = container.querySelector('a');
    expect(link).not.toBeInTheDocument();
  });

  it('has priority loading for LCP optimization', () => {
    const { container } = render(<Logo priority />);
    const img = container.querySelector('img');
    expect(img?.getAttribute('loading')).toBe(null); // priority removes loading attr
  });
});
