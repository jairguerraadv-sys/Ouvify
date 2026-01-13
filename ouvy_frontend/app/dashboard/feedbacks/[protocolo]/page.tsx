"use client";

import { useParams, useRouter } from "next/navigation";
import { useFeedbackDetails } from "@/hooks/use-feedback-details";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useState } from "react";

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "pendente"
      ? "bg-yellow-500"
      : status === "em_analise"
      ? "bg-primary"
      : status === "resolvido"
      ? "bg-green-600"
      : "bg-gray-500";
  return <Badge className={`${color} text-white text-sm px-3 py-1`}>{status}</Badge>;
}

export default function FeedbackTicketPage() {
  const params = useParams<{ protocolo: string }>();
  const router = useRouter();
  const protocolo = params?.protocolo;
  const { data, isLoading, error, enviarMensagem, atualizarStatus } = useFeedbackDetails(
    String(protocolo)
  );
  const [tab, setTab] = useState<"PUBLICA" | "INTERNA">("PUBLICA");
  const [mensagem, setMensagem] = useState("");
  const [alterandoStatus, setAlterandoStatus] = useState<string | null>(null);

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
          <p className="text-red-600">Erro ao carregar ticket.</p>
          <Button variant="secondary" className="mt-4" onClick={() => router.back()}>
            Voltar
          </Button>
        </Card>
      </main>
    );
  }

  const enviar = async () => {
    const tipo = tab === "PUBLICA" ? "MENSAGEM_PUBLICA" : "NOTA_INTERNA";
    if (!mensagem.trim()) return;
    await enviarMensagem(mensagem.trim(), tipo as any);
    setMensagem("");
  };

  const onChangeStatus = async (novo: string) => {
    setAlterandoStatus(novo);
    await atualizarStatus(novo as any);
    setAlterandoStatus(null);
  };

  return (
    <main className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => router.back()}>
            ← Voltar
          </Button>
          <h1 className="text-2xl font-semibold">{data.titulo}</h1>
        </div>
        <div className="flex items-center gap-4">
          <StatusBadge status={data.status} />
          <select
            className="border rounded px-3 py-2"
            value={alterandoStatus ?? data.status}
            onChange={(e) => onChangeStatus(e.target.value)}
          >
            <option value="pendente">Pendente</option>
            <option value="em_analise">Em Análise</option>
            <option value="resolvido">Resolvido</option>
            <option value="fechado">Fechado</option>
          </select>
        </div>
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
                    className={`max-w-xl rounded-lg p-3 text-sm shadow-sm ${
                      isInterna
                        ? "bg-yellow-50 border border-yellow-200"
                        : "bg-primary/10 border border-primary/20"
                    }`}
                  >
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">
                        {isInterna ? "Nota Interna" : i.autor_nome}
                      </span>
                      <span className="text-xs text-muted-foreground">{i.data_formatada}</span>
                    </div>
                    <p className="text-foreground whitespace-pre-line">{i.mensagem}</p>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Área de resposta */}
          <Card className="p-6 space-y-4">
            <div className="flex gap-4">
              <Button
                variant={tab === "PUBLICA" ? "default" : "secondary"}
                onClick={() => setTab("PUBLICA")}
              >
                Responder ao Usuário
              </Button>
              <Button
                variant={tab === "INTERNA" ? "default" : "secondary"}
                onClick={() => setTab("INTERNA")}
              >
                Nota Interna
              </Button>
            </div>
            <textarea
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              rows={4}
              className="w-full border rounded p-3"
              placeholder={
                tab === "PUBLICA"
                  ? "Escreva uma resposta pública ao usuário..."
                  : "Escreva uma nota interna (visível apenas à equipe)..."
              }
            />
            <div className="flex justify-end">
              <Button onClick={enviar}>Enviar</Button>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 space-y-3">
            <h3 className="text-lg font-medium">Detalhes</h3>
            <div className="text-sm">
              <div><span className="text-muted-foreground">Protocolo:</span> {data.protocolo}</div>
              <div><span className="text-muted-foreground">Tipo:</span> {data.tipo}</div>
              <div><span className="text-muted-foreground">Aberto em:</span> {new Date(data.data_criacao).toLocaleString()}</div>
            </div>
          </Card>
          <Card className="p-6 space-y-3">
            <h3 className="text-lg font-medium">Ações</h3>
            <Button variant="secondary" onClick={() => onChangeStatus("fechado")}>Arquivar</Button>
          </Card>
        </div>
      </div>
    </main>
  );
}
