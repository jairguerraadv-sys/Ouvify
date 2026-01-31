'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Building, Calendar, Shield, Camera, Sparkles, Download, Trash2, AlertTriangle } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function PerfilPage() {
  return (
    <ProtectedRoute>
      <PerfilContent />
    </ProtectedRoute>
  );
}

function PerfilContent() {
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { user } = useAuth();

  // Dados do usuário real do AuthContext
  const userData = {
    name: user?.name || 'Usuário',
    email: user?.email || '',
    avatar: user?.avatar || '',
    empresa: user?.empresa || 'Não informado',
    cargo: 'Administrador', // TODO: Adicionar campo cargo ao backend
    cadastro: 'Recente', // TODO: Adicionar data de cadastro ao backend
    plano: 'Pro', // TODO: Buscar do backend via API
    status: 'Ativo'
  };

  const handleExportData = async () => {
    const confirmMsg = 
      'Deseja exportar todos os seus dados?\n\n' +
      'Será gerado um arquivo JSON com todas as suas informações pessoais e dados armazenados na plataforma.\n\n' +
      'Este processo pode levar alguns minutos.';
      
    if (!confirm(confirmMsg)) {
      return;
    }

    setExportLoading(true);
    try {
      const response = await api.get('/api/export-data/');
      
      // Criar blob e fazer download
      const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ouvify-dados-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      alert('✅ Dados exportados com sucesso!\n\nO arquivo foi baixado para o seu computador.');
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      alert('❌ Erro ao exportar dados.\n\n' + getErrorMessage(error));
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmMsg = 
      '⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!\n\n' +
      'Ao excluir sua conta:\n' +
      '• Todos os seus dados serão permanentemente removidos\n' +
      '• Sua assinatura será cancelada imediatamente\n' +
      '• Você perderá acesso a todos os recursos\n' +
      '• Não será possível recuperar sua conta\n\n' +
      'Digite "EXCLUIR" abaixo para confirmar:';
      
    const confirmation = prompt(confirmMsg);
    
    if (confirmation !== 'EXCLUIR') {
      if (confirmation !== null) {
        alert('❌ Confirmação incorreta. Exclusão cancelada.');
      }
      return;
    }

    const finalConfirm = confirm(
      '🚨 ÚLTIMA CONFIRMAÇÃO\n\n' +
      'Tem ABSOLUTA CERTEZA que deseja excluir sua conta?\n\n' +
      'Esta é sua última chance de cancelar.'
    );

    if (!finalConfirm) {
      return;
    }

    setDeleteLoading(true);
    try {
      await api.delete('/api/account/');
      
      alert(
        '✅ Conta excluída com sucesso.\n\n' +
        'Seus dados foram permanentemente removidos.\n' +
        'Você será redirecionado para a página inicial.'
      );
      
      // Limpar autenticação e redirecionar
      localStorage.removeItem('token');
      window.location.href = '/';
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      alert('❌ Erro ao excluir conta.\n\n' + getErrorMessage(error));
      setDeleteLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar user={user || undefined} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader 
          title="Meu Perfil"
          description="Gerencie suas informações pessoais"
          user={user || undefined}
        />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Profile Header Card */}
            <Card variant="elevated">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  {/* Avatar */}
                  <div className="relative group">
                    <Avatar className="w-32 h-32 border-4 border-primary/10">
                      <AvatarImage src={userData.avatar} alt={userData.name} />
                      <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-primary-dark text-gray-900">
                        {userData.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <button className="absolute bottom-0 right-0 bg-primary hover:bg-primary-dark text-gray-900 rounded-full p-2 shadow-lg transition-colors opacity-0 group-hover:opacity-100">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-secondary">{userData.name}</h1>
                      <Badge variant="success" className="gap-1">
                        <Shield className="w-3 h-3" />
                        Verificado
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">{userData.cargo}</p>
                    
                    <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-secondary">{userData.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        <span className="text-secondary">{userData.empresa}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-secondary">Membro desde {userData.cadastro}</span>
                      </div>
                    </div>
                  </div>

                  {/* Plan Badge */}
                  <div className="sm:self-start">
                    <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-4 border border-primary/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-secondary">Plano {userData.plano}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {userData.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-secondary">Nome Completo</label>
                      <input
                        type="text"
                        defaultValue={userData.name}
                        className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-secondary">E-mail</label>
                      <input
                        type="email"
                        defaultValue={userData.email}
                        className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-secondary">Empresa</label>
                      <input
                        type="text"
                        defaultValue={userData.empresa}
                        className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-secondary">Cargo</label>
                      <input
                        type="text"
                        defaultValue={userData.cargo}
                        className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" type="button">
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium text-secondary">Alterar Senha</p>
                    <p className="text-sm text-muted-foreground">Última alteração há 30 dias</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Alterar
                  </Button>
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium text-secondary">Autenticação em Dois Fatores</p>
                    <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Ativar
                  </Button>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-secondary">Sessões Ativas</p>
                    <p className="text-sm text-muted-foreground">Gerencie dispositivos conectados</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Ver Sessões
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* LGPD - Privacidade e Dados */}
            <Card className="border-orange-200 bg-orange-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-900">
                  <Shield className="w-5 h-5 text-orange-600" />
                  Privacidade e Dados (LGPD)
                </CardTitle>
                <p className="text-sm text-orange-700 mt-2">
                  De acordo com a Lei Geral de Proteção de Dados, você tem direito de acessar, corrigir e excluir seus dados pessoais.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Exportar Dados */}
                <div className="flex items-start justify-between py-4 border-b border-orange-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Download className="w-4 h-4 text-orange-600" />
                      <p className="font-semibold text-secondary">Exportar Meus Dados</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Baixe uma cópia de todas as suas informações armazenadas na plataforma em formato JSON.
                      Inclui: dados pessoais, feedbacks cadastrados, relatórios e histórico de atividades.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleExportData}
                    disabled={exportLoading}
                    className="ml-4 border-orange-300 text-orange-700 hover:bg-orange-100"
                  >
                    {exportLoading ? (
                      <>
                        <Download className="w-4 h-4 mr-2 animate-pulse" />
                        Exportando...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Exportar
                      </>
                    )}
                  </Button>
                </div>

                {/* Excluir Conta */}
                <div className="flex items-start justify-between py-4 bg-error-50 -mx-6 px-6 rounded-lg border border-error-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-error-600" />
                      <p className="font-semibold text-error-900">Excluir Minha Conta</p>
                    </div>
                    <p className="text-sm text-error-700 mb-2">
                      <strong>⚠️ Ação irreversível!</strong> Todos os seus dados serão permanentemente removidos.
                    </p>
                    <p className="text-sm text-error-600">
                      Ao excluir sua conta: sua assinatura será cancelada, todos os feedbacks e relatórios serão apagados,
                      e não será possível recuperar nenhuma informação.
                    </p>
                  </div>
                  <Button 
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading}
                    className="ml-4 bg-error-600 hover:bg-error-700"
                  >
                    {deleteLoading ? (
                      <>
                        <Trash2 className="w-4 h-4 mr-2 animate-pulse" />
                        Excluindo...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir Conta
                      </>
                    )}
                  </Button>
                </div>

                {/* Informações adicionais */}
                <div className="pt-2 text-xs text-muted-foreground space-y-1">
                  <p>• A exportação de dados pode levar alguns minutos dependendo do volume de informações.</p>
                  <p>• A exclusão da conta é processada imediatamente e não pode ser desfeita.</p>
                  <p>• Para mais informações sobre como tratamos seus dados, consulte nossa <a href="/privacidade" className="text-orange-600 hover:underline">Política de Privacidade</a>.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
