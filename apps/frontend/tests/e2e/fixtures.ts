import { test as base, expect, APIRequestContext } from '@playwright/test';

type TestFixtures = {
  authenticatedPage: any;
  apiRequest: APIRequestContext;
};

export const test = base.extend<TestFixtures>({
  // Fixture para API requests
  apiRequest: async ({ playwright }, use) => {
    const apiRequest = await playwright.request.newContext({
      baseURL: 'http://localhost:8000/api',
      extraHTTPHeaders: {
        'X-Tenant-ID': 'empresaa'
      }
    });
    await use(apiRequest);
    await apiRequest.dispose();
  },

  // Fixture para página autenticada
  authenticatedPage: async ({ page }: { page: any }, use: any) => {
    // Fazer login antes de cada teste
    await page.goto('/login');

    // Preencher formulário de login
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'admin123');

    // Clicar no botão de login
    await page.click('button[type="submit"]');

    // Aguardar login (verificar token no localStorage)
    await page.waitForFunction(() => {
      return localStorage.getItem('auth_token') !== null;
    });

    // Usar a página autenticada
    await use(page);
  },
});

export { expect };

// Helper function para criar feedback de teste
export async function createTestFeedback(page: any, data: {
  tipo: string;
  titulo: string;
  descricao: string;
  anonimo?: boolean;
}) {
  // Set tenant
  await page.addInitScript(() => {
    localStorage.setItem('tenant_id', 'empresaa');
  });

  await page.goto('/enviar');

  // Preencher formulário
  await page.selectOption('select', data.tipo);
  await page.fill('input[placeholder*="Resuma sua manifestação"]', data.titulo);
  await page.fill('textarea[placeholder*="Descreva sua manifestação"]', data.descricao);

  if (data.anonimo) {
    await page.check('input[id="anonimo"]');
  }

  // Enviar
  await page.click('button[type="submit"]');

  // Aguardar protocolo
  await page.waitForSelector('text=Feedback Enviado!');
  const protocoloElement = await page.locator('.font-mono').first();
  const protocolo = await protocoloElement.textContent();

  return protocolo;
}

// Teste helper para consultar protocolo
export async function checkProtocolStatus(page: any, protocolo: string) {
  await page.goto('/acompanhar');

  await page.fill('input[name="protocolo"]', protocolo);
  await page.click('button[type="submit"]');

  // Aguardar resultado
  await page.waitForSelector('[data-testid="status"]');
  const status = await page.locator('[data-testid="status"]').textContent();

  return status;
}