"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RelatoriosPage() {
  return (
    <main className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Relatórios</h1>
        <p className="text-muted-foreground text-sm">Análises e exportações de dados</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-2">📊 Relatório de Feedbacks</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Exportar todos os feedbacks com filtros personalizados
          </p>
          <Button variant="secondary">Gerar Relatório</Button>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-2">📈 Análise de Tendências</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Visualizar padrões e tendências ao longo do tempo
          </p>
          <Button variant="secondary">Ver Análise</Button>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-2">⏱️ Tempo de Resposta</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Métricas de SLA e tempo médio de resolução
          </p>
          <Button variant="secondary">Ver Métricas</Button>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-2">📥 Exportar Dados</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Download completo em CSV ou Excel
          </p>
          <Button variant="secondary">Exportar</Button>
        </Card>
      </div>

      <Card className="p-6 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>💡 Em breve:</strong> Gráficos interativos, dashboards customizáveis e agendamento de relatórios automáticos.
        </p>
      </Card>
    </main>
  );
}
