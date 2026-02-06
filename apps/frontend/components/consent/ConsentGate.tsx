"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiClient } from "@/lib/api";
import { Shield, FileText, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface ConsentVersion {
  id: number;
  document_type: string;
  version: string;
  content_url: string;
  is_required: boolean;
  effective_date: string;
  created_at: string;
}

interface PendingResponse {
  has_pending: boolean;
  pending_consents: ConsentVersion[];
}

interface ConsentGateProps {
  children: React.ReactNode;
}

const DOCUMENT_TYPE_LABELS: Record<string, { label: string; icon: typeof FileText }> = {
  terms: { label: "Termos de Uso", icon: FileText },
  privacy: { label: "Política de Privacidade", icon: Shield },
  lgpd: { label: "Consentimento LGPD", icon: Lock },
  marketing: { label: "Consentimento de Marketing", icon: FileText },
};

export default function ConsentGate({ children }: ConsentGateProps) {
  const [loading, setLoading] = useState(true);
  const [hasPending, setHasPending] = useState(false);
  const [pendingConsents, setPendingConsents] = useState<ConsentVersion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasReadAll, setHasReadAll] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentText, setContentText] = useState<string>("");

  useEffect(() => {
    checkPendingConsents();
  }, []);

  useEffect(() => {
    // Quando mudar o índice, carregar o conteúdo do termo
    if (pendingConsents[currentIndex]) {
      loadConsentContent(pendingConsents[currentIndex].content_url);
    }
  }, [currentIndex, pendingConsents]);

  const checkPendingConsents = async () => {
    try {
      const response = await apiClient.get<PendingResponse>("/api/consent/user-consents/pending/");
      
      setHasPending(response.data.has_pending);
      setPendingConsents(response.data.pending_consents);
    } catch (error) {
      console.error("Erro ao verificar consentimentos pendentes:", error);
      // Se houver erro, liberar acesso (fail-open)
      setHasPending(false);
    } finally {
      setLoading(false);
    }
  };

  const loadConsentContent = async (contentUrl: string) => {
    setContentLoading(true);
    setContentText("");

    try {
      // content_url deve ser sempre uma URL válida (relativa ou absoluta)
      // Ex: /static/consent/terms-v1.0.html ou https://example.com/terms.html
      const response = await fetch(contentUrl);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      setContentText(text);
    } catch (error) {
      console.error("Erro ao carregar conteúdo do termo:", error);

      // Se falhar, ainda permitir visualizar a URL do documento
      setContentText("");

      toast.error("Não foi possível carregar o documento automaticamente. Use o link abaixo.");
    } finally {
      setContentLoading(false);
    }
  };

  const handleAcceptAll = async () => {
    setAccepting(true);
    
    try {
      // Preparar dados para aceitar todos os consentimentos pendentes
      const consentsToAccept = pendingConsents.map((consent) => ({
        document_type: consent.document_type,
        version: consent.version,
      }));

      await apiClient.post("/api/consent/user-consents/accept/", {
        consents: consentsToAccept,
      });

      toast.success("✅ Termos aceitos com sucesso!");
      
      // Liberar acesso
      setHasPending(false);
    } catch (error: any) {
      const message = error.response?.data?.error || "Erro ao aceitar termos";
      toast.error(message);
    } finally {
      setAccepting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < pendingConsents.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setHasReadAll(false);
    } else {
      setHasReadAll(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleScrollEnd = () => {
    // Marcar como lido quando rolar até o fim
    setHasReadAll(true);
  };

  // Mostrar loading enquanto verifica
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground text-sm">Verificando atualizações...</p>
        </div>
      </div>
    );
  }

  // Se não há pendências, renderizar children normalmente
  if (!hasPending) {
    return <>{children}</>;
  }

  const currentConsent = pendingConsents[currentIndex];
  const typeInfo = DOCUMENT_TYPE_LABELS[currentConsent?.document_type] || DOCUMENT_TYPE_LABELS.terms;
  const Icon = typeInfo.icon;

  return (
    <>
      {/* Modal Bloqueante */}
      <Dialog open={true}>
        <DialogContent 
          className="max-w-3xl max-h-[90vh] flex flex-col"
          onPointerDownOutside={(e) => e.preventDefault()} // Impede fechar ao clicar fora
          onEscapeKeyDown={(e) => e.preventDefault()} // Impede fechar com ESC
        >
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-xl">
                  {typeInfo.label} 
                  <Badge variant="outline" className="ml-2 text-xs">v{currentConsent?.version}</Badge>
                </DialogTitle>
                <DialogDescription>
                  {pendingConsents.length > 1 && (
                    <span className="text-xs">
                      Documento {currentIndex + 1} de {pendingConsents.length}
                    </span>
                  )}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Alert de Aviso */}
          <Alert className="border-warning/50 bg-warning/10">
            <AlertCircle className="h-4 w-4 text-warning" />
            <AlertDescription className="text-sm">
              <strong>Atenção:</strong> Houve atualizações nos nossos termos. 
              Por favor, leia e aceite para continuar usando o sistema.
            </AlertDescription>
          </Alert>

          {/* Conteúdo do Termo */}
          <ScrollArea 
            className="flex-1 border rounded-lg p-4 bg-muted/30"
            onScroll={(e: React.UIEvent<HTMLDivElement>) => {
              const target = e.target as HTMLDivElement;
              const isAtBottom = target.scrollHeight - target.scrollTop === target.clientHeight;
              if (isAtBottom) {
                handleScrollEnd();
              }
            }}
          >
            {contentLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {contentText ? (
                  <div dangerouslySetInnerHTML={{ __html: contentText }} />
                ) : (
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      Para ler o documento completo, acesse:
                    </p>
                    <a 
                      href={currentConsent?.content_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium"
                    >
                      {currentConsent?.content_url}
                    </a>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Status de Leitura */}
          {!hasReadAll && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Role até o final do documento para habilitar o botão de aceite
              </AlertDescription>
            </Alert>
          )}

          {/* Navegação entre documentos */}
          {pendingConsents.length > 1 && (
            <div className="flex justify-between items-center py-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                ← Anterior
              </Button>
              
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} / {pendingConsents.length}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={currentIndex === pendingConsents.length - 1 || !hasReadAll}
              >
                Próximo →
              </Button>
            </div>
          )}

          {/* Botão de Aceite */}
          <div className="flex flex-col gap-3 pt-4 border-t">
            {/* Checkbox de Confirmação */}
            <div className="flex items-start gap-2">
              <Checkbox 
                id="confirm-read" 
                checked={hasReadAll}
                onCheckedChange={(checked) => setHasReadAll(!!checked)}
                disabled={!hasReadAll && contentLoading}
              />
              <label 
                htmlFor="confirm-read" 
                className="text-sm font-medium leading-tight cursor-pointer"
              >
                Declaro que li e compreendi {pendingConsents.length > 1 ? "todos os documentos" : "o documento"} acima
              </label>
            </div>

            {/* Botão Principal */}
            <Button
              size="lg"
              className="w-full"
              onClick={handleAcceptAll}
              disabled={!hasReadAll || accepting}
              isLoading={accepting}
            >
              {!accepting && (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  {pendingConsents.length > 1 
                    ? "Li e Aceito Todos os Termos" 
                    : "Li e Aceito os Termos"
                  }
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Ao aceitar, você concorda com os termos apresentados. 
              Você pode revogar seu consentimento a qualquer momento nas configurações.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Backdrop (fundo escuro) */}
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40" />
    </>
  );
}
