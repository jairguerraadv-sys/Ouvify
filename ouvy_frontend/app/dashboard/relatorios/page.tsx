'use client';

import { useState } from 'react';
import { Download, FileText, Calendar, Filter, AlertCircle } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import api from '@/lib/api';

export default function RelatoriosPage() {
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    tipo: '',
    status: '',
    data_inicio: '',
    data_fim: '',
  });

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      setLoading(true);
      
      // Montar query params apenas com filtros não-vazios
      const params = new URLSearchParams();
      params.append('format', format);
      
      if (filters.tipo) params.append('tipo', filters.tipo);
      if (filters.status) params.append('status', filters.status);
      if (filters.data_inicio) params.append('data_inicio', filters.data_inicio);
      if (filters.data_fim) params.append('data_fim', filters.data_fim);
      
      const response = await api.get(`/api/feedbacks/export/?${params.toString()}`, {
        responseType: 'blob',
      });
      
      // Criar download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Nome do arquivo com timestamp
      const timestamp = new Date().toISOString().slice(0, 10);
      link.setAttribute('download', `feedbacks_${timestamp}.${format}`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      // Feedback visual
      const successMessage = format === 'csv' 
        ? 'Relatório CSV exportado com sucesso!' 
        : 'Relatório JSON exportado com sucesso!';
      alert(successMessage);
    } catch (error: any) {
      console.error('Erro ao exportar relatório:', error);
      
      if (error.response?.status === 403) {
        alert('Esta funcionalidade requer upgrade de plano (STARTER ou PRO).');
      } else if (error.response?.status === 401) {
        alert('Sessão expirada. Faça login novamente.');
        window.location.href = '/login';
      } else {
        alert('Erro ao exportar relatório. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      tipo: '',
      status: '',
      data_inicio: '',
      data_fim: '',
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
            <p className="text-gray-600 mt-2">
              Exporte seus dados de feedback em diferentes formatos
            </p>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
              </div>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Limpar filtros
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={filters.tipo}
                  onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="denuncia">Denúncia</option>
                  <option value="sugestao">Sugestão</option>
                  <option value="elogio">Elogio</option>
                  <option value="reclamacao">Reclamação</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="pendente">Pendente</option>
                  <option value="em_analise">Em Análise</option>
                  <option value="resolvido">Resolvido</option>
                  <option value="fechado">Fechado</option>
                </select>
              </div>

              {/* Data Início */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Início
                </label>
                <input
                  type="date"
                  value={filters.data_inicio}
                  onChange={(e) => setFilters({ ...filters, data_inicio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Data Fim */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Fim
                </label>
                <input
                  type="date"
                  value={filters.data_fim}
                  onChange={(e) => setFilters({ ...filters, data_fim: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Opções de Exportação */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* CSV */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">CSV</h3>
                  <p className="text-sm text-gray-600">Planilhas (Excel, Google Sheets)</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                Formato ideal para análise de dados, importação em ferramentas de BI
                e criação de gráficos personalizados.
              </p>
              <button
                onClick={() => handleExport('csv')}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                {loading ? 'Exportando...' : 'Exportar CSV'}
              </button>
            </div>

            {/* JSON */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">JSON</h3>
                  <p className="text-sm text-gray-600">Dados estruturados (APIs, backup)</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                Formato ideal para integrações com outras ferramentas, backup
                completo de dados e processamento automatizado.
              </p>
              <button
                onClick={() => handleExport('json')}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                {loading ? 'Exportando...' : 'Exportar JSON'}
              </button>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  Sobre os Relatórios
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Os dados exportados respeitam os filtros aplicados acima</li>
                  <li>• Relatórios incluem todos os campos dos feedbacks</li>
                  <li>• Dados sensíveis são mascarados conforme LGPD</li>
                  <li>• Planos STARTER e PRO têm acesso a exportação ilimitada</li>
                  <li>• Plano FREE não possui acesso a exportação de dados</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

            Download completo em CSV ou Excel
          </p>
          <Button variant="secondary">Exportar</Button>
        </Card>
      </div>

      <Card className="p-6 bg-primary/10 border-primary/20">
        <p className="text-sm text-primary">
          <strong>💡 Em breve:</strong> Gráficos interativos, dashboards customizáveis e agendamento de relatórios automáticos.
        </p>
      </Card>
    </main>
  );
}
