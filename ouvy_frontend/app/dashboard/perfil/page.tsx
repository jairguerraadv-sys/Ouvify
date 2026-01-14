'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Building, Calendar, Shield, Camera, Sparkles } from 'lucide-react';

export default function PerfilPage() {
  return (
    <ProtectedRoute>
      <PerfilContent />
    </ProtectedRoute>
  );
}

function PerfilContent() {
  const [loading, setLoading] = useState(false);

  // Mock data - substituir por dados reais da API
  const user = {
    name: 'João Silva',
    email: 'joao@empresa.com.br',
    avatar: '',
    empresa: 'Tech Solutions Ltda',
    cargo: 'Gerente de Compliance',
    cadastro: '15/12/2025',
    plano: 'Pro',
    status: 'Ativo'
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar user={user} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader 
          title="Meu Perfil"
          description="Gerencie suas informações pessoais"
          user={user}
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
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-primary-dark text-white">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <button className="absolute bottom-0 right-0 bg-primary hover:bg-primary-dark text-white rounded-full p-2 shadow-lg transition-colors opacity-0 group-hover:opacity-100">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-secondary">{user.name}</h1>
                      <Badge variant="success" className="gap-1">
                        <Shield className="w-3 h-3" />
                        Verificado
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">{user.cargo}</p>
                    
                    <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-secondary">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        <span className="text-secondary">{user.empresa}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-secondary">Membro desde {user.cadastro}</span>
                      </div>
                    </div>
                  </div>

                  {/* Plan Badge */}
                  <div className="sm:self-start">
                    <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-4 border border-primary/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-secondary">Plano {user.plano}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {user.status}
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
                        defaultValue={user.name}
                        className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-secondary">E-mail</label>
                      <input
                        type="email"
                        defaultValue={user.email}
                        className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-secondary">Empresa</label>
                      <input
                        type="text"
                        defaultValue={user.empresa}
                        className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-secondary">Cargo</label>
                      <input
                        type="text"
                        defaultValue={user.cargo}
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
          </div>
        </main>
      </div>
    </div>
  );
}
