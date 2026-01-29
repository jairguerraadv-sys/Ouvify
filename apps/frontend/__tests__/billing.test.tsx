/**
 * Billing Components Tests - Ouvy SaaS
 * Sprint 4 - Feature 4.3: Pricing Page
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PricingCard } from '@/components/billing/PricingCard';
import { Plan } from '@/hooks/use-billing';

// Mock plan data
const mockPlan: Plan = {
  id: 1,
  name: 'Starter',
  slug: 'starter',
  price_cents: 9900,
  price_display: 'R$ 99,00',
  currency: 'BRL',
  description: 'Ideal para pequenas empresas',
  features: ['500 feedbacks/mês', 'Suporte prioritário', '5 usuários'],
  limits: {
    feedbacks_per_month: 500,
    users: 5,
    storage_gb: 10,
  },
  is_popular: true,
  is_free: false,
  trial_days: 14,
  is_active: true,
};

const mockFreePlan: Plan = {
  id: 0,
  name: 'Gratuito',
  slug: 'free',
  price_cents: 0,
  price_display: 'Grátis',
  currency: 'BRL',
  description: 'Perfeito para testar',
  features: ['50 feedbacks/mês', 'Suporte por email'],
  limits: {
    feedbacks_per_month: 50,
    users: 1,
    storage_gb: 1,
  },
  is_popular: false,
  is_free: true,
  trial_days: 0,
  is_active: true,
};

describe('PricingCard', () => {
  it('renders plan name and description', () => {
    render(<PricingCard plan={mockPlan} onSelect={() => {}} />);
    
    expect(screen.getByText('Starter')).toBeInTheDocument();
    expect(screen.getByText('Ideal para pequenas empresas')).toBeInTheDocument();
  });

  it('renders price correctly for paid plan', () => {
    render(<PricingCard plan={mockPlan} onSelect={() => {}} />);
    
    expect(screen.getByText(/R\$ 99/)).toBeInTheDocument();
    expect(screen.getByText('/mês')).toBeInTheDocument();
  });

  it('renders "Grátis" for free plan', () => {
    render(<PricingCard plan={mockFreePlan} onSelect={() => {}} />);
    
    expect(screen.getByText('Grátis')).toBeInTheDocument();
    expect(screen.getByText('para sempre')).toBeInTheDocument();
  });

  it('renders all features', () => {
    render(<PricingCard plan={mockPlan} onSelect={() => {}} />);
    
    expect(screen.getByText('500 feedbacks/mês')).toBeInTheDocument();
    expect(screen.getByText('Suporte prioritário')).toBeInTheDocument();
    expect(screen.getByText('5 usuários')).toBeInTheDocument();
  });

  it('shows "Mais Popular" badge for popular plans', () => {
    render(<PricingCard plan={mockPlan} onSelect={() => {}} />);
    
    expect(screen.getByText('Mais Popular')).toBeInTheDocument();
  });

  it('does not show popular badge for non-popular plans', () => {
    render(<PricingCard plan={mockFreePlan} onSelect={() => {}} />);
    
    expect(screen.queryByText('Mais Popular')).not.toBeInTheDocument();
  });

  it('calls onSelect with plan id when button is clicked', () => {
    const onSelect = jest.fn();
    render(<PricingCard plan={mockPlan} onSelect={onSelect} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(onSelect).toHaveBeenCalledWith(mockPlan.id);
  });

  it('shows loading state when isLoading is true', () => {
    render(<PricingCard plan={mockPlan} onSelect={() => {}} isLoading />);
    
    expect(screen.getByText('Processando...')).toBeInTheDocument();
  });

  it('disables button when isCurrentPlan is true', () => {
    render(<PricingCard plan={mockPlan} onSelect={() => {}} isCurrentPlan />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByText('Plano Atual')).toBeInTheDocument();
  });

  it('shows yearly discount when billing period is yearly', () => {
    render(<PricingCard plan={mockPlan} onSelect={() => {}} billingPeriod="yearly" />);
    
    // 20% discount: 99 * 0.8 = 79.2 ≈ 79
    expect(screen.getByText(/R\$ 79/)).toBeInTheDocument();
    expect(screen.getByText(/Economize/)).toBeInTheDocument();
  });

  it('renders trial days info', () => {
    render(<PricingCard plan={mockPlan} onSelect={() => {}} />);
    
    expect(screen.getByText('14 dias de teste grátis')).toBeInTheDocument();
  });

  it('renders custom button text when provided', () => {
    render(<PricingCard plan={mockPlan} onSelect={() => {}} buttonText="Comprar Agora" />);
    
    expect(screen.getByText('Comprar Agora')).toBeInTheDocument();
  });

  it('renders not included features when provided', () => {
    render(
      <PricingCard 
        plan={mockFreePlan} 
        onSelect={() => {}} 
        showNotIncluded={['White Label', 'API']} 
      />
    );
    
    expect(screen.getByText('White Label')).toBeInTheDocument();
    expect(screen.getByText('API')).toBeInTheDocument();
  });
});

describe('PricingCard limits', () => {
  it('renders limits section when plan has limits', () => {
    render(<PricingCard plan={mockPlan} onSelect={() => {}} />);
    
    expect(screen.getByText('Limites')).toBeInTheDocument();
    expect(screen.getByText('Feedbacks/mês')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
  });

  it('shows "Ilimitado" for -1 limits', () => {
    const unlimitedPlan = {
      ...mockPlan,
      limits: { feedbacks_per_month: -1 },
    };
    render(<PricingCard plan={unlimitedPlan} onSelect={() => {}} />);
    
    expect(screen.getByText('Ilimitado')).toBeInTheDocument();
  });
});
