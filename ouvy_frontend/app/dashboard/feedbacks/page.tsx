'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  const user = {
    name: 'João Silva',
    email: 'joao@empresa.com'
  };

  // Mock data
  const feedbacks = [
    {
      id: 1,
      protocolo: 'OUVY-XGZ6-ZMMV',
      tipo: 'Denúncia',
      assunto: 'Comportamento inadequado no escritório',
      categoria: 'Conduta',
      status: 'em_analise',
      data: '2026-01-11',
      prioridade: 'alta'
    },
    {
      id: 2,
      protocolo: 'OUVY-A3B9-K7M2',
      tipo: 'Sugestão',
      assunto: 'Implementar home office híbrido',
      categoria: 'Benefícios',
      status: 'pendente',
      data: '2026-01-10',
      prioridade: 'media'
    },
    {
      id: 3,
      protocolo: 'OUVY-M5N3-P8Q1',
      tipo: 'Elogio',
      assunto: 'Excelente atendimento do suporte técnico',
      categoria: 'Reconhecimento',
      status: 'resolvido',
      data: '2026-01-09',
      prioridade: 'baixa'
    },
    {
      id: 4,
      protocolo: 'OUVY-K7L2-N9P4',
      tipo: 'Denúncia',
      assunto: 'Vazamento de informações confidenciais',
      categoria: 'Segurança',
      status: 'em_analise',
      data: '2026-01-08',
      prioridade: 'alta'
    },
    {
      id: 5,
      protocolo: 'OUVY-Q1R8-S3T6',
      tipo: 'Reclamação',
      assunto: 'Ar condicionado não funciona',
      categoria: 'Infraestrutura',
      status: 'pendente',
      data: '2026-01-07',
      prioridade: 'media'
    }
  ];

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

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesSearch = 
      feedback.protocolo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.assunto.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'todos' || feedback.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
            {filteredFeedbacks.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  Nenhum feedback encontrado
                </h3>
                <p className="text-sm text-slate-500">
                  {searchTerm || statusFilter !== 'todos'
                    ? 'Tente ajustar os filtros de busca'
                    : 'Tudo limpo por aqui! 🎉'}
                </p>
              </div>
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
                              {feedback.assunto}
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
                          {new Date(feedback.data).toLocaleDateString('pt-BR')}
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
