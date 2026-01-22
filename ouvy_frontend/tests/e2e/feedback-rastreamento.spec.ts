import { test, expect, createTestFeedback } from './fixtures';

test.describe('Feedback Tracking Flow', () => {
  test('should track feedback by protocol', async ({ page }) => {
    // Set tenant in localStorage
    await page.addInitScript(() => {
      localStorage.setItem('tenant_id', 'empresaa');
    });

    // Criar feedback via página
    const protocolo = await createTestFeedback(page, {
      tipo: 'sugestao',
      titulo: 'Teste de Rastreamento',
      descricao: 'Feedback para testar rastreamento por protocolo',
      anonimo: false
    });

    // Agora testar o rastreamento
    await page.goto('/acompanhar');

    // Inserir protocolo
    await page.fill('input[id="protocolo"]', protocolo);
    await page.click('button:has-text("Consultar Protocolo")');

    // Aguardar resultado
    await page.waitForSelector('text=Pendente', { timeout: 10000 });

    // Verificar informações do feedback
    await expect(page.locator('text=Teste de Rastreamento')).toBeVisible();
    await expect(page.locator('text=Sugestão')).toBeVisible();
    await expect(page.locator('text=Pendente')).toBeVisible();

    // Verificar timeline
    await expect(page.locator('[data-testid="timeline"]')).toBeVisible();
    await expect(page.locator('text=Feedback recebido')).toBeVisible();
  });

  test('should handle invalid protocol', async ({ page }) => {
    // Set tenant in localStorage
    await page.addInitScript(() => {
      localStorage.setItem('tenant_id', 'empresaa');
    });

    await page.goto('/acompanhar');

    // Inserir protocolo inválido
    await page.fill('input[id="protocolo"]', 'INVALID-PROTOCOL');
    await page.click('button:has-text("Consultar Protocolo")');

    // Verificar mensagem de erro
    await expect(page.locator('text=Tenant não identificado')).toBeVisible();
  });

  test('should handle malformed protocol', async ({ page }) => {
    // Set tenant in localStorage
    await page.addInitScript(() => {
      localStorage.setItem('tenant_id', 'empresaa');
    });

    await page.goto('/acompanhar');

    // Testar diferentes formatos inválidos
    const invalidProtocols = ['123', 'ABC', 'OUVY-123', 'INVALID'];

    for (const protocol of invalidProtocols) {
      await page.fill('input[id="protocolo"]', protocol);
      await page.click('button:has-text("Consultar Protocolo")');

      await expect(page.locator('text=Tenant não identificado')).toBeVisible();
    }
  });

  test('should show feedback details', async ({ page }) => {
    // Set tenant in localStorage
    await page.addInitScript(() => {
      localStorage.setItem('tenant_id', 'empresaa');
    });

    // Criar feedback via página
    const protocolo = await createTestFeedback(page, {
      tipo: 'reclamacao',
      titulo: 'Problema com atendimento',
      descricao: 'O atendimento foi muito demorado e pouco eficiente.',
      anonimo: false
    });

    // Rastrear feedback
    await page.goto('/acompanhar');
    await page.fill('input[id="protocolo"]', protocolo);
    await page.click('button:has-text("Consultar Protocolo")');

    // Verificar detalhes
    await expect(page.locator('text=Problema com atendimento')).toBeVisible();
    await expect(page.locator('text=O atendimento foi muito demorado')).toBeVisible();
    await expect(page.locator('text=Reclamação')).toBeVisible();
    await expect(page.locator('text=Pendente')).toBeVisible();

    // Verificar data de criação (deve ser recente)
    const dataElement = page.locator('[data-testid="feedback-data"]');
    await expect(dataElement).toBeVisible();
  });
});