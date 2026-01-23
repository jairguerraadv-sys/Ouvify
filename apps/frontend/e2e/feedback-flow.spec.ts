import { test, expect } from '@playwright/test';

test.describe('Fluxo Crítico: Submissão de Feedback', () => {
  test('deve permitir submeter feedback e gerar código de rastreamento', async ({ page }) => {
    // Acessar página de envio
    await page.goto('/enviar');

    // Preencher formulário
    await page.fill('input[name="nome"]', 'João Silva');
    await page.fill('input[name="email"]', 'joao@example.com');
    await page.selectOption('select[name="tipo"]', 'reclamacao');
    await page.fill('textarea[name="mensagem"]', 'Teste de feedback via E2E');

    // Submeter
    await page.click('button[type="submit"]');

    // Verificar se código de rastreamento foi gerado
    await expect(page.locator('text=/OUVY-[A-Z0-9]{8}/')).toBeVisible();

    // Verificar se feedback foi salvo
    await expect(page.locator('text=Feedback enviado com sucesso')).toBeVisible();
  });
});

test.describe('Fluxo Crítico: Rastreamento de Feedback', () => {
  test('deve permitir consultar status do feedback', async ({ page }) => {
    // Acessar página de rastreamento
    await page.goto('/acompanhar');

    // Inserir código de rastreamento
    await page.fill('input[name="codigo"]', 'OUVY-ABC12345');

    // Consultar
    await page.click('button[type="submit"]');

    // Verificar se informações são exibidas
    await expect(page.locator('text=Status do Feedback')).toBeVisible();
  });
});