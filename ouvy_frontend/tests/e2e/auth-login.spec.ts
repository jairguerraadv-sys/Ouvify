import { test, expect } from './fixtures';

test.describe('Authentication Flow', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    // Navegar para login
    await page.goto('/login');

    // Verificar se a página carregou
    await expect(page).toHaveTitle(/Ouvy/);
    await expect(page.locator('h1')).toContainText('Entrar');

    // Preencher credenciais válidas
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'admin123');

    // Clicar em login
    await page.click('button[type="submit"]');

    // Aguardar redirecionamento
    await page.waitForURL('/dashboard');

    // Verificar se estamos no dashboard
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.url()).toContain('/dashboard');

    // Verificar se token foi salvo
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(token).toBeTruthy();
    expect(token).toMatch(/^Token /);
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Preencher credenciais inválidas
    await page.fill('input[type="email"]', 'invalid@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');

    // Clicar em login
    await page.click('button[type="submit"]');

    // Verificar mensagem de erro
    await expect(page.locator('text=Credenciais inválidas')).toBeVisible();

    // Verificar que não redirecionou
    await expect(page.url()).toContain('/login');
  });

  test('should redirect to login when accessing protected route without auth', async ({ page }) => {
    // Tentar acessar dashboard sem estar logado
    await page.goto('/dashboard');

    // Deve redirecionar para login
    await page.waitForURL('/login?redirect=/dashboard');

    // Verificar se estamos na página de login
    await expect(page.locator('h1')).toContainText('Entrar');
  });

  test('should logout successfully', async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    // Verificar se estamos logados
    await expect(page.locator('text=Dashboard')).toBeVisible();

    // Clicar em logout (assumindo que existe um botão)
    await page.click('[data-testid="logout-button"]');

    // Aguardar redirecionamento para login
    await page.waitForURL('/login');

    // Verificar se token foi removido
    const token = await page.evaluate(() => localStorage.getItem('auth_token'));
    expect(token).toBeNull();
  });

  test('should handle session expiration', async ({ page }) => {
    // Fazer login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Simular token expirado removendo do localStorage
    await page.evaluate(() => localStorage.removeItem('auth_token'));

    // Tentar acessar uma rota protegida
    await page.reload();

    // Deve redirecionar para login
    await page.waitForURL('/login');
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/login');

    // Testar emails inválidos
    const invalidEmails = ['invalid', 'invalid@', '@test.com', 'test'];

    for (const email of invalidEmails) {
      await page.fill('input[type="email"]', email);
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');

      await expect(page.locator('text=Email inválido')).toBeVisible();
    }
  });

  test('should validate password requirements', async ({ page }) => {
    await page.goto('/login');

    // Senha muito curta
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', '123');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Senha deve ter no mínimo 6 caracteres')).toBeVisible();
  });
});