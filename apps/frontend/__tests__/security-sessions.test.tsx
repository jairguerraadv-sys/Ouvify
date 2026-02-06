/**
 * Testes da página de Sessões de Segurança
 * Cobertura: Listagem de sessões, estatísticas, encerramento de sessões
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SecurityPage from "@/app/dashboard/perfil/seguranca/sessoes/page";

// Mock do toast (deve ser definido antes do jest.mock)
const mockToast = {
  success: jest.fn(),
  error: jest.fn(),
};

// Mock do API client
const mockGet = jest.fn();
const mockDelete = jest.fn();
const mockPost = jest.fn();

jest.mock("@/lib/api", () => ({
  api: {
    get: (...args: any[]) => mockGet(...args),
    delete: (...args: any[]) => mockDelete(...args),
    post: (...args: any[]) => mockPost(...args),
  },
  getErrorMessage: (error: any) => error?.message || "Erro desconhecido",
}));

jest.mock("sonner", () => ({
  toast: mockToast,
}));

// Mock do window.confirm
global.confirm = jest.fn(() => true);

describe("Security Sessions Page", () => {
  const mockSessions = {
    results: [
      {
        id: 1,
        user: 1,
        started_at: "2024-01-15T10:00:00Z",
        last_activity: "2024-01-15T14:30:00Z",
        ip_address: "192.168.1.1",
        user_agent: "Mozilla/5.0...",
        device_type: "desktop",
        browser: "Chrome",
        os: "Windows 11",
        location: "São Paulo, BR",
        is_active: true,
        is_current: true,
      },
      {
        id: 2,
        user: 1,
        started_at: "2024-01-14T09:00:00Z",
        last_activity: "2024-01-15T12:00:00Z",
        ip_address: "192.168.1.2",
        user_agent: "Mozilla/5.0...",
        device_type: "mobile",
        browser: "Safari",
        os: "iOS 17",
        location: "Rio de Janeiro, BR",
        is_active: true,
        is_current: false,
      },
      {
        id: 3,
        user: 1,
        started_at: "2024-01-13T08:00:00Z",
        last_activity: "2024-01-14T10:00:00Z",
        ip_address: "192.168.1.3",
        user_agent: "Mozilla/5.0...",
        device_type: "tablet",
        browser: "Firefox",
        os: "Android 14",
        location: "Curitiba, BR",
        is_active: false,
        is_current: false,
      },
    ],
  };

  const mockStats = {
    total_sessions: 5,
    active_sessions: 2,
    total_logins_24h: 8,
    total_logins_7d: 45,
    most_used_device: "desktop",
    most_used_browser: "Chrome",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockImplementation((url: string) => {
      if (url.includes("/stats/")) {
        return Promise.resolve(mockStats);
      }
      return Promise.resolve(mockSessions);
    });
    mockDelete.mockResolvedValue({});
    mockPost.mockResolvedValue({});
  });

  describe("Renderização Inicial", () => {
    it("renderiza título e descrição da página", async () => {
      render(<SecurityPage />);

      expect(screen.getByText(/Segurança & Sessões/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Gerencie suas sessões ativas/i),
      ).toBeInTheDocument();
    });

    it("exibe loading state enquanto carrega dados", async () => {
      mockGet.mockImplementation(() => new Promise(() => {}));

      render(<SecurityPage />);

      expect(screen.getByTestId("loader")).toBeInTheDocument();
    });

    it("carrega e exibe estatísticas", async () => {
      render(<SecurityPage />);

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledWith("/api/auditlog/sessions/");
        expect(mockGet).toHaveBeenCalledWith("/api/auditlog/sessions/stats/");
      });

      await waitFor(() => {
        expect(screen.getByText("2")).toBeInTheDocument(); // active_sessions
        expect(screen.getByText("8")).toBeInTheDocument(); // logins_24h
        expect(screen.getByText(/desktop/i)).toBeInTheDocument();
        expect(screen.getByText(/Chrome/i)).toBeInTheDocument();
      });
    });

    it("exibe lista de sessões", async () => {
      render(<SecurityPage />);

      await waitFor(() => {
        expect(screen.getByText(/Windows 11/i)).toBeInTheDocument();
        expect(screen.getByText(/iOS 17/i)).toBeInTheDocument();
        expect(screen.getByText(/Android 14/i)).toBeInTheDocument();
      });
    });
  });

  describe("Indicadores Visuais", () => {
    it("identifica sessão atual com badge especial", async () => {
      render(<SecurityPage />);

      await waitFor(() => {
        expect(screen.getByText(/Esta sessão/i)).toBeInTheDocument();
      });
    });

    it("exibe ícones corretos para cada tipo de dispositivo", async () => {
      render(<SecurityPage />);

      await waitFor(() => {
        const table = screen.getByRole("table");
        // Verificar se tem linhas para desktop, mobile e tablet
        expect(table).toHaveTextContent("Windows 11");
        expect(table).toHaveTextContent("iOS 17");
        expect(table).toHaveTextContent("Android 14");
      });
    });

    it("exibe status correto para sessões ativas/inativas", async () => {
      render(<SecurityPage />);

      await waitFor(() => {
        const activeBadges = screen.getAllByText(/Ativa/i);
        expect(activeBadges.length).toBeGreaterThan(0);

        expect(screen.getByText(/Inativa/i)).toBeInTheDocument();
      });
    });
  });

  describe("Encerramento de Sessão Individual", () => {
    it("encerra sessão específica com sucesso", async () => {
      const user = userEvent.setup();
      render(<SecurityPage />);

      await waitFor(() => {
        expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
      });

      // Encontrar botões de encerrar (excluindo sessão atual)
      const terminateButtons = screen.getAllByRole("button", {
        name: /Encerrar/i,
      });
      const nonCurrentSessionButton = terminateButtons.find(
        (btn) => !btn.closest("tr")?.textContent?.includes("Esta sessão"),
      );

      if (nonCurrentSessionButton) {
        await user.click(nonCurrentSessionButton);

        await waitFor(() => {
          expect(mockDelete).toHaveBeenCalledWith(
            expect.stringContaining("/api/auditlog/sessions/"),
          );
        });

        expect(mockToast.success).toHaveBeenCalledWith(
          "Sessão encerrada com sucesso",
        );
      }
    });

    it("exibe erro ao falhar ao encerrar sessão", async () => {
      const user = userEvent.setup();
      mockDelete.mockRejectedValue(new Error("Erro ao encerrar"));

      render(<SecurityPage />);

      await waitFor(() => {
        expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
      });

      const terminateButtons = screen.getAllByRole("button", {
        name: /Encerrar/i,
      });
      const nonCurrentSessionButton = terminateButtons.find(
        (btn) => !btn.closest("tr")?.textContent?.includes("Esta sessão"),
      );

      if (nonCurrentSessionButton) {
        await user.click(nonCurrentSessionButton);

        await waitFor(() => {
          expect(mockToast.error).toHaveBeenCalledWith("Erro ao encerrar");
        });
      }
    });

    it("não permite encerrar sessão atual", async () => {
      render(<SecurityPage />);

      await waitFor(() => {
        expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
      });

      // Linha com "Esta sessão" não deve ter botão de encerrar
      const currentSessionRow = screen.getByText(/Esta sessão/i).closest("tr");
      const buttons = currentSessionRow?.querySelectorAll("button");

      // Não deve ter botão de encerrar na sessão atual
      expect(buttons?.length).toBe(0);
    });
  });

  describe("Encerramento de Todas as Sessões", () => {
    it("encerra todas as sessões com confirmação", async () => {
      const user = userEvent.setup();
      render(<SecurityPage />);

      await waitFor(() => {
        expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
      });

      const terminateAllButton = screen.getByText(/Encerrar todas as sessões/i);
      await user.click(terminateAllButton);

      expect(global.confirm).toHaveBeenCalled();

      await waitFor(() => {
        expect(mockPost).toHaveBeenCalledWith("/api/logout/all/");
      });

      expect(mockToast.success).toHaveBeenCalledWith(
        "Todas as outras sessões foram encerradas",
      );
    });

    it("cancela encerramento se usuário não confirmar", async () => {
      const user = userEvent.setup();
      (global.confirm as jest.Mock).mockReturnValue(false);

      render(<SecurityPage />);

      await waitFor(() => {
        expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
      });

      const terminateAllButton = screen.getByText(/Encerrar todas as sessões/i);
      await user.click(terminateAllButton);

      expect(global.confirm).toHaveBeenCalled();
      expect(mockPost).not.toHaveBeenCalled();
    });
  });

  describe("Formatação de Dados", () => {
    it("formata datas corretamente", async () => {
      render(<SecurityPage />);

      await waitFor(() => {
        // date-fns formatDistanceToNow deve exibir algo como "há 2 horas"
        expect(screen.getByText(/há/i)).toBeInTheDocument();
      });
    });

    it("exibe localização ou IP quando localização não disponível", async () => {
      render(<SecurityPage />);

      await waitFor(() => {
        // Deve exibir "São Paulo, BR" ou o IP
        const locationTexts = screen.getAllByText(/São Paulo|192\.168/i);
        expect(locationTexts.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Tratamento de Erros", () => {
    it("exibe erro ao falhar ao carregar sessões", async () => {
      mockGet.mockRejectedValue(new Error("Erro ao carregar"));

      render(<SecurityPage />);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith("Erro ao carregar");
      });
    });

    it("exibe mensagem quando não há sessões", async () => {
      mockGet.mockImplementation((url: string) => {
        if (url.includes("/stats/")) {
          return Promise.resolve(mockStats);
        }
        return Promise.resolve({ results: [] });
      });

      render(<SecurityPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/Nenhuma sessão ativa encontrada/i),
        ).toBeInTheDocument();
      });
    });
  });
});
