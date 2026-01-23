'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useState, useMemo, useCallback } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFeedbacks } from '@/hooks/use-dashboard';
import { useDebounce } from '@/hooks/use-common';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate } from '@/lib/helpers';
import type { Feedback, FeedbackStatus, FeedbackType } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Archive,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  FileText
} from 'lucide-react';

export default function FeedbacksPage() {
  return (
    <ProtectedRoute>
      <FeedbacksContent />
    </ProtectedRoute>
  );
}

function FeedbacksContent() {
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | 'todos'>('todos');
  const { user, tenant } = useAuth();
  
  // Debounce do termo de busca para otimizar performance (500ms delay)
  const searchTerm = useDebounce(searchInput, 500);
  
  // Buscar feedbacks usando o hook
  const { feedbacks, isLoading, error } = useFeedbacks(
    statusFilter !== 'todos' ? { status: statusFilter } : undefined
  );

  // Filtrar feedbacks baseado no termo de busca
  const filteredFeedbacks = useMemo(() => {
    if (!feedbacks) return [];
    
    if (!searchTerm.trim()) return feedbacks;
    
    const term = searchTerm.toLowerCase();
    return feedbacks.filter(
      (f) =>
        f.protocolo.toLowerCase().includes(term) ||
        f.titulo.toLowerCase().includes(term) ||
        f.categoria.toLowerCase().includes(term)
    );
  }, [feedbacks, searchTerm]);

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: { label: string; className: string; icon: React.ReactNode } } = {
      resolvido: {
        label: 'Resolvido',
        className: 'bg-green-100 text-green-700 hover:bg-green-100',
        icon: <CheckCircle className="h-3 w-3 mr-1" />
      },
      em_analise: {
        label: 'Em Análise',
        className: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
        icon: <Clock className="h-3 w-3 mr-1" />
      },
      pendente: {
        label: 'Pendente',
        className: 'bg-slate-100 text-slate-700 hover:bg-slate-100',
        icon: <AlertCircle className="h-3 w-3 mr-1" />
      }
    };

    const variant = variants[status] || variants.pendente;

    return (
      <Badge variant="outline" className={variant.className}>
        {variant.icon}
        {variant.label}
      </Badge>
    );
  };

  const getCategoryColor = (categoria: string) => {
    const colors: { [key: string]: string } = {
      'Conduta': 'bg-red-100 text-red-700',
      'Benefícios': 'bg-blue-100 text-blue-700',
      'Reconhecimento': 'bg-green-100 text-green-700',
      'Segurança': 'bg-orange-100 text-orange-700',
      'Infraestrutura': 'bg-purple-100 text-purple-700'
    };

    return colors[categoria] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar user={user} />

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-600 mb-2">
            Feedbacks
          </h1>
          <p className="text-slate-600">
            Gerencie todas as denúncias, sugestões e elogios recebidos
          </p>
        </div>

        {/* Filters Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por protocolo ou assunto..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Status Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="min-w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    Status: {statusFilter === 'todos' ? 'Todos' : statusFilter}
                    <ChevronDown className="ml-auto h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[180px]">
                  <DropdownMenuLabel>Filtrar por Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setStatusFilter('todos')}>
                    Todos
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('pendente')}>
                    Pendente
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('em_analise')}>
                    Em Análise
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('resolvido')}>
                    Resolvido
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* Table Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filteredFeedbacks.length} {filteredFeedbacks.length === 1 ? 'Feedback' : 'Feedbacks'}
            </CardTitle>
            <CardDescription>
              {searchTerm || statusFilter !== 'todos' 
                ? 'Resultados filtrados' 
                : 'Todos os feedbacks recebidos'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-600">Carregando feedbacks...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  Erro ao carregar feedbacks
                </h3>
                <p className="text-slate-500">{error}</p>
              </div>
            ) : filteredFeedbacks.length === 0 ? (
              // Empty state diferente se é filtro ou se realmente não tem feedbacks
              searchTerm || statusFilter !== 'todos' ? (
                <EmptyState
                  icon={Search}
                  title="Nenhum feedback encontrado"
                  description="Tente ajustar os filtros ou termos de busca para encontrar o que procura."
                  actionLabel="Limpar Filtros"
                  actionHref="/dashboard/feedbacks"
                />
              ) : (
                <EmptyState
                  icon={FileText}
                  title="Nenhum feedback recebido ainda"
                  description="Compartilhe o link da sua página pública com seus clientes para começar a receber feedbacks, sugestões e elogios."
                  actionLabel="Abrir Página Pública"
                  actionHref={`https://${tenant?.subdominio}.ouvy.com/enviar`}
                  actionExternal
                  copyText={`https://${tenant?.subdominio}.ouvy.com/enviar`}
                  secondaryActionLabel="Ver Tutorial"
                  secondaryActionHref="/dashboard?tour=restart"
                />
              )
            ) : (
              <div className="rounded-lg border border-slate-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[140px]">Protocolo</TableHead>
                      <TableHead>Assunto</TableHead>
                      <TableHead className="w-[140px]">Categoria</TableHead>
                      <TableHead className="w-[120px]">Data</TableHead>
                      <TableHead className="w-[140px]">Status</TableHead>
                      <TableHead className="w-[80px] text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFeedbacks.map((feedback) => (
                      <TableRow key={feedback.id} className="hover:bg-slate-50">
                        <TableCell>
                          <code className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">
                            {feedback.protocolo}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-secondary-600 text-sm">
                              {feedback.titulo}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {feedback.tipo}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getCategoryColor(feedback.categoria)}`}
                          >
                            {feedback.categoria}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {formatDate(feedback.data_criacao, 'short')}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(feedback.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver Detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Archive className="mr-2 h-4 w-4" />
                                Arquivar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
