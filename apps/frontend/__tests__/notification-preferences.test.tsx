/**
 * Testes da página de Preferências de Notificação
 * Cobertura: Renderização, toggle de preferências, salvar/cancelar
 */
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NotificationPreferencesPage from "@/app/dashboard/configuracoes/notificacoes/page";

// Mock do API client
const mockGet = jest.fn();
const mockPatch = jest.fn();

jest.mock("@/lib/api", () => ({
  api: {
    get: (...args: any[]) => mockGet(...args),
    patch: (...args: any[]) => mockPatch(...args),
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

describe("Notification Preferences Page", () => {
  const mockPreferences = {
    email_new_feedback: true,
    email_feedback_response: true,
    email_status_change: false,
    push_assigned_feedback: true,
    push_comment: true,
    push_status_change: true,
    push_mention: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue(mockPreferences);
    mockPatch.mockResolvedValue({ ...mockPreferences });
  });

  describe("Renderização Inicial", () => {
    it("renderiza o título e descrição da página", async () => {
      render(<NotificationPreferencesPage />);

      expect(
        screen.getByText(/Preferências de Notificação/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Configure como deseja ser notificado/i),
      ).toBeInTheDocument();
    });

    it("exibe loading state enquanto carrega preferências", async () => {
      mockGet.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<NotificationPreferencesPage />);

      expect(screen.getByTestId("loader")).toBeInTheDocument();
    });

    it("carrega e exibe preferências do usuário", async () => {
      render(<NotificationPreferencesPage />);

      await waitFor(() => {
        expect(mockGet).toHaveBeenCalledWith("/api/push/preferences/me/");
      });

      // Verificar que switches estão no estado correto
      await waitFor(() => {
        const switches = screen.getAllByRole("switch");
        expect(switches.length).toBe(7); // 3 email + 4 push
      });
    });
  });

  describe("Interações do Usuário", () => {
    it("permite alternar preferência de email", async () => {
      const user = userEvent.setup();
      render(<NotificationPreferencesPage />);

      await waitFor(() => {
        expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
      });

      // Encontrar switch de "Novo feedback recebido"
      const emailSwitch = screen.getByLabelText(/Novo feedback recebido/i);

      await user.click(emailSwitch);

      // Verificar que botão de salvar ficou habilitado
      const saveButton = screen.getByText(/Salvar Alterações/i);
      expect(saveButton).not.toBeDisabled();
    });

    it("permite alternar preferência de push", async () => {
      const user = userEvent.setup();
      render(<NotificationPreferencesPage />);

      await waitFor(() => {
        expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
      });

      const pushSwitch = screen.getByLabelText(/Menção em comentário/i);

      await user.click(pushSwitch);

      const saveButton = screen.getByText(/Salvar Alterações/i);
      expect(saveButton).not.toBeDisabled();
    });

    it("desabilita botões quando não há mudanças", async () => {
      render(<NotificationPreferencesPage />);

      await waitFor(() => {
        expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
      });

      const saveButton = screen.getByText(/Salvar Alterações/i);
      const cancelButton = screen.getByText(/Cancelar/i);

      expect(saveButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });
  });

  describe("Salvar Preferências", () => {
    it("salva preferências com sucesso", async () => {
      const user = userEvent.setup();
      render(<NotificationPreferencesPage />);

      await waitFor(() => {
        expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
      });

      // Alterar preferência
      const emailSwitch = screen.getByLabelText(/Novo feedback recebido/i);
      await user.click(emailSwitch);

      // Salvar
      const saveButton = screen.getByText(/Salvar Alterações/i);
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockPatch).toHaveBeenCalledWith(
          "/api/push/preferences/me/",
          expect.objectContaining({
            email_new_feedback: false, // Toggle de true para false
          }),
        );
      });

      expect(mockToast.success).toHaveBeenCalledWith(
        "Preferências salvas com sucesso",
      );
    });

    it("exibe erro ao falhar ao salvar", async () => {
      const user = userEvent.setup();
      mockPatch.mockRejectedValue(new Error("Erro ao salvar"));

      render(<NotificationPreferencesPage />);

      await waitFor(() => {
        expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
      });

      const emailSwitch = screen.getByLabelText(/Novo feedback recebido/i);
      await user.click(emailSwitch);

      const saveButton = screen.getByText(/Salvar Alterações/i);
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith("Erro ao salvar");
      });
    });
  });

  describe("Cancelar Mudanças", () => {
    it("reverte mudanças ao cancelar", async () => {
      const user = userEvent.setup();
      render(<NotificationPreferencesPage />);

      await waitFor(() => {
        expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
      });

      // Alterar preferência
      const emailSwitch = screen.getByLabelText(/Novo feedback recebido/i);
      await user.click(emailSwitch);

      // Cancelar
      const cancelButton = screen.getByText(/Cancelar/i);
      await user.click(cancelButton);

      // Verificar que botões ficaram desabilitados (voltou ao estado original)
      const saveButton = screen.getByText(/Salvar Alterações/i);
      expect(saveButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });
  });

  describe("Tratamento de Erros", () => {
    it("exibe erro ao falhar ao carregar preferências", async () => {
      mockGet.mockRejectedValue(new Error("Erro ao carregar"));

      render(<NotificationPreferencesPage />);

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith("Erro ao carregar");
      });
    });
  });

  describe("Acessibilidade", () => {
    it("labels estão associados aos switches", async () => {
      render(<NotificationPreferencesPage />);

      await waitFor(() => {
        expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
      });

      // Verificar que todos os labels podem ser encontrados
      expect(
        screen.getByLabelText(/Novo feedback recebido/i),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/Resposta a um feedback/i),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/Mudança de status do feedback/i),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/Novo feedback atribuído/i),
      ).toBeInTheDocument();
    });
  });
});
