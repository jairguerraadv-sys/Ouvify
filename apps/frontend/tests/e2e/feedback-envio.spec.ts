import { test, expect } from './fixtures';

test.describe('Feedback Submission Flow', () => {
  test('should submit feedback and receive protocol', async ({ page }) => {
    // Set tenant in localStorage
    await page.addInitScript(() => {
      localStorage.setItem('tenant_id', 'empresaa');
    });

    // Navegar para página de envio
    await page.goto('/enviar');

    // Verificar se a página carregou
    await expect(page).toHaveTitle(/Ouvify/);
    await expect(page.locator('h2')).toContainText('Canal de Ouvidoria');

    // Preencher formulário
    await page.selectOption('select', 'sugestao');
    await page.fill('input[placeholder*="Resuma sua manifestação"]', 'Teste E2E - Sugestão');
    await page.fill('textarea[placeholder*="Descreva sua manifestação"]', 'Este é um teste automatizado do fluxo de envio de feedback.');
    await page.check('input[id="anonimo"]');

    // Enviar feedback
    await page.click('button[type="submit"]');

    // Aguardar modal de sucesso
    await page.waitForSelector('text=Feedback Enviado!');

    // Verificar se protocolo foi gerado
    const protocoloElement = page.locator('.font-mono').first();
    await expect(protocoloElement).toBeVisible();

    const protocolo = await protocoloElement.textContent();
    expect(protocolo).toMatch(/^OUVY-[A-Z0-9]{4}-[A-Z0-9]{4}$/);

    // Verificar mensagem de sucesso
    await expect(page.locator('text=Feedback Enviado!')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Set tenant in localStorage
    await page.addInitScript(() => {
      localStorage.setItem('tenant_id', 'empresaa');
    });

    await page.goto('/enviar');

    // Tentar enviar sem preencher campos obrigatórios
    await page.click('button[type="submit"]');

    // Verificar mensagens de erro
    await expect(page.locator('text=Título é obrigatório')).toBeVisible();
    await expect(page.locator('text=Descrição é obrigatória')).toBeVisible();
  });

  test('should handle different feedback types', async ({ page }) => {
    // Set tenant in localStorage
    await page.addInitScript(() => {
      localStorage.setItem('tenant_id', 'empresaa');
    });

    await page.goto('/enviar');

    // Testar diferentes tipos
    const tipos = ['denuncia', 'sugestao', 'elogio', 'reclamacao'];

    for (const tipo of tipos) {
      await page.selectOption('select', tipo);
      await expect(page.locator('select')).toHaveValue(tipo);
    }
  });
});