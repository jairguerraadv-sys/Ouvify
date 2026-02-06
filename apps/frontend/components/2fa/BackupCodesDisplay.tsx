/**
 * Componente para exibir códigos de backup do 2FA
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Copy, Download, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface BackupCodesDisplayProps {
  codes: string[];
  className?: string;
}

export function BackupCodesDisplay({ codes, className }: BackupCodesDisplayProps) {
  const [copied, setCopied] = useState(false);

  const copyAllCodes = async () => {
    try {
      const codesText = codes.join("\n");
      await navigator.clipboard.writeText(codesText);
      setCopied(true);
      toast.success("Códigos copiados!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Erro ao copiar códigos");
    }
  };

  const downloadCodes = () => {
    try {
      const codesText = [
        "Ouvify - Códigos de Backup 2FA",
        "================================",
        "",
        "⚠️ IMPORTANTE: Guarde estes códigos em local seguro!",
        "Cada código só pode ser usado UMA VEZ.",
        "",
        "Códigos:",
        ...codes.map((code, i) => `${i + 1}. ${code}`),
        "",
        `Gerado em: ${new Date().toLocaleString("pt-BR")}`,
      ].join("\n");

      const blob = new Blob([codesText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ouvify-backup-codes-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Códigos baixados!");
    } catch (error) {
      toast.error("Erro ao baixar códigos");
    }
  };

  return (
    <Card className={`p-6 border-amber-200 bg-amber-50/50 ${className}`}>
      <div className="space-y-4">
        {/* Cabeçalho de Aviso */}
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 rounded-lg shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-amber-900">
              Guarde seus códigos de backup
            </h3>
            <p className="text-sm text-amber-800">
              Use estes códigos se perder acesso ao seu app autenticador. 
              Cada código só pode ser usado uma vez.
            </p>
          </div>
        </div>

        {/* Grid de Códigos */}
        <div className="grid grid-cols-2 gap-2 p-4 bg-white rounded-lg border">
          {codes.map((code, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 font-mono text-sm bg-gray-50 rounded"
            >
              <span className="text-xs text-muted-foreground w-5">
                {index + 1}.
              </span>
              <code className="font-semibold">{code}</code>
            </div>
          ))}
        </div>

        {/* Ações */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-amber-200">
          <Button
            variant="outline"
            size="sm"
            onClick={copyAllCodes}
            className="flex-1 min-w-[140px]"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2 text-green-600" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copiar Todos
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={downloadCodes}
            className="flex-1 min-w-[140px]"
          >
            <Download className="h-4 w-4 mr-2" />
            Baixar .txt
          </Button>
        </div>

        {/* Nota Final */}
        <p className="text-xs text-amber-700 text-center">
          💡 Recomendamos imprimir ou salvar em um gerenciador de senhas
        </p>
      </div>
    </Card>
  );
}
