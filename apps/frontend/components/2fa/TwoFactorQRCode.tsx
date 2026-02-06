/**
 * Componente para exibir QR Code de configuração 2FA
 */

import { Card } from "@/components/ui/card";
import { AlertCircle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";

interface TwoFactorQRCodeProps {
  qrCodeDataUrl: string;
  secret: string;
  className?: string;
}

export function TwoFactorQRCode({ qrCodeDataUrl, secret, className }: TwoFactorQRCodeProps) {
  const [copied, setCopied] = useState(false);

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      toast.success("Código secreto copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Erro ao copiar código");
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        {/* QR Code */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-64 h-64 bg-white rounded-lg p-4 border-2 border-gray-200">
            <Image
              src={qrCodeDataUrl}
              alt="QR Code 2FA"
              width={240}
              height={240}
              className="w-full h-full"
              unoptimized
            />
          </div>
          
          <p className="text-sm text-center text-muted-foreground max-w-sm">
            Escaneie este QR Code com seu aplicativo autenticador 
            (Google Authenticator, Authy, Microsoft Authenticator, etc.)
          </p>
        </div>

        {/* Código Manual */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>Não consegue escanear? Use o código manual:</span>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <code className="flex-1 text-sm font-mono break-all">
              {secret}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={copySecret}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Instruções */}
        <div className="space-y-2 pt-2 border-t">
          <p className="text-sm font-medium">Como configurar:</p>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Abra seu app autenticador</li>
            <li>Toque em "Adicionar conta" ou "+"</li>
            <li>Escaneie o QR Code ou digite o código manual</li>
            <li>Digite o código de 6 dígitos exibido no app</li>
          </ol>
        </div>
      </div>
    </Card>
  );
}
