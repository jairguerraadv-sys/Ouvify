'use client';

/**
 * Página de Audit Log e Analytics
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalyticsDashboard, AuditLogTable, SecurityAlertsCard } from '@/components/audit';
import { BarChart3, ListFilter, Shield } from 'lucide-react';

export default function AuditLogPage() {
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Auditoria & Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitore atividades do sistema, analise métricas e rastreie eventos de segurança
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <ListFilter className="h-4 w-4" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="logs">
          <AuditLogTable />
        </TabsContent>

        <TabsContent value="security">
          <div className="grid gap-6 md:grid-cols-2">
            <SecurityAlertsCard maxItems={10} />
            
            {/* Estatísticas de segurança */}
            <div className="space-y-6">
              <div className="p-6 rounded-lg border bg-card">
                <h3 className="text-lg font-semibold mb-4">
                  Boas Práticas de Segurança
                </h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-success-500">✓</span>
                    Revise alertas de segurança regularmente
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success-500">✓</span>
                    Monitore tentativas de login falhadas
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success-500">✓</span>
                    Verifique acessos de IPs desconhecidos
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success-500">✓</span>
                    Configure alertas automáticos para eventos críticos
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success-500">✓</span>
                    Exporte logs periodicamente para backup
                  </li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg border bg-card">
                <h3 className="text-lg font-semibold mb-4">
                  Ações Monitoradas
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-primary-500">🔐</span> Login/Logout
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-success-500">➕</span> Criações
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-warning-500">✏️</span> Alterações
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-error-500">🗑️</span> Exclusões
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-secondary-500">📥</span> Exportações
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-error-600">🚨</span> Alertas
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
