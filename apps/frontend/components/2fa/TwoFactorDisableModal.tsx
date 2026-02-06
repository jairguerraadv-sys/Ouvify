/**
 * Modal para desabilitar 2FA
 */

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2 } from "lucide-react";
import { use2FA } from "@/hooks/use-2fa";

interface TwoFactorDisableModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

export function TwoFactorDisableModal({
  open,
  onOpenChange,
  onComplete,
}: TwoFactorDisableModalProps) {
  const { disable2FA, isLoading } = use2FA();
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const handleDisable = async () => {
    if (!password || !code) return;

    const success = await disable2FA(password, code);
    if (success) {
      setPassword("");
      setCode("");
      onComplete?.();
      onOpenChange(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setPassword("");
      setCode("");
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Desabilitar 2FA
          </DialogTitle>
          <DialogDescription>
            Para desabilitar a autenticação de dois fatores, confirme sua senha e 
            digite um código 2FA válido.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Senha */}
          <div className="space-y-2">
            <Label htmlFor="password">Senha Atual</Label>
            <Input
              id="password"
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {/* Código 2FA */}
          <div className="space-y-2">
            <Label htmlFor="code">Código 2FA</Label>
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              maxLength={8}
              placeholder="000000 ou XXXX-XXXX"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Digite o código do app autenticador ou um código de backup
            </p>
          </div>

          {/* Aviso */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              ⚠️ <strong>Atenção:</strong> Desabilitar 2FA reduzirá a segurança 
              da sua conta. Você poderá reativar quando quiser.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDisable}
            disabled={!password || !code || isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Desabilitar 2FA
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
