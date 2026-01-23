import { test, expect } from './fixtures';

test.describe('Dashboard CRUD Operations', () => {
  test('should display dashboard with feedback statistics', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    // Verificar se estamos no dashboard
    await expect(page.locator('h1')).toContainText('Dashboard');

    // Verificar estatísticas
    await expect(page.locator('text=Total de Feedbacks')).toBeVisible();
    await expect(page.locator('text=Feedbacks Pendentes')).toBeVisible();
    await expect(page.locator('text=Feedbacks Resolvidos')).toBeVisible();

    // Verificar lista de feedbacks recentes
    await expect(page.locator('text=Feedbacks Recentes')).toBeVisible();

    // Verificar se há dados ou mensagem vazia
    const hasFeedbacks = await page.locator('[data-testid="feedback-item"]').count() > 0;
    if (hasFeedbacks) {
      await expect(page.locator('[data-testid="feedback-item"]').first()).toBeVisible();
    } else {
      await expect(page.locator('text=Os feedbacks recebidos aparecerão aqui')).toBeVisible();
    }
  });

  test('should navigate to feedback details', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    // Verificar se há feedbacks para clicar
    const feedbackCount = await page.locator('[data-testid="feedback-item"]').count();

    if (feedbackCount > 0) {
      // Clicar no primeiro feedback
      await page.locator('[data-testid="feedback-item"]').first().click();

      // Verificar se navegou para página de detalhes
      await expect(page.url()).toMatch(/\/dashboard\/feedbacks\/OUVY-[A-Z0-9]{4}-[A-Z0-9]{4}/);

      // Verificar elementos da página de detalhes
      await expect(page.locator('[data-testid="feedback-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="feedback-description"]')).toBeVisible();
      await expect(page.locator('[data-testid="feedback-status"]')).toBeVisible();
    }
  });

  test('should update feedback status', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    // Navegar para um feedback específico (usar um que sabemos que existe)
    await page.goto('/dashboard/feedbacks/OUVY-D3B9-7DQD');

    // Verificar se a página carregou
    await expect(page.locator('[data-testid="feedback-title"]')).toBeVisible();

    // Verificar status atual
    const currentStatus = await page.locator('[data-testid="feedback-status"]').textContent();

    // Se estiver pendente, tentar alterar para "em análise"
    if (currentStatus?.includes('Pendente')) {
      await page.selectOption('[data-testid="status-select"]', 'em_analise');
      await page.click('[data-testid="save-status"]');

      // Verificar se status foi atualizado
      await expect(page.locator('[data-testid="feedback-status"]')).toContainText('Em Análise');

      // Verificar se timeline foi atualizada
      await expect(page.locator('text=Status alterado')).toBeVisible();
    }
  });

  test('should add response to feedback', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    // Navegar para um feedback
    await page.goto('/dashboard/feedbacks/OUVY-D3B9-7DQD');

    // Adicionar resposta
    await page.fill('[data-testid="response-textarea"]', 'Obrigado pelo feedback. Estamos analisando sua sugestão.');
    await page.click('[data-testid="send-response"]');

    // Verificar se resposta apareceu
    await expect(page.locator('text=Obrigado pelo feedback')).toBeVisible();

    // Verificar se status mudou para resolvido
    await expect(page.locator('[data-testid="feedback-status"]')).toContainText('Resolvido');
  });

  test('should filter feedbacks by status', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    // Navegar para página completa de feedbacks
    await page.goto('/dashboard/feedbacks');

    // Verificar filtros
    await expect(page.locator('[data-testid="status-filter"]')).toBeVisible();

    // Filtrar por pendentes
    await page.selectOption('[data-testid="status-filter"]', 'pendente');

    // Verificar se apenas feedbacks pendentes aparecem
    const feedbackItems = page.locator('[data-testid="feedback-item"]');
    const count = await feedbackItems.count();

    for (let i = 0; i < count; i++) {
      await expect(feedbackItems.nth(i)).toContainText('Pendente');
    }
  });

  test('should search feedbacks', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    await page.goto('/dashboard/feedbacks');

    // Usar barra de pesquisa
    await page.fill('[data-testid="search-input"]', 'Chat Flow');
    await page.click('[data-testid="search-button"]');

    // Verificar resultados
    await expect(page.locator('[data-testid="feedback-item"]')).toContainText('Chat Flow');
  });

  test('should paginate feedbacks', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    await page.goto('/dashboard/feedbacks');

    // Verificar paginação se houver muitos feedbacks
    const pagination = page.locator('[data-testid="pagination"]');

    if (await pagination.isVisible()) {
      // Clicar na página 2
      await page.click('[data-testid="page-2"]');

      // Verificar se URL mudou
      await expect(page.url()).toContain('page=2');
    }
  });
});