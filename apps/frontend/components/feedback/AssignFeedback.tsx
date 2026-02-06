"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, UserMinus, Loader2 } from "lucide-react";
import { api, getErrorMessage } from "@/lib/api";
import { toast } from "sonner";

interface TeamMember {
  id: number;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  role: string;
  is_active: boolean;
}

interface AssignFeedbackProps {
  feedbackId: number;
  currentAssignee?: {
    id: number;
    email: string;
    name: string;
  } | null;
  onAssignmentChange?: () => void;
}

export function AssignFeedback({
  feedbackId,
  currentAssignee,
  onAssignmentChange,
}: AssignFeedbackProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string>(
    currentAssignee?.id?.toString() || "",
  );

  useEffect(() => {
    loadTeamMembers();
  }, []);

  useEffect(() => {
    setSelectedMember(currentAssignee?.id?.toString() || "");
  }, [currentAssignee]);

  async function loadTeamMembers() {
    try {
      const response = await api.get<{ results: TeamMember[] }>(
        "/api/team/members/",
      );
      setMembers(response.results || []);
    } catch (error) {
      console.error("Erro ao carregar membros:", error);
      toast.error("Erro ao carregar membros da equipe");
    } finally {
      setLoading(false);
    }
  }

  async function handleAssign() {
    if (!selectedMember || !feedbackId) return;

    setAssigning(true);
    try {
      await api.post(`/api/feedbacks/${feedbackId}/assign/`, {
        user_id: parseInt(selectedMember),
      });

      toast.success("Feedback atribuído com sucesso!");
      onAssignmentChange?.();
    } catch (error) {
      console.error("Erro ao atribuir:", error);
      toast.error(getErrorMessage(error));
    } finally {
      setAssigning(false);
    }
  }

  async function handleUnassign() {
    if (!feedbackId) return;

    setAssigning(true);
    try {
      await api.post(`/api/feedbacks/${feedbackId}/unassign/`, {});

      toast.success("Atribuição removida com sucesso!");
      setSelectedMember("");
      onAssignmentChange?.();
    } catch (error) {
      console.error("Erro ao remover atribuição:", error);
      toast.error(getErrorMessage(error));
    } finally {
      setAssigning(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Atribuição</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeMembers = members.filter((m) => m.is_active);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Atribuição</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Select value={selectedMember} onValueChange={setSelectedMember}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um membro" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Nenhum</SelectItem>
            {activeMembers.map((member) => (
              <SelectItem key={member.id} value={member.user.id.toString()}>
                {member.user.first_name || member.user.email} ({member.role})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {currentAssignee && (
          <div className="text-xs text-muted-foreground">
            Atualmente atribuído a:{" "}
            {currentAssignee.name || currentAssignee.email}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleAssign}
            disabled={!selectedMember || assigning}
            className="flex-1"
          >
            {assigning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Atribuir
              </>
            )}
          </Button>

          {currentAssignee && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleUnassign}
              disabled={assigning}
            >
              {assigning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <UserMinus className="h-4 w-4 mr-2" />
                  Remover
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
