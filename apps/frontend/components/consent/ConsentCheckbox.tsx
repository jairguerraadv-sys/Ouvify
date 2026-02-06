/**
 * Componente de Checkbox para consentimento LGPD
 * Usado no formulário de envio de denúncia anônima
 */

import { useEffect, useState } from "react";
import { AlertCircle, ExternalLink, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useRequiredConsents } from "@/hooks/use-consent";
import { Skeleton } from "@/components/ui/skeleton";

interface ConsentCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  email?: string;
  className?: string;
}

export function ConsentCheckbox({
  checked,
  onChange,
  email,
  className = "",
}: ConsentCheckboxProps) {
  const { required, isLoading, error } = useRequiredConsents();
  const [showDetails, setShowDetails] = useState(false);

  // Encontrar o termo LGPD (principal para feedback)
  const lgpdTerm = required.find((term) => term.document_type === "lgpd");
  const privacyPolicy = required.find((term) => term.document_type === "privacy");

  if (isLoading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <Skeleton className="h-5 w-5 rounded shrink-0 mt-0.5" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      </Card>
    );
  }

  if (error || !lgpdTerm) {
    return (
      <Card className={`p-4 border-amber-200 bg-amber-50/50 ${className}`}>
        <div className="flex items-start gap-2 text-amber-800">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p className="text-sm">
            Não foi possível carregar os termos de consentimento. Tente novamente.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 border-primary/20 bg-primary/5 ${className}`}>
      <div className="space-y-3">
        {/* Checkbox Principal */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="mt-1 h-5 w-5 rounded border-primary text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer transition-all"
            required
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-secondary group-hover:text-primary transition-colors">
              {lgpdTerm.document_type_display} - v{lgpdTerm.version}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Li e concordo com o tratamento dos meus dados pessoais conforme a LGPD 
              {email && " e autorizo o uso do meu e-mail para acompanhamento desta denúncia"}.
              {" "}
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="text-primary hover:text-primary-dark font-medium underline transition-colors"
              >
                {showDetails ? "Ocultar detalhes" : "Ver detalhes"}
              </button>
            </p>
          </div>
        </label>

        {/* Detalhes Expandidos */}
        {showDetails && (
          <div className="pl-8 space-y-3 border-l-2 border-primary/30">
            <div className="space-y-2 text-xs text-muted-foreground">
              <p className="font-medium text-secondary">Ao marcar esta caixa, você concorda que:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Seus dados serão usados exclusivamente para processar esta denúncia</li>
                <li>Seguimos todas as diretrizes da LGPD (Lei nº 13.709/2018)</li>
                <li>Você pode solicitar a exclusão dos seus dados a qualquer momento</li>
                <li>Seus dados não serão compartilhados com terceiros sem autorização</li>
                {email && <li>Seu e-mail será usado apenas para comunicação sobre esta denúncia</li>}
              </ul>
            </div>

            {/* Links para documentos */}
            <div className="flex flex-wrap gap-3 pt-2 border-t">
              {lgpdTerm.content_url && (
                <a
                  href={lgpdTerm.content_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary-dark font-medium transition-colors"
                >
                  <Shield className="h-3 w-3" />
                  Política de Privacidade
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {privacyPolicy?.content_url && (
                <a
                  href={privacyPolicy.content_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary-dark font-medium transition-colors"
                >
                  Termos de Uso
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            {/* Informação sobre LGPD */}
            <div className="p-2 bg-primary/10 rounded-lg">
              <p className="text-xs text-muted-foreground italic">
                💡 A LGPD garante seus direitos sobre seus dados pessoais. Você pode acessar, 
                corrigir ou solicitar a exclusão de seus dados a qualquer momento.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Badge de versão */}
      <div className="mt-3 pt-3 border-t border-primary/20">
        <p className="text-xs text-muted-foreground">
          Versão do termo: {lgpdTerm.version} • 
          Vigente desde {new Date(lgpdTerm.effective_date).toLocaleDateString("pt-BR")}
        </p>
      </div>
    </Card>
  );
}
