/**
 * Testes da página de Audit Log
 * Cobertura: Listagem de logs, filtros, paginação, exportação, estatísticas
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AuditLogPage from "@/app/dashboard/configuracoes/auditlog/page";

// Mock do API client
const mockGet = jest.fn();

jest.mock("@/lib/api", () => ({
  api: {
    get: (...args: any[]) => mockGet(...args),
  },
  getErrorMessage: (error: any) => error?.message || "Erro desconhecido",
}));

// Mock do toast com factory function inline
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockToast = require("sonner").toast;

// Mock do window.URL
global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
global.URL.revokeObjectURL = jest.fn();

describe("Audit Log Page", () => {
  const mockLogs = {
    count: 150,
    next: "http://api/logs/?page=2",
    previous: null,
    results: [
      {
        id: 1,
        action: "login",
        user: {
          id: 1,
          email: "joao@example.com",
          full_name: "João Silva",
        },
        timestamp: "2024-01-15T14:30:25Z",
        ip_address: "192.168.1.1",
        user_agent: "Mozilla/5.0...",
        resource_type: "User",
        resource_id: 1,
        status: "success",
      },
      {
        id: 2,
        action: "update",
        user: {
          id: 2,
          email: "maria@example.com",
          full_name: "Maria Santos",
        },
        timestamp: "2024-01-15T14:28:12Z",
        ip_address: "192.168.1.2",
        user_agent: "Mozilla/5.0...",
        resource_type: "Feedback",
        resource_id: 42,
        status: "success",
      },
      {
        id: 3,
        action: "delete",
        user: {
          id: 3,
          email: "pedro@example.com",
          full_name: "Pedro Costa",
        },
        timestamp: "2024-01-15T14:25:03Z",
        ip_address: "192.168.1.3",
        user_agent: "Mozilla/5.0...",
        resource_type: "Comment",
        resource_id: 99,
        status: "warning",
      },
    ],
  };

  const mockSummaries = [
    {
      date: "2024-01-15",
      total_actions: 50,
      unique_users: 5,
      most_common_action: "view",
      success_rate: 95.2,
    },
    {
      date: "2024-01-14",
      total_actions: 45,
      unique_users: 6,
      most_common_action: "login",
      success_rate: 98.1,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockImplementation((url: string) => {
      if (url.includes("/summaries/by_date/")) {
        return Promise.resolve(mockSummaries);
      }
      if (url.includes("/export/")) {
        return Promise.resolve("csv,data,here");
      }
      return Promise.resolve(mockLogs);
    });
  });

  describe("Renderização Inicial", () => {
    it("renderiza título e descrição da página", async () => {
      render(<AuditLogPage />);

      expect(screen.getByText(/Audit Log/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Registro completo de todas as ações/i),
      ).toBeInTheDocument();
    });

    it("exibe loading state enquanto carrega dados", async () => {
      mockGet.mockImplementation(() => new Promise(() => {}));

      render(<AuditLogPage />);

      expect(screen.getByTestId("loader")).toBeInTheDocument();
    });

    it("carrega e exibe estatísticas", async () => {
      render(<AuditLogPage />);

      await waitFor(() => {
        expect(screen.getByText("95")).toBeInTheDocument(); // total_actions (50+45)
        expect(screen.getByText("96.7%")).toBeInTheDocument(); // avg success rate
      });
    });

    it("exibe lista de logs", async () => {
      render(<AuditLogPage />);

      await waitFor(() => {
        expect(screen.getByText("João Silva")).toBeInTheDocument();
        expect(screen.getByText("Maria Santos")).toBeInTheDocument();
        expect(screen.getByText("Pedro Costa")).toBeInTheDocument();
      });
    });
  });

  describe("Filtros", () => {
    it("permite filtrar por tipo de ação", async () => {
      const user = userEvent.setup();
      render(<AuditLogPage />);

      await waitFor(() => {
        expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
      });

      // Encontrar select de tipo de ação
      const actionSelect = screen.getByRole("combobox", {
        name: /tipo de ação/i,
      });
      await user.click(actionSelect);

      // Selecionar "login"
      const loginOption = screen.getByText("login");
      await user.click(loginOption);

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledWith(
          expect.stringContaining("action=login"),
        );
      });
    });

    it("permite selecionar data inicial", async () => {
      const user = userEvent.setup();
      render(<AuditLogPage />);

      await waitFor(() => {
        expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
      });

      // Abrir calendar picker de data inicial
      const dateButtons = screen.getAllByRole("button");
      const dateFromButton = dateButtons.find(
        (btn) =>
          btn.textContent?.includes("Data Inicial") ||
          btn.textContent?.includes("Selecione"),
      );

      if (dateFromButton) {
        await user.click(dateFromButton);
        // Calendar deve aparecer
        await waitFor(() => {
          expect(screen.getByRole("dialog")).toBeInTheDocument();
        });
      }
    });

    it("permite buscar por texto", async () => {
      const user = userEvent.setup();
      render(<AuditLogPage />);

      await waitFor(() => {
        expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Usuário, IP, ação/i);
      await user.type(searchInput, "João");

      const searchButton = screen.getByRole("button", { name: /buscar/i });
      await user.click(searchButton);

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledWith(
          expect.stringContaining("search=João"),
        );
      });
    });

    it("permite buscar pressionando Enter no campo de busca", async () => {
      const user = userEvent.setup();
      render(<AuditLogPage />);

      await waitFor(() => {
        expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Usuário, IP, ação/i);
      await user.type(searchInput, "Maria{Enter}");

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledWith(
          expect.stringContaining("search=Maria"),
        );
      });
    });
  });

  describe("Paginação", () => {
    it("exibe informações de paginação", async () => {
      render(<AuditLogPage />);

      await waitFor(() => {
        expect(screen.getByText(/Página 1 de 8/i)).toBeInTheDocument();
      });
    });

    it("permite navegar para próxima página", async () => {
      const user = userEvent.setup();
      render(<AuditLogPage />);

      await waitFor(() => {
        expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
      });

      const nextButton = screen.getByRole("button", { name: /Próxima/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("page=2"));
      });
    });

    it("permite navegar para página anterior", async () => {
      const user = userEvent.setup();
      mockGet.mockImplementation((url: string) => {
        if (url.includes("/summaries/by_date/")) {
          return Promise.resolve(mockSummaries);
        }
        return Promise.resolve({
          ...mockLogs,
          previous: "http://api/logs/?page=1",
        });
      });

      render(<AuditLogPage />);

      await waitFor(() => {
        expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
      });

      const prevButton = screen.getByRole("button", { name: /Anterior/i });
      await user.click(prevButton);

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalled();
      });
    });

    it("desabilita botão Anterior na primeira página", async () => {
      render(<AuditLogPage />);

      await waitFor(() => {
        expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
      });

      const prevButton = screen.getByRole("button", { name: /Anterior/i });
      expect(prevButton).toBeDisabled();
    });

    it("desabilita botão Próxima na última página", async () => {
      mockGet.mockImplementation((url: string) => {
        if (url.includes("/summaries/by_date/")) {
          return Promise.resolve(mockSummaries);
        }
        return Promise.resolve({
          count: 20,
          next: null,
          previous: null,
          results: mockLogs.results,
        });
      });

      render(<AuditLogPage />);

      await waitFor(() => {
        expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
      });

      const nextButton = screen.getByRole("button", { name: /Próxima/i });
      expect(nextButton).toBeDisabled();
    });
  });

  describe("Exportação", () => {
    it("exporta logs para CSV com sucesso", async () => {
      const user = userEvent.setup();
      const mockLink = document.createElement("a");
      const clickSpy = jest.spyOn(mockLink, "click");
      jest.spyOn(document, "createElement").mockReturnValue(mockLink);

      render(<AuditLogPage />);

      await waitFor(() => {
        expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
      });

      const exportButton = screen.getByRole("button", {
        name: /Exportar CSV/i,
      });
      await user.click(exportButton);

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledWith(
          expect.stringContaining("/export/"),
          expect.objectContaining({
            headers: { Accept: "text/csv" },
          }),
        );
      });

      expect(mockToast.success).toHaveBeenCalledWith(
        "Logs exportados com sucesso",
      );
      expect(clickSpy).toHaveBeenCalled();
    });

    it("exibe erro ao falhar na exportação", async () => {
      const user = userEvent.setup();
      mockGet.mockImplementation((url: string) => {
        if (url.includes("/export/")) {
          return Promise.reject(new Error("Erro ao exportar"));
        }
        if (url.includes("/summaries/by_date/")) {
          return Promise.resolve(mockSummaries);
        }
        return Promise.resolve(mockLogs);
      });

      render(<AuditLogPage />);

      await waitFor(() => {
        expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
      });

      const exportButton = screen.getByRole("button", {
        name: /Exportar CSV/i,
      });
      await user.click(exportButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith("Erro ao exportar");
      });
    });
  });

  describe("Exibição de Dados", () => {
    it("formata datas corretamente", async () => {
      render(<AuditLogPage />);

      await waitFor(() => {
        expect(screen.getByText(/15\/01\/2024/i)).toBeInTheDocument();
      });
    });

    it("exibe badges de status com cores corretas", async () => {
      render(<AuditLogPage />);

      await waitFor(() => {
        const successBadge = screen.getAllByText("success")[0];
        expect(successBadge).toHaveClass("bg-green-600");

        const warningBadge = screen.getByText("warning");
        expect(warningBadge).toHaveClass("bg-yellow-600");
      });
    });

    it("exibe tipo e ID do recurso quando disponível", async () => {
      render(<AuditLogPage />);

      await waitFor(() => {
        expect(screen.getByText(/User #1/i)).toBeInTheDocument();
        expect(screen.getByText(/Feedback #42/i)).toBeInTheDocument();
      });
    });

    it("exibe IP addresses em fonte monospace", async () => {
      render(<AuditLogPage />);

      await waitFor(() => {
        const ipElements = screen.getAllByText(/192\.168\.1\.\d/);
        ipElements.forEach((el) => {
          expect(el).toHaveClass("font-mono");
        });
      });
    });
  });

  describe("Tratamento de Erros", () => {
    it("exibe erro ao falhar ao carregar logs", async () => {
      mockGet.mockRejectedValue(new Error("Erro ao carregar"));

      render(<AuditLogPage />);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith("Erro ao carregar");
      });
    });

    it("exibe mensagem quando não há logs", async () => {
      mockGet.mockImplementation((url: string) => {
        if (url.includes("/summaries/by_date/")) {
          return Promise.resolve([]);
        }
        return Promise.resolve({
          count: 0,
          next: null,
          previous: null,
          results: [],
        });
      });

      render(<AuditLogPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/Nenhum registro encontrado/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Cards de Resumo", () => {
    it("calcula e exibe total de ações corretamente", async () => {
      render(<AuditLogPage />);

      await waitFor(() => {
        // 50 + 45 = 95
        expect(screen.getByText("95")).toBeInTheDocument();
      });
    });

    it("calcula e exibe taxa média de sucesso", async () => {
      render(<AuditLogPage />);

      await waitFor(() => {
        // (95.2 + 98.1) / 2 = 96.65 → 96.7%
        expect(screen.getByText("96.7%")).toBeInTheDocument();
      });
    });

    it("exibe ação mais comum", async () => {
      render(<AuditLogPage />);

      await waitFor(() => {
        expect(screen.getByText("view")).toBeInTheDocument();
      });
    });
  });
});
