"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { FlexBetween } from "@/components/ui";
import {
  UserPlus,
  Mail,
  Shield,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Send,
  X,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import api from "@/lib/api";
import { AxiosResponse } from "axios";

interface TeamMember {
  id: number;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
  };
  role: string;
  role_display: string;
  status: string;
  status_display: string;
  invited_at: string;
  joined_at: string | null;
  can_be_managed: boolean;
}

interface TeamInvitation {
  id: number;
  email: string;
  role: string;
  role_display: string;
  status: string;
  status_display: string;
  created_at: string;
  expires_at: string;
  is_valid: boolean;
  is_expired: boolean;
  invite_url: string;
  invited_by_name: string;
}

interface TeamStats {
  total_members: number;
  active_members: number;
  suspended_members: number;
  members_by_role: {
    owner: number;
    admin: number;
    moderator: number;
    viewer: number;
  };
  team_limit: number;
  current_count: number;
  team_usage_percentage: number;
  can_add_members: boolean;
  plan: string;
}

export default function TeamManagementPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "VIEWER",
    personal_message: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [membersRes, invitationsRes, statsRes] = (await Promise.all([
        api.get("/api/team/members/"),
        api.get("/api/team/invitations/"),
        api.get("/api/team/members/stats/"),
      ])) as [
        AxiosResponse<TeamMember[]>,
        AxiosResponse<TeamInvitation[]>,
        AxiosResponse<TeamStats>,
      ];

      setMembers(membersRes.data);
      setInvitations(invitationsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    try {
      await api.post("/api/team/invitations/", inviteForm);
      setInviteDialogOpen(false);
      setInviteForm({ email: "", role: "VIEWER", personal_message: "" });
      loadData();
      alert("Convite enviado com sucesso!");
    } catch (error: any) {
      alert(error.response?.data?.detail || "Erro ao enviar convite");
    }
  };

  const handleRevoke = async (invitationId: number) => {
    if (!confirm("Deseja revogar este convite?")) return;

    try {
      await api.delete(`/api/team/invitations/${invitationId}/`);
      loadData();
    } catch (error) {
      alert("Erro ao revogar convite");
    }
  };

  const handleRemove = async (memberId: number) => {
    if (!confirm("Deseja remover este membro?")) return;

    try {
      await api.delete(`/api/team/members/${memberId}/`);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.detail || "Erro ao remover membro");
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      OWNER: "bg-secondary-100 text-secondary-800",
      ADMIN: "bg-primary-100 text-primary-800",
      MODERATOR: "bg-success-100 text-success-800",
      VIEWER: "bg-neutral-100 text-neutral-800",
    };
    return colors[role] || "bg-neutral-100 text-neutral-800";
  };

  const getRoleIcon = (role: string) => {
    const icons: Record<string, any> = {
      OWNER: Shield,
      ADMIN: Shield,
      MODERATOR: Edit,
      VIEWER: Eye,
    };
    const Icon = icons[role] || Eye;
    return <Icon className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Carregando...
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary flex items-center gap-2">
            <Users className="w-8 h-8" />
            Gestão de Equipe
          </h1>
          <p className="text-text-secondary mt-1">
            Gerencie membros e convites da sua equipe
          </p>
        </div>

        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!stats?.can_add_members}>
              <UserPlus className="w-4 h-4 mr-2" />
              Convidar Membro
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convidar Novo Membro</DialogTitle>
              <DialogDescription>
                Envie um convite por email para adicionar um membro à equipe
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) =>
                    setInviteForm({ ...inviteForm, email: e.target.value })
                  }
                  placeholder="usuario@empresa.com"
                />
              </div>

              <div>
                <Label htmlFor="role">Cargo *</Label>
                <Select
                  value={inviteForm.role}
                  onValueChange={(value) =>
                    setInviteForm({ ...inviteForm, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                    <SelectItem value="MODERATOR">Moderador</SelectItem>
                    <SelectItem value="VIEWER">Visualizador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="message">Mensagem Pessoal (opcional)</Label>
                <Textarea
                  id="message"
                  value={inviteForm.personal_message}
                  onChange={(e) =>
                    setInviteForm({
                      ...inviteForm,
                      personal_message: e.target.value,
                    })
                  }
                  placeholder="Adicione uma mensagem de boas-vindas..."
                  rows={3}
                />
              </div>

              <Button onClick={handleInvite} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Enviar Convite
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="text-sm text-text-secondary">Membros Ativos</div>
            <div className="text-2xl font-bold">{stats.active_members}</div>
            <div className="text-xs text-text-tertiary">
              de {stats.team_limit} máximo ({stats.plan})
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-sm text-text-secondary">Proprietários</div>
            <div className="text-2xl font-bold text-secondary-600">
              {stats.members_by_role.owner}
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-sm text-text-secondary">Administradores</div>
            <div className="text-2xl font-bold text-primary-600">
              {stats.members_by_role.admin}
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-sm text-text-secondary">Moderadores</div>
            <div className="text-2xl font-bold text-success-600">
              {stats.members_by_role.moderator}
            </div>
          </Card>
        </div>
      )}

      {/* Members List */}
      <Card className="mb-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">
            Membros da Equipe ({members.length})
          </h2>
        </div>

        <div className="divide-y">
          {members.map((member) => (
            <FlexBetween
              key={member.id}
              className="p-6 hover:bg-background-secondary"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold">
                  {member.user.first_name.charAt(0)}
                  {member.user.last_name.charAt(0)}
                </div>

                <div>
                  <div className="font-medium text-text-primary">
                    {member.user.full_name}
                  </div>
                  <div className="text-sm text-text-tertiary">
                    {member.user.email}
                  </div>
                  <div className="text-xs text-text-tertiary mt-1">
                    Entrou em{" "}
                    {new Date(
                      member.joined_at || member.invited_at,
                    ).toLocaleDateString("pt-BR")}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge className={getRoleBadgeColor(member.role)}>
                  {getRoleIcon(member.role)}
                  <span className="ml-1">{member.role_display}</span>
                </Badge>

                {member.can_be_managed && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(member.id)}
                  >
                    <Trash2 className="w-4 h-4 text-error-600" />
                  </Button>
                )}
              </div>
            </FlexBetween>
          ))}
        </div>
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card>
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">
              Convites Pendentes ({invitations.length})
            </h2>
          </div>

          <div className="divide-y">
            {invitations.map((invitation) => (
              <FlexBetween key={invitation.id} className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-warning-100 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-warning-600" />
                  </div>

                  <div>
                    <div className="font-medium text-text-primary">
                      {invitation.email}
                    </div>
                    <div className="text-sm text-text-tertiary">
                      Convidado em{" "}
                      {new Date(invitation.created_at).toLocaleDateString(
                        "pt-BR",
                      )}
                    </div>
                    <div className="text-xs text-text-tertiary">
                      {invitation.is_expired ? (
                        <span className="text-error-600">Expirado</span>
                      ) : (
                        <span>
                          Expira em{" "}
                          {new Date(invitation.expires_at).toLocaleDateString(
                            "pt-BR",
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge className={getRoleBadgeColor(invitation.role)}>
                    {invitation.role_display}
                  </Badge>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevoke(invitation.id)}
                  >
                    <X className="w-4 h-4 text-error-600" />
                  </Button>
                </div>
              </FlexBetween>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
