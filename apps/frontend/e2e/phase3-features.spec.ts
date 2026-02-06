import { test, expect } from "@playwright/test";

test.describe("Fase 3: Notificações, Segurança e Audit Log", () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada teste
    await page.goto("/login");
    await page.fill('input[name="email"]', "admin@ouvify.com");
    await page.fill('input[name="password"]', "senha123");
    await page.click('button[type="submit"]');

    // Aguardar redirecionamento pós-login
    await page.waitForURL("/dashboard");
  });

  test.describe("Preferências de Notificação", () => {
    test("deve permitir acessar página de preferências", async ({ page }) => {
      await page.goto("/dashboard/configuracoes/notificacoes");

      // Verificar título da página
      await expect(page.locator("h1")).toContainText(
        "Preferências de Notificação",
      );
      await expect(
        page.locator("text=Configure como deseja ser notificado"),
      ).toBeVisible();
    });

    test("deve exibir todas as preferências de notificação", async ({
      page,
    }) => {
      await page.goto("/dashboard/configuracoes/notificacoes");

      // Verificar seções
      await expect(page.locator("text=Notificações por Email")).toBeVisible();
      await expect(page.locator("text=Notificações Push")).toBeVisible();

      // Verificar switches existem (7 no total)
      const switches = await page.locator('button[role="switch"]').count();
      expect(switches).toBe(7);
    });

    test("deve permitir alterar preferência de email", async ({ page }) => {
      await page.goto("/dashboard/configuracoes/notificacoes");

      // Aguardar carregamento
      await page.waitForSelector('button[role="switch"]');

      // Toggle primeiro switch
      const firstSwitch = page.locator('button[role="switch"]').first();
      await firstSwitch.click();

      // Verificar que botão de salvar ficou habilitado
      const saveButton = page.locator('button:has-text("Salvar Alterações")');
      await expect(saveButton).not.toBeDisabled();

      // Salvar mudanças
      await saveButton.click();

      // Verificar toast de sucesso
      await expect(
        page.locator("text=Preferências salvas com sucesso"),
      ).toBeVisible({
        timeout: 5000,
      });
    });

    test("deve permitir cancelar mudanças", async ({ page }) => {
      await page.goto("/dashboard/configuracoes/notificacoes");

      await page.waitForSelector('button[role="switch"]');

      // Toggle switch
      const firstSwitch = page.locator('button[role="switch"]').first();
      await firstSwitch.click();

      // Cancelar
      const cancelButton = page.locator('button:has-text("Cancelar")');
      await cancelButton.click();

      // Verificar que botões ficaram desabilitados
      const saveButton = page.locator('button:has-text("Salvar Alterações")');
      await expect(saveButton).toBeDisabled();
      await expect(cancelButton).toBeDisabled();
    });
  });

  test.describe("Sessões de Segurança", () => {
    test("deve exibir lista de sessões ativas", async ({ page }) => {
      await page.goto("/dashboard/perfil/seguranca/sessoes");

      // Verificar título
      await expect(page.locator("h1")).toContainText("Segurança & Sessões");

      // Verificar cards de estatísticas
      await expect(page.locator("text=Sessões Ativas")).toBeVisible();
      await expect(page.locator("text=Logins (24h)")).toBeVisible();
      await expect(page.locator("text=Dispositivo Principal")).toBeVisible();
      await expect(page.locator("text=Navegador Principal")).toBeVisible();

      // Verificar tabela de sessões
      await expect(page.locator("table")).toBeVisible();
    });

    test("deve identificar sessão atual", async ({ page }) => {
      await page.goto("/dashboard/perfil/seguranca/sessoes");

      // Aguardar carregamento da tabela
      await page.waitForSelector("table");

      // Verificar que existe badge "Esta sessão"
      await expect(page.locator("text=Esta sessão")).toBeVisible();
    });

    test("deve permitir encerrar sessão específica", async ({ page }) => {
      await page.goto("/dashboard/perfil/seguranca/sessoes");

      await page.waitForSelector("table");

      // Encontrar botão de encerrar (ignorando sessão atual)
      const terminateButtons = page
        .locator('button:has-text("Encerrar")')
        .filter({
          hasNot: page.locator("text=Esta sessão"),
        });

      const count = await terminateButtons.count();
      if (count > 0) {
        await terminateButtons.first().click();

        // Verificar toast de sucesso
        await expect(
          page.locator("text=Sessão encerrada com sucesso"),
        ).toBeVisible({
          timeout: 5000,
        });
      }
    });

    test("deve confirmar antes de encerrar todas as sessões", async ({
      page,
    }) => {
      await page.goto("/dashboard/perfil/seguranca/sessoes");

      // Mock do dialog confirm
      page.on("dialog", async (dialog) => {
        expect(dialog.message()).toContain("Tem certeza");
        await dialog.dismiss(); // Cancela
      });

      const terminateAllButton = page.locator(
        'button:has-text("Encerrar todas as sessões")',
      );
      await terminateAllButton.click();

      // Se cancelou, não deve mostrar toast de sucesso
      await expect(
        page.locator("text=Todas as outras sessões foram encerradas"),
      ).not.toBeVisible({
        timeout: 2000,
      });
    });
  });

  test.describe("Audit Log", () => {
    test("deve exibir página de audit log com filtros", async ({ page }) => {
      await page.goto("/dashboard/configuracoes/auditlog");

      // Verificar título
      await expect(page.locator("h1")).toContainText("Audit Log");

      // Verificar cards de resumo
      await expect(page.locator("text=Total de Ações")).toBeVisible();
      await expect(page.locator("text=Taxa de Sucesso")).toBeVisible();
      await expect(page.locator("text=Usuários Únicos")).toBeVisible();

      // Verificar filtros
      await expect(page.locator("text=Tipo de Ação")).toBeVisible();
      await expect(page.locator("text=Data Inicial")).toBeVisible();
      await expect(page.locator("text=Data Final")).toBeVisible();
      await expect(page.getByPlaceholder("Usuário, IP, ação...")).toBeVisible();
    });

    test("deve exibir tabela de logs", async ({ page }) => {
      await page.goto("/dashboard/configuracoes/auditlog");

      // Aguardar carregamento
      await page.waitForSelector("table", { timeout: 10000 });

      // Verificar colunas da tabela
      await expect(page.locator('th:has-text("Data/Hora")')).toBeVisible();
      await expect(page.locator('th:has-text("Usuário")')).toBeVisible();
      await expect(page.locator('th:has-text("Ação")')).toBeVisible();
      await expect(page.locator('th:has-text("Status")')).toBeVisible();
    });

    test("deve permitir filtrar por tipo de ação", async ({ page }) => {
      await page.goto("/dashboard/configuracoes/auditlog");

      await page.waitForSelector("table");

      // Abrir select de tipo de ação
      const actionSelect = page.locator("select").first();
      await actionSelect.selectOption("login");

      // Aguardar recarregamento
      await page.waitForTimeout(1000);

      // Verificar que URL contém o filtro
      expect(page.url()).toContain("action=login");
    });

    test("deve permitir buscar por texto", async ({ page }) => {
      await page.goto("/dashboard/configuracoes/auditlog");

      await page.waitForSelector("table");

      // Digitar no campo de busca
      const searchInput = page.getByPlaceholder("Usuário, IP, ação...");
      await searchInput.fill("admin");

      // Clicar no botão de buscar
      const searchButton = page
        .locator('button[type="button"]')
        .filter({ hasText: "" }); // Botão com ícone de lupa
      await searchButton.click();

      // Aguardar recarregamento
      await page.waitForTimeout(1000);
    });

    test("deve permitir navegar entre páginas", async ({ page }) => {
      await page.goto("/dashboard/configuracoes/auditlog");

      await page.waitForSelector("table");

      // Verificar se existe paginação
      const nextButton = page.locator('button:has-text("Próxima")');
      const prevButton = page.locator('button:has-text("Anterior")');

      // Botão anterior deve estar desabilitado na primeira página
      await expect(prevButton).toBeDisabled();

      // Se houver mais páginas, tentar avançar
      const nextDisabled = await nextButton.isDisabled();
      if (!nextDisabled) {
        await nextButton.click();
        await page.waitForTimeout(1000);

        // Agora anterior deve estar habilitado
        await expect(prevButton).not.toBeDisabled();
      }
    });

    test("deve permitir exportar logs para CSV", async ({ page }) => {
      await page.goto("/dashboard/configuracoes/auditlog");

      await page.waitForSelector("table");

      // Configurar listener para download
      const downloadPromise = page.waitForEvent("download");

      // Clicar em exportar
      const exportButton = page.locator('button:has-text("Exportar CSV")');
      await exportButton.click();

      // Aguardar download
      const download = await downloadPromise;

      // Verificar nome do arquivo
      expect(download.suggestedFilename()).toMatch(/audit-log-.*\.csv/);

      // Verificar toast de sucesso
      await expect(
        page.locator("text=Logs exportados com sucesso"),
      ).toBeVisible({
        timeout: 5000,
      });
    });

    test("deve formatar datas corretamente na tabela", async ({ page }) => {
      await page.goto("/dashboard/configuracoes/auditlog");

      await page.waitForSelector("table");

      // Verificar que existe pelo menos uma data formatada (dd/MM/yyyy HH:mm:ss)
      const dateRegex = /\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}/;
      const tableCells = page.locator("td");
      const count = await tableCells.count();

      let foundDate = false;
      for (let i = 0; i < count; i++) {
        const text = await tableCells.nth(i).textContent();
        if (text && dateRegex.test(text)) {
          foundDate = true;
          break;
        }
      }

      expect(foundDate).toBeTruthy();
    });

    test("deve exibir badges de status com cores", async ({ page }) => {
      await page.goto("/dashboard/configuracoes/auditlog");

      await page.waitForSelector("table");

      // Verificar que existem badges (success, failure, warning)
      const badges = page.locator(
        '[class*="bg-green-600"], [class*="bg-red-600"], [class*="bg-yellow-600"]',
      );
      const count = await badges.count();

      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe("Integração entre funcionalidades", () => {
    test("ações em preferências devem gerar logs de auditoria", async ({
      page,
    }) => {
      // Alterar preferências
      await page.goto("/dashboard/configuracoes/notificacoes");
      await page.waitForSelector('button[role="switch"]');

      const firstSwitch = page.locator('button[role="switch"]').first();
      await firstSwitch.click();

      const saveButton = page.locator('button:has-text("Salvar Alterações")');
      await saveButton.click();

      await expect(
        page.locator("text=Preferências salvas com sucesso"),
      ).toBeVisible({
        timeout: 5000,
      });

      // Ir para audit log
      await page.goto("/dashboard/configuracoes/auditlog");
      await page.waitForSelector("table");

      // Buscar por ação de update nas preferências
      const searchInput = page.getByPlaceholder("Usuário, IP, ação...");
      await searchInput.fill("update");

      const searchButton = page
        .locator('button[type="button"]')
        .filter({ hasText: "" });
      await searchButton.click();

      await page.waitForTimeout(1000);

      // Verificar que há registros
      const table = page.locator("table");
      await expect(table).toContainText("update");
    });

    test("login deve criar nova sessão visível em sessões de segurança", async ({
      page,
    }) => {
      // Após login no beforeEach, verificar sessões
      await page.goto("/dashboard/perfil/seguranca/sessoes");
      await page.waitForSelector("table");

      // Deve ter pelo menos 1 sessão ativa (a atual)
      await expect(page.locator("text=Esta sessão")).toBeVisible();

      // Card de sessões ativas deve mostrar >= 1
      const activeSessionsCard = page
        .locator("text=Sessões Ativas")
        .locator("..")
        .locator("..");
      const activeCount = await activeSessionsCard
        .locator("div.text-2xl")
        .textContent();

      expect(parseInt(activeCount || "0")).toBeGreaterThanOrEqual(1);
    });
  });
});
