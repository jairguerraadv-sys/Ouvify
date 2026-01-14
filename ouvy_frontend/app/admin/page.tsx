"use client";

import { useMemo, useCallback } from "react";
import useSWR from "swr";
import { api, apiClient } from "@/lib/api";
import { formatDate } from "@/lib/helpers";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

interface TenantAdmin {
  id: number;
  nome: string;
  subdominio: string;
  ativo: boolean;
  data_criacao: string;
}

const fetcher = async (url: string): Promise<TenantAdmin[]> => {
  return api.get<TenantAdmin[]>(url);
};

export default function AdminDashboard() {
  const { data, error, mutate, isLoading } = useSWR<TenantAdmin[]>("/api/admin/tenants/", fetcher, {
    revalidateOnFocus: true,
  });

  const totals = useMemo(() => {
    const tenants = data || [];
    return {
      total: tenants.length,
      ativos: tenants.filter((t) => t.ativo).length,
      novosMes: tenants.filter((t) => {
        const d = new Date(t.data_criacao);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length,
      mrr: tenants.length * 299, // mock MRR (ex.: R$299 por cliente)
    };
  }, [data]);

  const toggleAtivo = useCallback(async (tenant: TenantAdmin) => {
    try {
      await api.patch(`/api/admin/tenants/${tenant.id}/`, { ativo: !tenant.ativo });
      await mutate();
    } catch (err) {
      console.error("Erro ao atualizar tenant", err);
    }
  }, [mutate]);

  if (error?.response?.status === 403) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <Card className="bg-slate-900 border-slate-800 p-8">
          <h1 className="text-2xl font-semibold mb-2">Acesso Negado</h1>
          <p className="text-neutral-300">Área restrita a Super Admins.</p>
        </Card>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white grid grid-cols-[260px_1fr]">
      {/* Sidebar escura */}
      <aside className="bg-slate-900 border-r border-slate-800 p-6 space-y-6">
        <div>
          <div className="mb-3">
            <Logo size="md" />
          </div>
          <p className="text-xs text-neutral-400">Torre de Controle Admin</p>
        </div>
        <nav className="space-y-2 text-sm">
          <div className="font-medium text-white">Visão Geral</div>
          <div className="text-slate-400 hover:text-white cursor-pointer">Financeiro</div>
          <div className="text-slate-400 hover:text-white cursor-pointer">Configurações Globais</div>
        </nav>
      </aside>

      {/* Conteúdo principal */}
      <main className="p-8 space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Painel do Super Admin</h1>
            <p className="text-slate-400 text-sm">Monitoramento de crescimento do SaaS</p>
          </div>
          <Button variant="secondary" className="bg-slate-800 text-white border-slate-700">Exportar CSV</Button>
        </header>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-slate-900 border-slate-800 p-4">
            <p className="text-slate-400 text-sm">Total de Tenants</p>
            <p className="text-3xl font-semibold">{isLoading ? "-" : totals.total}</p>
          </Card>
          <Card className="bg-slate-900 border-slate-800 p-4">
            <p className="text-slate-400 text-sm">Ativos</p>
            <p className="text-3xl font-semibold">{isLoading ? "-" : totals.ativos}</p>
          </Card>
          <Card className="bg-slate-900 border-slate-800 p-4">
            <p className="text-slate-400 text-sm">Novos no mês</p>
            <p className="text-3xl font-semibold">{isLoading ? "-" : totals.novosMes}</p>
          </Card>
          <Card className="bg-slate-900 border-slate-800 p-4">
            <p className="text-slate-400 text-sm">MRR (mock)</p>
            <p className="text-3xl font-semibold">R$ {isLoading ? "-" : totals.mrr}</p>
          </Card>
        </div>

        {/* Tabela de tenants */}
        <Card className="bg-slate-900 border-slate-800">
          <Table>
            <TableCaption className="text-slate-500">Gestão de clientes SaaS</TableCaption>
            <TableHeader>
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-400">Empresa</TableHead>
                <TableHead className="text-slate-400">Subdomínio</TableHead>
                <TableHead className="text-slate-400">Data Cadastro</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data || []).map((t) => (
                <TableRow key={t.id} className="border-slate-800">
                  <TableCell className="text-white font-medium">{t.nome}</TableCell>
                  <TableCell>
                    <a
                      href={`http://${t.subdominio}.localhost:3000/dashboard`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-300 hover:underline"
                    >
                      {t.subdominio}.localhost
                    </a>
                  </TableCell>
                  <TableCell className="text-slate-200">
                    {formatDate(t.data_criacao, 'short')}
                  </TableCell>
                  <TableCell>
                    <Badge className={t.ativo ? "bg-green-600" : "bg-red-600"}>
                      {t.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-slate-200">
                      <input
                        type="checkbox"
                        checked={t.ativo}
                        onChange={() => toggleAtivo(t)}
                        className="accent-green-500"
                      />
                      Ativo
                    </label>
                    <a
                      href={`http://${t.subdominio}.localhost:3000/dashboard`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-300 hover:text-white text-sm"
                    >
                      Acessar Painel
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </main>
    </div>
  );
}
