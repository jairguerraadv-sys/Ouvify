"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar?: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Maria Silva",
    role: "Diretora de Compliance",
    company: "TechCorp Brasil",
    content:
      "O Ouvify transformou completamente nossa gestão de denúncias. A implementação foi rápida e a equipe adorou a interface intuitiva. Em 3 meses, já vimos um aumento de 40% no engajamento dos colaboradores.",
    rating: 5,
    avatar: "MS",
  },
  {
    name: "João Santos",
    role: "CEO",
    company: "Indústria Exemplo SA",
    content:
      "Procurávamos uma solução white label que se integrasse perfeitamente à nossa marca. O Ouvify superou nossas expectativas com personalização completa e suporte excepcional. Recomendo fortemente!",
    rating: 5,
    avatar: "JS",
  },
  {
    name: "Ana Costa",
    role: "Gerente de RH",
    company: "Varejo Nacional",
    content:
      "A conformidade com LGPD era nossa maior preocupação. O Ouvify não só resolve isso como também oferece relatórios detalhados que facilitam muito nosso trabalho. Excelente investimento!",
    rating: 5,
    avatar: "AC",
  },
  {
    name: "Carlos Oliveira",
    role: "Coordenador de TI",
    company: "Governo Municipal",
    content:
      "Implementamos o Ouvify em toda a prefeitura. A segurança é impecável e a API permitiu integrações essenciais com nossos sistemas internos. Suporte técnico sempre disponível.",
    rating: 5,
    avatar: "CO",
  },
  {
    name: "Fernanda Lima",
    role: "Diretora Financeira",
    company: "Startup FinTech",
    content:
      "Como startup, precisávamos de uma solução profissional mas acessível. O plano Starter foi perfeito para começarmos e já escalamos para o Professional. ROI muito positivo!",
    rating: 5,
    avatar: "FL",
  },
  {
    name: "Roberto Mendes",
    role: "Presidente",
    company: "Associação Comercial",
    content:
      "Depois de testar 3 plataformas diferentes, escolhemos o Ouvify pela facilidade de uso e custo-benefício. Nossos associados estão muito satisfeitos com o canal de comunicação.",
    rating: 5,
    avatar: "RM",
  },
];

export function Testimonials() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
      {testimonials.map((testimonial, idx) => (
        <Card
          key={`testimonial-${idx}`}
          variant="elevated"
          className="group hover:-translate-y-1 transition-all"
        >
          <CardContent className="pt-6">
            {/* Rating */}
            <div className="flex gap-1 mb-4">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <Star
                  key={`star-${idx}-${i}`}
                  className="w-4 h-4 fill-warning-400 text-warning-400"
                />
              ))}
            </div>

            {/* Content */}
            <p className="text-secondary mb-6 leading-relaxed text-sm">
              &ldquo;{testimonial.content}&rdquo;
            </p>

            {/* Author */}
            <div className="flex items-center gap-3 border-t border-border pt-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-white font-bold">
                {testimonial.avatar}
              </div>
              <div>
                <p className="font-semibold text-secondary">
                  {testimonial.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {testimonial.role}
                </p>
                <p className="text-xs text-primary font-medium">
                  {testimonial.company}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
