"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/components/OnboardingTour";
import { useState } from "react";
import {
  HelpCircle,
  Search,
  BookOpen,
  PlayCircle,
  MessageCircle,
  Mail,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  Video,
  Zap,
  Shield,
  CreditCard,
  Settings,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { FlexBetween } from "@/components/ui";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqItems: FAQItem[] = [
  {
    category: "Primeiros Passos",
    question: "Como configuro minha marca (White Label)?",
    answer:
      "Acesse Dashboard > Configurações. Lá você pode enviar seu logo, definir cores da marca e personalizar a aparência da sua página de feedbacks. As mudanças são aplicadas em tempo real.",
  },
  {
    category: "Primeiros Passos",
    question: "Qual é o link para meus clientes enviarem feedbacks?",
    answer:
      "Seu link público é: [seu-subdominio].ouvify.com/enviar. Você também pode encontrar esse link no topo do seu Dashboard, pronto para copiar e compartilhar.",
  },
  {
    category: "Primeiros Passos",
    question: "Como convido outros colaboradores para minha equipe?",
    answer:
      "No momento, cada conta possui um usuário administrador. Estamos trabalhando em funcionalidades de multi-usuários para futuras versões.",
  },
  {
    category: "Feedbacks",
    question: "Como posso responder a um feedback?",
    answer:
      "Clique em qualquer feedback na lista para abrir os detalhes. Na parte inferior, você encontrará um campo para adicionar sua resposta. As respostas podem ser internas (só você vê) ou públicas (o autor do feedback também vê).",
  },
  {
    category: "Feedbacks",
    question: "O que significam os status dos feedbacks?",
    answer:
      "Pendente: ainda não foi analisado. Em Análise: você está trabalhando nisso. Resolvido: a questão foi tratada. Arquivado: não requer mais ação.",
  },
  {
    category: "Feedbacks",
    question: "Como exporto meus dados?",
    answer:
      "Acesse Dashboard > Relatórios. Você pode filtrar por período, tipo e status, depois exportar em CSV ou JSON. Esta funcionalidade está disponível a partir do plano Starter.",
  },
  {
    category: "Planos e Pagamentos",
    question: "Quais são os planos disponíveis?",
    answer:
      "Oferecemos: FREE (até 50 feedbacks/mês), STARTER (R$99/mês - até 500 feedbacks), PRO (R$299/mês - feedbacks ilimitados + features premium) e ENTERPRISE (sob consulta).",
  },
  {
    category: "Planos e Pagamentos",
    question: "Como faço upgrade do meu plano?",
    answer:
      "Acesse Dashboard > Assinatura e clique em 'Fazer Upgrade'. Você será direcionado para o checkout seguro do Stripe. O novo plano é ativado imediatamente após a confirmação do pagamento.",
  },
  {
    category: "Planos e Pagamentos",
    question: "Como cancelo minha assinatura?",
    answer:
      "Acesse Dashboard > Assinatura e clique em 'Gerenciar Assinatura'. Você pode cancelar a qualquer momento. O acesso continua até o final do período já pago.",
  },
  {
    category: "Segurança",
    question: "Os feedbacks são realmente anônimos?",
    answer:
      "Sim! Por padrão, não coletamos informações identificáveis dos remetentes. Nem nós nem você conseguem identificar quem enviou um feedback anônimo.",
  },
  {
    category: "Segurança",
    question: "Meus dados estão seguros?",
    answer:
      "Absolutamente. Utilizamos criptografia SSL/TLS para todas as conexões, armazenamento seguro com isolamento por tenant e seguimos as melhores práticas de segurança LGPD.",
  },
];

const categories = [
  "Todos",
  "Primeiros Passos",
  "Feedbacks",
  "Planos e Pagamentos",
  "Segurança",
];

const getCategoryIcon = (category: string) => {
  const icons: Record<string, React.ReactNode> = {
    "Primeiros Passos": <Zap className="w-4 h-4" />,
    Feedbacks: <MessageCircle className="w-4 h-4" />,
    "Planos e Pagamentos": <CreditCard className="w-4 h-4" />,
    Segurança: <Shield className="w-4 h-4" />,
  };
  return icons[category] || <HelpCircle className="w-4 h-4" />;
};

export default function AjudaPage() {
  return (
    <DashboardLayout>
      <AjudaContent />
    </DashboardLayout>
  );
}

function AjudaContent() {
  const { user } = useAuth();
  const { restartTour } = useOnboarding();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const filteredFAQ = faqItems.filter((item) => {
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "Todos" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleItem = (index: number) => {
    setExpandedItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Central de Ajuda"
        description="Encontre respostas rápidas ou entre em contato conosco"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Ajuda" },
        ]}
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          className="p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => {
            restartTour();
            toast.success("Tour reiniciado!");
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <PlayCircle className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="font-medium text-sm">Refazer Tour</p>
              <p className="text-xs text-muted-foreground">
                Reveja o tour guiado
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
          <a
            href="https://docs.ouvify.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Documentação</p>
              <p className="text-xs text-muted-foreground">Guias completos</p>
            </div>
          </a>
        </Card>

        <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
          <a
            href="mailto:suporte@ouvify.com"
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="font-medium text-sm">Email Suporte</p>
              <p className="text-xs text-muted-foreground">
                suporte@ouvify.com
              </p>
            </div>
          </a>
        </Card>

        <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
          <Link
            href="/dashboard/configuracoes"
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="font-medium text-sm">Configurações</p>
              <p className="text-xs text-muted-foreground">Ajuste sua conta</p>
            </div>
          </Link>
        </Card>
      </div>

      {/* Search and Categories */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar na ajuda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="gap-1"
              >
                {category !== "Todos" && getCategoryIcon(category)}
                {category}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* FAQ List */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b bg-muted/50">
          <h2 className="text-lg font-medium">Perguntas Frequentes</h2>
          <p className="text-sm text-muted-foreground">
            {filteredFAQ.length}{" "}
            {filteredFAQ.length === 1 ? "resultado" : "resultados"} encontrado
            {filteredFAQ.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="divide-y">
          {filteredFAQ.length === 0 ? (
            <div className="p-8 text-center">
              <HelpCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhum resultado encontrado. Tente termos diferentes ou entre em
                contato conosco.
              </p>
            </div>
          ) : (
            filteredFAQ.map((item, index) => (
              <div key={index} className="border-b last:border-b-0">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full p-4 text-left hover:bg-muted/50 transition-colors"
                >
                  <FlexBetween>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        {getCategoryIcon(item.category)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.question}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.category}
                        </p>
                      </div>
                    </div>
                    {expandedItems.includes(index) ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </FlexBetween>
                </button>
                {expandedItems.includes(index) && (
                  <div className="px-4 pb-4 pl-[60px]">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Still Need Help? */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-medium">Ainda precisa de ajuda?</h3>
            <p className="text-sm text-muted-foreground">
              Nossa equipe está pronta para ajudar você
            </p>
          </div>
          <div className="flex gap-3">
            <a href="mailto:suporte@ouvify.com">
              <Button variant="outline">
                <Mail className="w-4 h-4 mr-2" />
                Enviar Email
              </Button>
            </a>
            <a
              href="https://docs.ouvify.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button>
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver Documentação
              </Button>
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}
