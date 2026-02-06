/**
 * Modal para configuração de 2FA (Wizard completo)
 */

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Shield, CheckCircle2 } from "lucide-react";
import { use2FA } from "@/hooks/use-2fa";
import { TwoFactorQRCode } from "./TwoFactorQRCode";
import { BackupCodesDisplay } from "./BackupCodesDisplay";

interface TwoFactorSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

type Step = "loading" | "qrcode" | "verify" | "backup" | "complete";

export function TwoFactorSetupModal({
  open,
  onOpenChange,
  onComplete,
}: TwoFactorSetupModalProps) {
  const { setup2FA, confirm2FA, isLoading, setupData } = use2FA();
  const [step, setStep] = useState<Step>("loading");
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  // Iniciar setup quando o modal abre
  const handleOpen = async (isOpen: boolean) => {
    if (isOpen && !setupData) {
      setStep("loading");
      const data = await setup2FA();
      if (data) {
        setStep("qrcode");
      } else {
        onOpenChange(false);
      }
    } else if (!isOpen) {
      // Reset ao fechar
      setStep("loading");
      setVerificationCode("");
      setBackupCodes([]);
    }
    onOpenChange(isOpen);
  };

  // Verificar código e confirmar
  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      return;
    }

    const success = await confirm2FA(verificationCode);
    if (success) {
      // Salvar backup codes que vieram do setup
      if (setupData?.backup_codes) {
        setBackupCodes(setupData.backup_codes);
        setStep("backup");
      } else {
        setStep("complete");
      }
    }
  };

  // Finalizar processo
  const handleComplete = () => {
    onComplete?.();
    onOpenChange(false);
  };

  // Permitir Enter no input de verificação
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && verificationCode.length === 6) {
      handleVerify();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {step === "complete" ? "2FA Ativado!" : "Configurar Autenticação de Dois Fatores"}
          </DialogTitle>
          <DialogDescription>
            {step === "loading" && "Gerando QR Code..."}
            {step === "qrcode" && "Escaneie o QR Code com seu app autenticador"}
            {step === "verify" && "Digite o código de 6 dígitos para confirmar"}
            {step === "backup" && "Guarde seus códigos de backup em local seguro"}
            {step === "complete" && "Sua conta agora está protegida com 2FA"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Loading */}
          {step === "loading" && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Gerando credenciais seguras...</p>
            </div>
          )}

          {/* QR Code */}
          {step === "qrcode" && setupData && (
            <div className="space-y-4">
              <TwoFactorQRCode
                qrCodeDataUrl={setupData.qr_code}
                secret={setupData.secret}
              />

              <div className="space-y-2">
                <Label htmlFor="verify-code">
                  Digite o código de 6 dígitos exibido no app
                </Label>
                <Input
                  id="verify-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                  onKeyPress={handleKeyPress}
                  className="text-center text-2xl tracking-widest font-mono"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground text-center">
                  O código muda a cada 30 segundos
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleVerify}
                  disabled={verificationCode.length !== 6 || isLoading}
                  className="flex-1"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verificar Código
                </Button>
              </div>
            </div>
          )}

          {/* Backup Codes */}
          {step === "backup" && backupCodes.length > 0 && (
            <div className="space-y-4">
              <BackupCodesDisplay codes={backupCodes} />

              <div className="flex gap-2">
                <Button
                  onClick={handleComplete}
                  className="flex-1"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Concluir Configuração
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                ⚠️ Esta é a única vez que estes códigos serão exibidos
              </p>
            </div>
          )}

          {/* Complete */}
          {step === "complete" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <div className="p-4 bg-green-100 rounded-full">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">2FA Ativado com Sucesso!</h3>
                <p className="text-muted-foreground">
                  Sua conta agora está protegida com autenticação de dois fatores.
                </p>
              </div>
              <Button onClick={handleComplete} className="mt-4">
                Fechar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
