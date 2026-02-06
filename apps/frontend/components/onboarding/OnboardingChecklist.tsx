"use client";

/**
 * Widget de Progresso do Onboarding
 * 
 * Exibe checklist interativo para novos clientes com:
 * - Barra de progresso visual (0-100%)
 * - Lista de tarefas com status
 * - Botões de ação para cada tarefa
 * - Auto-dismiss quando completo
 */

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Circle, 
  Palette, 
  Tags, 
  MessageSquarePlus, 
  Users, 
  X,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { useOnboarding } from "@/hooks/use-onboarding";
import { cn } from "@/lib/utils";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  action: string;
  href: string;
  required: boolean;
}

export default function OnboardingChecklist() {
  const { progress, isDismissed, dismiss, isLoading } = useOnboarding();
  const router = useRouter();

  // Não mostrar se foi dismissado ou se está carregando
  if (isDismissed || isLoading) {
    return null;
  }

  // Checklist de tarefas
  const tasks: ChecklistItem[] = [
    {
      id: "brand",
      title: "Personalizar Marca",
      description: "Configure logo e cores da sua empresa",
      icon: <Palette className="w-5 h-5" />,
      completed: progress.brand_configured,
      action: "Configurar",
      href: "/dashboard/configuracoes",
      required: true,
    },
    {
      id: "tags",
      title: "Criar Tags/Canais",
      description: "Organize feedbacks por categorias",
      icon: <Tags className="w-5 h-5" />,
      completed: progress.tags_created,
      action: "Criar Tags",
      href: "/dashboard/configuracoes",
      required: true,
    },
    {
      id: "feedback",
      title: "Simular Feedback",
      description: "Teste o fluxo criando um feedback de exemplo",
      icon: <MessageSquarePlus className="w-5 h-5" />,
      completed: progress.first_feedback,
      action: "Ver Feedbacks",
      href: "/dashboard/feedbacks",
      required: true,
    },
    {
      id: "team",
      title: "Convidar Equipe",
      description: "Adicione membros para colaborar (opcional)",
      icon: <Users className="w-5 h-5" />,
      completed: progress.team_invited,
      action: "Convidar",
      href: "/dashboard/equipe",
      required: false,
    },
  ];

  const completedTasks = tasks.filter((t) => t.completed).length;
  const requiredTasks = tasks.filter((t) => t.required);
  const completedRequired = requiredTasks.filter((t) => t.completed).length;

  return (
    <Card className={cn(
      "relative overflow-hidden border-2",
      progress.completed 
        ? "border-green-500 bg-green-50/50 dark:bg-green-950/20" 
        : "border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10"
    )}>
      {/* Botão Fechar */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8"
        onClick={dismiss}
      >
        <X className="w-4 h-4" />
      </Button>

      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {progress.completed ? (
            <div className="p-2 rounded-full bg-green-500 text-white">
              <Sparkles className="w-6 h-6" />
            </div>
          ) : (
            <div className="p-2 rounded-full bg-primary/10 text-primary">
              <Sparkles className="w-6 h-6" />
            </div>
          )}
          <div className="flex-1">
            <CardTitle className="text-xl">
              {progress.completed ? "🎉 Parabéns! Configuração Completa" : "Configure sua Conta"}
            </CardTitle>
            <CardDescription>
              {progress.completed 
                ? "Sua conta está pronta para uso! Esta mensagem será fechada automaticamente."
                : `Complete as etapas abaixo para começar a usar o Ouvify (${completedRequired}/${requiredTasks.length} concluídas)`
              }
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Barra de Progresso */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              Progresso Geral: {completedTasks}/{tasks.length}
            </span>
            <Badge variant={progress.completed ? "default" : "secondary"}>
              {progress.progress_percentage}%
            </Badge>
          </div>
          <Progress value={progress.progress_percentage} className="h-2" />
        </div>

        {/* Lista de Tarefas */}
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-all",
                task.completed 
                  ? "bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-800" 
                  : "bg-card hover:bg-accent/50 cursor-pointer"
              )}
              onClick={() => !task.completed && router.push(task.href)}
            >
              {/* Ícone de Status */}
              <div className={cn(
                "flex-shrink-0",
                task.completed ? "text-green-600" : "text-muted-foreground"
              )}>
                {task.completed ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <Circle className="w-6 h-6" />
                )}
              </div>

              {/* Ícone da Tarefa */}
              <div className={cn(
                "flex-shrink-0 p-2 rounded-md",
                task.completed 
                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" 
                  : "bg-primary/10 text-primary"
              )}>
                {task.icon}
              </div>

              {/* Conteúdo */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={cn(
                    "font-medium text-sm",
                    task.completed && "line-through opacity-70"
                  )}>
                    {task.title}
                  </p>
                  {!task.required && (
                    <Badge variant="outline" className="text-xs">
                      Opcional
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {task.description}
                </p>
              </div>

              {/* Botão de Ação */}
              {!task.completed && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(task.href);
                  }}
                >
                  {task.action}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Mensagem de Conclusão */}
        {progress.completed && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <p className="text-sm text-green-800 dark:text-green-200">
              Excelente! Sua conta está configurada e pronta para receber feedbacks.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
