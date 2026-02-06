"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useParams, useRouter } from "next/navigation";
import { useFeedbackDetails } from "@/hooks/use-feedback-details";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FlexBetween } from "@/components/ui";
import { useState, useRef } from "react";
import {
  Paperclip,
  Lock,
  Send,
  File,
  Image as ImageIcon,
  Download,
  X,
  AlertCircle,
  Loader2,
  Edit,
  Trash2,
} from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { deleteFeedback } from "@/hooks/use-dashboard";
import { AssignFeedback } from "@/components/feedback/AssignFeedback";

function StatusBadge({ status }: { status: string }) {
  const variants: Record<
    string,
    {
      variant: "outline" | "secondary" | "success" | "warning" | "default";
      label: string;
    }
  > = {
    pendente: {
      variant: "warning",
      label: "Pendente",
    },
    em_analise: {
      variant: "default",
      label: "Em Análise",
    },
    resolvido: {
      variant: "success",
      label: "Resolvido",
    },
    fechado: {
      variant: "outline",
      label: "Fechado",
    },
  };
  const variantConfig = variants[status] || variants.pendente;
  return <Badge variant={variantConfig.variant}>{variantConfig.label}</Badge>;
}

export default function FeedbackTicketPage() {
  return (
    <DashboardLayout>
      <FeedbackTicketContent />
    </DashboardLayout>
  );
}

function FeedbackTicketContent() {
  const params = useParams<{ protocolo: string }>();
  const router = useRouter();
  const protocolo = params?.protocolo;
  const { data, isLoading, error, enviarMensagem, atualizarStatus } =
    useFeedbackDetails(String(protocolo));

  // Estados para mensagens
  const [tab, setTab] = useState<"PUBLICA" | "INTERNA">("PUBLICA");
  const [mensagem, setMensagem] = useState("");
  const [alterandoStatus, setAlterandoStatus] = useState<string | null>(null);
  const [enviandoMensagem, setEnviandoMensagem] = useState(false);

  // Estados para anexos
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para notas internas
  const [isInternalNote, setIsInternalNote] = useState(false);

  // Estado para exclusão
  const [isDeleting, setIsDeleting] = useState(false);

  // Handler para exclusão
  const handleDelete = async () => {
    if (!data) return;

    const confirmText = `Tem certeza que deseja excluir o feedback #${data.protocolo}?\n\nEsta ação não pode ser desfeita.`;

    if (!confirm(confirmText)) return;

    setIsDeleting(true);

    try {
      await deleteFeedback(data.id);
      toast.success("Feedback excluído com sucesso");
      router.push("/dashboard/feedbacks");
    } catch (error) {
      console.error("Erro ao excluir feedback:", error);
      toast.error("Erro ao excluir feedback. Tente novamente.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="p-6 space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-80" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="p-6">
        <Card className="p-6">
          <p className="text-error-600">Erro ao carregar ticket.</p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => router.back()}
          >
            Voltar
          </Button>
        </Card>
      </main>
    );
  }

  const enviar = async () => {
    const tipo = isInternalNote
      ? "NOTA_INTERNA"
      : tab === "PUBLICA"
        ? "MENSAGEM_PUBLICA"
        : "PERGUNTA_EMPRESA";
    if (!mensagem.trim() || enviandoMensagem) return;

    setEnviandoMensagem(true);
    try {
      await enviarMensagem(mensagem.trim(), tipo as any);
      setMensagem("");
      setIsInternalNote(false);
      toast.success("Mensagem enviada com sucesso!");
    } catch (err) {
      const errorMsg = getErrorMessage(err);

      // Detectar erro de feature bloqueada (403)
      if (
        errorMsg.includes("feature_not_available") ||
        errorMsg.includes("não permite")
      ) {
        toast.error(
          <div className="flex flex-col gap-2">
            <p className="font-semibold">⚠️ Recurso Indisponível</p>
            <p className="text-sm">
              Notas internas são exclusivas do plano Starter ou superior.
            </p>
            <Link href="/precos" className="text-primary underline text-sm">
              Ver planos disponíveis →
            </Link>
          </div>,
          { duration: 5000 },
        );
      } else {
        toast.error(`Erro ao enviar: ${errorMsg}`);
      }
    } finally {
      setEnviandoMensagem(false);
    }
  };

  const onChangeStatus = async (novo: string) => {
    if (alterandoStatus) return;
    setAlterandoStatus(novo);
    try {
      await atualizarStatus(novo as any);
      toast.success("Status atualizado com sucesso!");
    } catch (err) {
      toast.error(`Erro ao atualizar status: ${getErrorMessage(err)}`);
    } finally {
      setAlterandoStatus(null);
    }
  };

  // Handler para seleção de arquivo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Arquivo muito grande. Máximo: 10MB");
      return;
    }

    // Validar tipo
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Tipo de arquivo não permitido. Use imagens, PDF ou documentos Office.",
      );
      return;
    }

    setSelectedFile(file);
  };

  // Handler para upload de arquivo
  const handleUploadFile = async () => {
    if (!selectedFile || !data) return;

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("arquivo", selectedFile);
      formData.append("interno", isInternalNote.toString());

      const response = await api.post(
        `/api/feedbacks/${data.id}/upload-arquivo/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      toast.success("Arquivo anexado com sucesso!");
      setSelectedFile(null);

      // Resetar input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Recarregar dados
      window.location.reload();
    } catch (err: any) {
      const errorMsg = getErrorMessage(err);

      // Detectar erro de plano (403)
      if (
        err.response?.status === 403 ||
        errorMsg.includes("feature_not_available")
      ) {
        toast.error(
          <div className="flex flex-col gap-2">
            <p className="font-semibold">🚀 Upgrade Necessário</p>
            <p className="text-sm">
              Envio de anexos é exclusivo do plano Pro ou superior.
            </p>
            <Link href="/precos" className="text-primary underline text-sm">
              Ver planos disponíveis →
            </Link>
          </div>,
          { duration: 6000 },
        );
      } else {
        toast.error(`Erro ao enviar arquivo: ${errorMsg}`);
      }
    } finally {
      setUploadingFile(false);
    }
  };

  // Renderizar arquivo na timeline
  const renderArquivo = (arquivo: any) => {
    const isImage = arquivo.tipo_mime?.startsWith("image/");

    return (
      <div className="mt-2 p-3 bg-background-secondary rounded-lg border border-border-light">
        <div className="flex items-center gap-3">
          {isImage ? (
            <div className="relative w-16 h-16 rounded overflow-hidden bg-background-tertiary">
              <img
                src={arquivo.url}
                alt={arquivo.nome_original}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center">
              <File className="w-6 h-6 text-primary" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              {arquivo.nome_original}
            </p>
            <p className="text-xs text-text-tertiary">
              {arquivo.tamanho_mb} MB •{" "}
              {arquivo.tipo_mime?.split("/")[1]?.toUpperCase()}
            </p>
          </div>

          <a
            href={arquivo.url}
            download={arquivo.nome_original}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-background-tertiary rounded-lg transition-colors"
          >
            <Download className="w-4 h-4 text-text-secondary" />
          </a>
        </div>

        {arquivo.interno && (
          <div className="mt-2 flex items-center gap-1 text-xs text-warning-700">
            <Lock className="w-3 h-3" />
            <span>Arquivo interno (não visível ao denunciante)</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Header */}
      <FlexBetween>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => router.back()}>
            ← Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{data.titulo}</h1>
            <p className="text-sm text-text-secondary mt-1">
              Protocolo: {data.protocolo} | Criado em{" "}
              {new Date(data.data_criacao).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={data.status} />

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              router.push(`/dashboard/feedbacks/${data.protocolo}/edit`)
            }
            aria-label="Editar feedback"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label="Excluir feedback"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </>
            )}
          </Button>
        </div>
      </FlexBetween>

      {/* Alterar Status */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-text-secondary">
          Alterar Status:
        </label>
        <select
          className="border border-border-light rounded px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-border-focus"
          value={alterandoStatus ?? data.status}
          onChange={(e) => onChangeStatus(e.target.value)}
          disabled={!!alterandoStatus}
        >
          <option value="pendente">Pendente</option>
          <option value="em_analise">Em Analise</option>
          <option value="resolvido">Resolvido</option>
          <option value="fechado">Fechado</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Coluna principal */}
        <div className="col-span-2 space-y-6">
          {/* Card do relato */}
          <Card className="p-6">
            <h2 className="text-lg font-medium mb-2">Relato</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {data.descricao}
            </p>

            {/* Arquivos do feedback original */}
            {data.arquivos && data.arquivos.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-text-secondary mb-2">
                  Anexos:
                </p>
                <div className="space-y-2">
                  {data.arquivos.map((arquivo: any) => (
                    <div key={arquivo.id}>{renderArquivo(arquivo)}</div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Timeline/Chat */}
          <Card className="p-6">
            <h2 className="text-lg font-medium mb-4">Histórico</h2>
            <div className="space-y-4">
              {data.interacoes.map((i) => {
                if (i.tipo === "MUDANCA_STATUS") {
                  return (
                    <div key={i.id} className="flex items-center gap-2">
                      <Separator className="flex-1" />
                      <span className="text-xs text-muted-foreground">
                        {i.autor_nome} • {i.mensagem}
                      </span>
                      <Separator className="flex-1" />
                    </div>
                  );
                }

                const isInterna = i.tipo === "NOTA_INTERNA";

                return (
                  <div
                    key={i.id}
                    className={`max-w-xl rounded-lg p-4 text-sm shadow-sm border ${
                      isInterna
                        ? "bg-warning-50 border-warning-200"
                        : "bg-primary-50 border-primary-200"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {isInterna && (
                          <Lock className="w-4 h-4 text-warning-600" />
                        )}
                        <span className="font-medium text-text-primary">
                          {isInterna ? "Nota Interna (Privada)" : i.autor_nome}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {i.data_formatada}
                      </span>
                    </div>
                    <p className="text-foreground whitespace-pre-line">
                      {i.mensagem}
                    </p>

                    {isInterna && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-warning-700">
                        <AlertCircle className="w-3 h-3" />
                        <span>Visível apenas para a equipe interna</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Área de resposta */}
          <Card className="p-6 space-y-4">
            {/* Tabs Pública/Interna */}
            <div className="flex gap-4">
              <Button
                variant={tab === "PUBLICA" ? "default" : "secondary"}
                onClick={() => {
                  setTab("PUBLICA");
                  setIsInternalNote(false);
                }}
                className="flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Responder ao Usuário
              </Button>
              <Button
                variant={tab === "INTERNA" ? "default" : "secondary"}
                onClick={() => {
                  setTab("INTERNA");
                  setIsInternalNote(true);
                }}
                className="flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Nota Interna
              </Button>
            </div>

            {/* Toggle de Nota Interna */}
            {tab === "INTERNA" && (
              <Alert className="bg-warning-50 border-warning-200">
                <Lock className="w-4 h-4 text-warning-600" />
                <AlertDescription className="text-sm text-warning-800">
                  <strong>Nota Interna:</strong> Esta mensagem será visível
                  apenas para a equipe interna. O denunciante não verá este
                  comentário.
                </AlertDescription>
              </Alert>
            )}

            {/* Preview do arquivo selecionado */}
            {selectedFile && (
              <div className="flex items-center gap-3 p-3 bg-background-secondary rounded-lg border border-border-light">
                {selectedFile.type.startsWith("image/") ? (
                  <ImageIcon className="w-8 h-8 text-text-tertiary" />
                ) : (
                  <File className="w-8 h-8 text-text-tertiary" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                  className="text-error-600 hover:text-error-700 hover:bg-error-50"
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleUploadFile}
                  disabled={uploadingFile}
                >
                  {uploadingFile ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-1" />
                      Enviar
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Campo de texto */}
            <div className="relative">
              <textarea
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                rows={4}
                className={`w-full border rounded-lg p-3 pr-12 resize-none focus:ring-2 focus:ring-border-focus focus:border-transparent transition-all ${
                  isInternalNote
                    ? "border-warning-300 bg-warning-50/50"
                    : "border-border-light bg-background"
                }`}
                placeholder={
                  isInternalNote
                    ? "Escreva uma nota interna (visível apenas à equipe)..."
                    : tab === "PUBLICA"
                      ? "Escreva uma resposta pública ao usuário..."
                      : "Escreva uma mensagem..."
                }
              />

              {/* Botão de anexo */}
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-3 right-3 text-text-tertiary hover:text-primary"
                title="Anexar arquivo"
              >
                <Paperclip className="w-5 h-5" />
              </Button>
            </div>

            {/* Botão de envio */}
            <div className="flex justify-end">
              <Button
                onClick={enviar}
                disabled={!mensagem.trim() || enviandoMensagem}
                className={
                  isInternalNote ? "bg-warning-600 hover:bg-warning-700" : ""
                }
              >
                {enviandoMensagem ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    {isInternalNote ? (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Salvar Nota Interna
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Mensagem
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 space-y-3">
            <h3 className="text-lg font-medium">Detalhes</h3>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Protocolo:</span>
                <code className="font-mono text-xs bg-background-tertiary px-2 py-1 rounded">
                  {data.protocolo}
                </code>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo:</span>
                <span className="font-medium">{data.tipo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Aberto em:</span>
                <span>
                  {new Date(data.data_criacao).toLocaleDateString("pt-BR")}
                </span>
              </div>
              {data.anonimo && (
                <div className="pt-2 border-t">
                  <Badge variant="outline" className="bg-background-secondary">
                    <Lock className="w-3 h-3 mr-1" />
                    Anônimo
                  </Badge>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6 space-y-3">
            <h3 className="text-lg font-medium">Ações</h3>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => onChangeStatus("fechado")}
            >
              Arquivar
            </Button>
          </Card>
        </div>
      </div>
    </main>
  );
}
