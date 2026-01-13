'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useFeedbacks } from '@/hooks/use-dashboard';
import { Search, MoreHorizontal, Filter, Eye, Archive, Trash2 } from 'lucide-react';

export default function FeedbacksPage() {
  const user = {
    name: 'João Silva',
    email: 'joao@empresa.com'
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Buscar feedbacks reais do backend
  const { data: feedbacks, isLoading } = useFeedbacks();

  // Filtrar feedbacks localmente
  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesSearch =
      feedback.protocolo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || feedback.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getCategoryBadge = (tipo: string) => {
    const variants: { [key: string]: { label: string; className: string } } = {
      denuncia: { label: '🚨 Denúncia', className: 'bg-error/10 text-error hover:bg-error/10' },
      sugestao: { label: '💡 Sugestão', className: 'bg-primary/10 text-primary hover:bg-primary/10' },
      elogio: { label: '⭐ Elogio', className: 'bg-success/10 text-success hover:bg-success/10' },
      reclamacao: { label: '😔 Reclamação', className: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-100' }
    };
    return variants[tipo] || variants.reclamacao;
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: { label: string; className: string } } = {
      pendente: { label: 'Pendente', className: 'bg-warning/10 text-warning hover:bg-warning/10' },
      em_analise: { label: 'Em Análise', className: 'bg-primary/10 text-primary hover:bg-primary/10' },
      resolvido: { label: 'Resolvido', className: 'bg-success/10 text-success hover:bg-success/10' },
      fechado: { label: 'Fechado', className: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-100' }
    };
    return variants[status] || variants.pendente;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Header */}
        <Header
          title="Feedbacks"
          subtitle="Gerencie todos os feedbacks e denúncias"
          user={user}
        />

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8">
            <Card variant="elevated" className="border-neutral-200">
              {/* Toolbar */}
              <CardHeader className="border-b border-neutral-200 pb-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-secondary">Lista de Feedbacks</CardTitle>
                    <CardDescription className="text-neutral-600">
                      {filteredFeedbacks.length} feedback{filteredFeedbacks.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </div>
                  <Button variant="default">+ Novo Feedback</Button>
                </div>

                {/* Filtros */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center mt-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                    <Input
                      placeholder="Buscar por protocolo ou termo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-neutral-200 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="border-neutral-200 gap-2">
                        <Filter className="h-4 w-4" />
                        Status {statusFilter && '✓'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                        Todos
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {['pendente', 'em_analise', 'resolvido', 'fechado'].map((status) => (
                        <DropdownMenuItem
                          key={status}
                          onClick={() => setStatusFilter(status)}
                          className={statusFilter === status ? 'bg-primary/10 text-primary' : ''}
                        >
                          {status === 'pendente' && 'Pendente'}
                          {status === 'em_analise' && 'Em Análise'}
                          {status === 'resolvido' && 'Resolvido'}
                          {status === 'fechado' && 'Fechado'}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              {/* Table */}
              <CardContent className="p-0">
                {isLoading ? (
                  // Loading State com Skeletons
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-neutral-200">
                          <TableHead className="text-secondary font-semibold">Protocolo</TableHead>
                          <TableHead className="text-slate-900 font-semibold">Assunto</TableHead>
                          <TableHead className="text-slate-900 font-semibold">Categoria</TableHead>
                          <TableHead className="text-slate-900 font-semibold">Data</TableHead>
                          <TableHead className="text-slate-900 font-semibold">Status</TableHead>
                          <TableHead className="w-10 text-slate-900 font-semibold text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[...Array(5)].map((_, i) => (
                          <TableRow key={i} className="border-slate-200">
                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-64" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : filteredFeedbacks.length === 0 ? (
                  // Empty State
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">📭</div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">Tudo limpo por aqui!</h3>
                    <p className="text-slate-600">
                      {searchTerm || statusFilter 
                        ? 'Nenhum feedback corresponde aos seus critérios.' 
                        : 'Nenhum feedback foi enviado ainda.'}
                    </p>
                  </div>
                ) : (
                  // Data Table
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-200">
                          <TableHead className="text-slate-900 font-semibold">Protocolo</TableHead>
                          <TableHead className="text-slate-900 font-semibold">Assunto</TableHead>
                          <TableHead className="text-slate-900 font-semibold">Categoria</TableHead>
                          <TableHead className="text-slate-900 font-semibold">Data</TableHead>
                          <TableHead className="text-slate-900 font-semibold">Status</TableHead>
                          <TableHead className="w-10 text-slate-900 font-semibold text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredFeedbacks.map((feedback) => {
                          const categoryBadge = getCategoryBadge(feedback.tipo);
                          const statusBadge = getStatusBadge(feedback.status);
                          
                          return (
                            <TableRow
                              key={feedback.id}
                              className="border-slate-200 hover:bg-slate-50 transition-colors"
                            >
                              <TableCell className="font-mono text-sm text-slate-700">
                                {feedback.protocolo}
                              </TableCell>
                              <TableCell className="max-w-xs truncate">
                                {feedback.anonimo && <span className="text-xs text-slate-500 mr-2">🔒</span>}
                                <span className="text-slate-900">{feedback.titulo}</span>
                              </TableCell>
                              <TableCell>
                                <Badge className={categoryBadge.className}>
                                  {categoryBadge.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-slate-600">
                                {formatDate(feedback.data_criacao)}
                              </TableCell>
                              <TableCell>
                                <Badge className={statusBadge.className}>
                                  {statusBadge.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <Eye className="h-4 w-4 mr-2" />
                                      Ver Detalhes
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Archive className="h-4 w-4 mr-2" />
                                      Arquivar
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600">
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Deletar
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
