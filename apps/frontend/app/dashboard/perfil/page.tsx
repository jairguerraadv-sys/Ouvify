"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardHeader } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FlexBetween } from "@/components/ui";
import {
  User,
  Mail,
  Building,
  Calendar,
  Shield,
  Camera,
  Sparkles,
  Download,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

type UserMeResponse = {
  id: number;
  name: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  data_cadastro: string;
  empresa: string | null;
  tenant_id: number | null;
  tenant_subdominio: string | null;
  plano: string | null;
  cargo: string | null;
};

export default function PerfilPage() {
  return (
    <DashboardLayout>
      <PerfilContent />
    </DashboardLayout>
  );
}

function PerfilContent() {
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { user } = useAuth();

  const [me, setMe] = useState<UserMeResponse | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const response = await api.get<UserMeResponse>("/api/users/me/");
        if (mounted) setMe(response);
      } catch (error) {
        // Não bloquear a tela: ainda dá para renderizar com AuthContext
        console.error("Erro ao carregar /api/users/me/:", error);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const cadastroLabel = useMemo(() => {
    const iso = me?.data_cadastro;
    if (!iso) return "—";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("pt-BR");
  }, [me?.data_cadastro]);

  const planoLabel = useMemo(() => {
    const plano = (me?.plano || "").trim();
    if (!plano) return "—";
    return plano.charAt(0).toUpperCase() + plano.slice(1);
  }, [me?.plano]);

  const userData = {
    name: me?.name || user?.name || "Usuário",
    email: me?.email || user?.email || "",
    avatar: user?.avatar || "",
    empresa: me?.empresa || user?.empresa || "Não informado",
    cargo: me?.cargo || "Usuário",
    cadastro: cadastroLabel,
    plano: planoLabel,
    status: "Ativo",
  };

  const handleExportData = async () => {
    const confirmMsg =
      "Deseja exportar todos os seus dados?\n\n" +
      "Será gerado um arquivo JSON com todas as suas informações pessoais e dados armazenados na plataforma.\n\n" +
      "Este processo pode levar alguns minutos.";

    if (!confirm(confirmMsg)) {
      return;
    }

    setExportLoading(true);
    try {
      const response = await api.get("/api/export-data/");

      // Criar blob e fazer download
      const blob = new Blob([JSON.stringify(response, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ouvify-dados-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert(
        "✅ Dados exportados com sucesso!\n\nO arquivo foi baixado para o seu computador.",
      );
    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      alert("❌ Erro ao exportar dados.\n\n" + getErrorMessage(error));
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmMsg =
      "⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!\n\n" +
      "Ao excluir sua conta:\n" +
      "• Todos os seus dados serão permanentemente removidos\n" +
      "• Sua assinatura será cancelada imediatamente\n" +
      "• Você perderá acesso a todos os recursos\n" +
      "• Não será possível recuperar sua conta\n\n" +
      'Digite "EXCLUIR" abaixo para confirmar:';

    const confirmation = prompt(confirmMsg);

    if (confirmation !== "EXCLUIR") {
      if (confirmation !== null) {
        alert("❌ Confirmação incorreta. Exclusão cancelada.");
      }
      return;
    }

    const finalConfirm = confirm(
      "🚨 ÚLTIMA CONFIRMAÇÃO\n\n" +
        "Tem ABSOLUTA CERTEZA que deseja excluir sua conta?\n\n" +
        "Esta é sua última chance de cancelar.",
    );

    if (!finalConfirm) {
      return;
    }

    setDeleteLoading(true);
    try {
      await api.delete("/api/account/");

      alert(
        "✅ Conta excluída com sucesso.\n\n" +
          "Seus dados foram permanentemente removidos.\n" +
          "Você será redirecionado para a página inicial.",
      );

      // Limpar autenticação e redirecionar
      localStorage.removeItem("token");
      window.location.href = "/";
    } catch (error) {
      console.error("Erro ao excluir conta:", error);
      alert("❌ Erro ao excluir conta.\n\n" + getErrorMessage(error));
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Meu Perfil"
        description="Gerencie suas informações pessoais"
        user={user || undefined}
      />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header Card */}
        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="relative group">
                <Avatar className="w-32 h-32 border-4 border-primary/10">
                  <AvatarImage src={userData.avatar} alt={userData.name} />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-primary-dark text-primary-foreground">
                    {userData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 bg-primary hover:bg-primary-dark text-primary-foreground rounded-full p-2 shadow-lg transition-colors opacity-0 group-hover:opacity-100">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-secondary">
                    {userData.name}
                  </h1>
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
                    <span className="text-secondary">
                      Membro desde {userData.cadastro}
                    </span>
                  </div>
                </div>
              </div>

              {/* Plan Badge */}
              <div className="sm:self-start">
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-4 border border-primary/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-secondary">
                      Plano {userData.plano}
                    </span>
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
                  <label className="text-sm font-medium text-secondary">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    defaultValue={userData.name}
                    className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-secondary">
                    E-mail
                  </label>
                  <input
                    type="email"
                    defaultValue={userData.email}
                    className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-secondary">
                    Empresa
                  </label>
                  <input
                    type="text"
                    defaultValue={userData.empresa}
                    className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-secondary">
                    Cargo
                  </label>
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
                  {loading ? "Salvando..." : "Salvar Alterações"}
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
            <FlexBetween className="py-3 border-b">
              <div>
                <p className="font-medium text-secondary">Alterar Senha</p>
                <p className="text-sm text-muted-foreground">
                  Última alteração há 30 dias
                </p>
              </div>
              <Button variant="outline" size="sm">
                Alterar
              </Button>
            </FlexBetween>
            <FlexBetween className="py-3 border-b">
              <div>
                <p className="font-medium text-secondary">
                  Autenticação em Dois Fatores
                </p>
                <p className="text-sm text-muted-foreground">
                  Adicione uma camada extra de segurança
                </p>
              </div>
              <Button variant="outline" size="sm">
                Ativar
              </Button>
            </FlexBetween>
            <FlexBetween className="py-3">
              <div>
                <p className="font-medium text-secondary">Sessões Ativas</p>
                <p className="text-sm text-muted-foreground">
                  Gerencie dispositivos conectados
                </p>
              </div>
              <Button variant="outline" size="sm">
                Ver Sessões
              </Button>
            </FlexBetween>
          </CardContent>
        </Card>

        {/* LGPD - Privacidade e Dados */}
        <Card className="border-warning bg-warning/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <Shield className="w-5 h-5 text-warning" />
              Privacidade e Dados (LGPD)
            </CardTitle>
            <p className="text-sm text-warning mt-2">
              De acordo com a Lei Geral de Proteção de Dados, você tem direito
              de acessar, corrigir e excluir seus dados pessoais.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Exportar Dados */}
            <div className="flex items-start justify-between py-4 border-b border-warning">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Download className="w-4 h-4 text-warning" />
                  <p className="font-semibold text-secondary">
                    Exportar Meus Dados
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Baixe uma cópia de todas as suas informações armazenadas na
                  plataforma em formato JSON. Inclui: dados pessoais, feedbacks
                  cadastrados, relatórios e histórico de atividades.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                disabled={exportLoading}
                className="ml-4 border-warning text-warning hover:bg-warning/10"
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
            <div className="flex items-start justify between py-4 bg-error/10 -mx-6 px-6 rounded-lg border border-error">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-error" />
                  <p className="font-semibold text-error">
                    Excluir Minha Conta
                  </p>
                </div>
                <p className="text-sm text-error mb-2">
                  <strong>⚠️ Ação irreversível!</strong> Todos os seus dados
                  serão permanentemente removidos.
                </p>
                <p className="text-sm text-error">
                  Ao excluir sua conta: sua assinatura será cancelada, todos os
                  feedbacks e relatórios serão apagados, e não será possível
                  recuperar nenhuma informação.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="ml-4 bg-error hover:bg-error"
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
              <p>
                • A exportação de dados pode levar alguns minutos dependendo do
                volume de informações.
              </p>
              <p>
                • A exclusão da conta é processada imediatamente e não pode ser
                desfeita.
              </p>
              <p>
                • Para mais informações sobre como tratamos seus dados, consulte
                nossa{" "}
                <a
                  href="/privacidade"
                  className="text-warning hover:underline"
                >
                  Política de Privacidade
                </a>
                .
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
