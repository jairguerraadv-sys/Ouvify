'use client';

/**
 * Export/Import Data Component - Ouvify
 * Sprint 5 - Feature 5.3: Export/Import de Dados
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  FileJson, 
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Calendar,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExportFilters {
  format: 'csv' | 'json' | 'xlsx';
  periodo: '7' | '30' | '90' | 'all';
  tipo?: string;
  status?: string;
  prioridade?: string;
  data_inicio?: string;
  data_fim?: string;
}

interface ImportResult {
  success: boolean;
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export function ExportDataDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ExportFilters>({
    format: 'csv',
    periodo: '30',
  });
  const { toast } = useToast();

  const handleExport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('format', filters.format);
      params.append('periodo', filters.periodo);
      if (filters.tipo) params.append('tipo', filters.tipo);
      if (filters.status) params.append('status', filters.status);
      if (filters.prioridade) params.append('prioridade', filters.prioridade);
      if (filters.data_inicio) params.append('data_inicio', filters.data_inicio);
      if (filters.data_fim) params.append('data_fim', filters.data_fim);

      const response = await fetch(`/api/feedbacks/export-advanced/?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao exportar dados');
      }

      // Download arquivo
      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `feedbacks_export.${filters.format}`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Exportação concluída!',
        description: `Arquivo ${filename} baixado com sucesso.`,
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: 'Erro na exportação',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatIcons = {
    csv: <FileText className="h-4 w-4" />,
    json: <FileJson className="h-4 w-4" />,
    xlsx: <FileSpreadsheet className="h-4 w-4" />,
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar Dados
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Exportar Feedbacks</DialogTitle>
          <DialogDescription>
            Escolha o formato e os filtros para exportar os dados.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Formato */}
          <div className="space-y-2">
            <Label>Formato do arquivo</Label>
            <div className="flex gap-2">
              {(['csv', 'json', 'xlsx'] as const).map((format) => (
                <Button
                  key={format}
                  variant={filters.format === format ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilters({ ...filters, format })}
                  className="gap-2"
                >
                  {formatIcons[format]}
                  {format.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          {/* Período */}
          <div className="space-y-2">
            <Label>Período</Label>
            <Select
              value={filters.periodo}
              onValueChange={(v) => setFilters({ ...filters, periodo: v as ExportFilters['periodo'] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
                <SelectItem value="all">Todo o período</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Filtros adicionais */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros opcionais
            </Label>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Tipo</Label>
                <Select
                  value={filters.tipo || 'all'}
                  onValueChange={(v) => setFilters({ ...filters, tipo: v === 'all' ? undefined : v })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="reclamacao">Reclamação</SelectItem>
                    <SelectItem value="sugestao">Sugestão</SelectItem>
                    <SelectItem value="elogio">Elogio</SelectItem>
                    <SelectItem value="duvida">Dúvida</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(v) => setFilters({ ...filters, status: v === 'all' ? undefined : v })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="aberto">Aberto</SelectItem>
                    <SelectItem value="em_analise">Em Análise</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="resolvido">Resolvido</SelectItem>
                    <SelectItem value="fechado">Fechado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Data inicial
              </Label>
              <Input
                type="date"
                className="h-8"
                value={filters.data_inicio || ''}
                onChange={(e) => setFilters({ ...filters, data_inicio: e.target.value || undefined })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Data final
              </Label>
              <Input
                type="date"
                className="h-8"
                value={filters.data_fim || ''}
                onChange={(e) => setFilters({ ...filters, data_fim: e.target.value || undefined })}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleExport} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? 'Exportando...' : 'Exportar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ImportDataDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [updateExisting, setUpdateExisting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('update_existing', updateExisting.toString());

      const response = await fetch('/api/feedbacks/import/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: formData,
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        toast({
          title: 'Importação concluída!',
          description: `${data.created} criados, ${data.updated} atualizados.`,
        });
      } else {
        toast({
          title: 'Importação com erros',
          description: `${data.errors.length} erros encontrados.`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro na importação',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetDialog = () => {
    setFile(null);
    setResult(null);
    setUpdateExisting(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetDialog(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Importar Dados
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Importar Feedbacks</DialogTitle>
          <DialogDescription>
            Importe feedbacks de um arquivo CSV ou JSON.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File input */}
          <div className="space-y-2">
            <Label>Arquivo</Label>
            <Input
              type="file"
              accept=".csv,.json"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Arquivo selecionado: <span className="font-medium">{file.name}</span>
              </p>
            )}
          </div>

          {/* Options */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="update-existing"
              checked={updateExisting}
              onCheckedChange={(checked) => setUpdateExisting(checked as boolean)}
            />
            <Label htmlFor="update-existing" className="text-sm">
              Atualizar feedbacks existentes (mesmo protocolo)
            </Label>
          </div>

          {/* Template info */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Formato esperado</AlertTitle>
            <AlertDescription className="text-xs">
              O arquivo deve conter colunas: Protocolo, Tipo, Título, Descrição, Status, Prioridade, Anônimo.
              <br />
              Para JSON, use uma lista de objetos com as chaves correspondentes.
            </AlertDescription>
          </Alert>

          {/* Result */}
          {result && (
            <Alert variant={result.success ? 'success' : 'error'}>
              {result.success ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>Resultado da importação</AlertTitle>
              <AlertDescription>
                <div className="flex gap-4 mt-2">
                  <Badge variant="outline" className="gap-1">
                    <span className="text-green-600">{result.created}</span> criados
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <span className="text-blue-600">{result.updated}</span> atualizados
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <span className="text-yellow-600">{result.skipped}</span> ignorados
                  </Badge>
                </div>
                {result.errors.length > 0 && (
                  <div className="mt-2 text-xs max-h-24 overflow-y-auto">
                    {result.errors.slice(0, 5).map((err, i) => (
                      <p key={i} className="text-red-600">{err}</p>
                    ))}
                    {result.errors.length > 5 && (
                      <p className="text-muted-foreground">...e mais {result.errors.length - 5} erros</p>
                    )}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {result ? 'Fechar' : 'Cancelar'}
          </Button>
          {!result && (
            <Button onClick={handleImport} disabled={loading || !file}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Importando...' : 'Importar'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DataManagementCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Gestão de Dados
        </CardTitle>
        <CardDescription>
          Exporte ou importe feedbacks em diferentes formatos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <ExportDataDialog />
          <ImportDataDialog />
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Formatos suportados:</p>
          <div className="flex gap-2 mt-1">
            <Badge variant="secondary" className="gap-1">
              <FileText className="h-3 w-3" /> CSV
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <FileJson className="h-3 w-3" /> JSON
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <FileSpreadsheet className="h-3 w-3" /> Excel
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DataManagementCard;
