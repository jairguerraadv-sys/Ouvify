"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiClient } from "@/lib/api";
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Key, 
  AlertCircle, 
  CheckCircle2,
  Copy,
  Download,
  RefreshCw,
  Lock
} from "lucide-react";
import { toast } from "sonner";

interface TwoFactorStatus {
  enabled: boolean;
  confirmed_at: string | null;
  backup_codes_remaining: number;
}

interface SetupResult {
  secret: string;
  qr_code: string; // data:image/png;base64,...
  backup_codes: string[];
  message: string;
}

export default function SegurancaPage() {
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados do fluxo de ativação
  const [isActivating, setIsActivating] = useState(false);
  const [setupData, setSetupData] = useState<SetupResult | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  
  // Estados do fluxo de desativação
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [deactivationPassword, setDeactivationPassword] = useState("");
  const [deactivationCode, setDeactivationCode] = useState("");
  const [deactivating, setDeactivating] = useState(false);
  
  // Estados de regeneração de backup codes
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerationCode, setRegenerationCode] = useState("");
  const [regenerating, setRegenerating] = useState(false);
  const [newBackupCodes, setNewBackupCodes] = useState<string[] | null>(null);

  // Carregar status do 2FA
  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await apiClient.get<TwoFactorStatus>("/api/auth/2fa/status/");
      setStatus(response.data);
    } catch (error) {
      console.error("Erro ao buscar status 2FA:", error);
      toast.error("Erro ao carregar status de segurança");
    } finally {
      setLoading(false);
    }
  };

  // FLUXO DE ATIVAÇÃO
  const handleStartActivation = async () => {
    setIsActivating(true);
    try {
      const response = await apiClient.post<SetupResult>("/api/auth/2fa/setup/");
      setSetupData(response.data);
      toast.success("QR Code gerado! Escaneie com seu app autenticador.");
    } catch (error: any) {
      const message = error.response?.data?.error || "Erro ao iniciar configuração de 2FA";
      toast.error(message);
      setIsActivating(false);
    }
  };

  const handleConfirmActivation = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Digite o código de 6 dígitos");
      return;
    }

    setVerifying(true);
    try {
      await apiClient.post("/api/auth/2fa/confirm/", { code: verificationCode });
      toast.success("✅ 2FA ativado com sucesso!");
      
      // Resetar estados
      setIsActivating(false);
      setSetupData(null);
      setVerificationCode("");
      
      // Recarregar status
      await fetchStatus();
    } catch (error: any) {
      const message = error.response?.data?.error || "Código inválido";
      toast.error(message);
    } finally {
      setVerifying(false);
    }
  };

  const handleCancelActivation = () => {
    setIsActivating(false);
    setSetupData(null);
    setVerificationCode("");
  };

  // FLUXO DE DESATIVAÇÃO
  const handleStartDeactivation = () => {
    setIsDeactivating(true);
  };

  const handleConfirmDeactivation = async () => {
    if (!deactivationPassword || !deactivationCode) {
      toast.error("Preencha senha e código 2FA");
      return;
    }

    setDeactivating(true);
    try {
      await apiClient.post("/api/auth/2fa/disable/", {
        password: deactivationPassword,
        code: deactivationCode,
      });
      
      toast.success("2FA desativado com sucesso");
      
      // Resetar estados
      setIsDeactivating(false);
      setDeactivationPassword("");
      setDeactivationCode("");
      
      // Recarregar status
      await fetchStatus();
    } catch (error: any) {
      const message = error.response?.data?.error || "Erro ao desativar 2FA";
      toast.error(message);
    } finally {
      setDeactivating(false);
    }
  };

  const handleCancelDeactivation = () => {
    setIsDeactivating(false);
    setDeactivationPassword("");
    setDeactivationCode("");
  };

  // REGENERAR BACKUP CODES
  const handleStartRegeneration = () => {
    setIsRegenerating(true);
  };

  const handleConfirmRegeneration = async () => {
    if (!regenerationCode || regenerationCode.length !== 6) {
      toast.error("Digite o código de 6 dígitos");
      return;
    }

    setRegenerating(true);
    try {
      const response = await apiClient.post<{ backup_codes: string[]; message: string }>(
        "/api/auth/2fa/backup-codes/regenerate/",
        { code: regenerationCode }
      );
      
      setNewBackupCodes(response.data.backup_codes);
      toast.success("Novos códigos de backup gerados!");
      
      // Recarregar status
      await fetchStatus();
    } catch (error: any) {
      const message = error.response?.data?.error || "Erro ao regenerar códigos";
      toast.error(message);
    } finally {
      setRegenerating(false);
    }
  };

  const handleCancelRegeneration = () => {
    setIsRegenerating(false);
    setRegenerationCode("");
    setNewBackupCodes(null);
  };

  // UTILITÁRIOS
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para área de transferência!");
  };

  const downloadBackupCodes = (codes: string[]) => {
    const text = `Códigos de Backup - Ouvify 2FA\n\n${codes.join("\n")}\n\nGuarde estes códigos em local seguro!\nCada código só pode ser usado uma vez.`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ouvify-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Códigos baixados!");
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary mb-2 flex items-center gap-2">
          <Shield className="w-8 h-8 text-primary" />
          Segurança da Conta
        </h1>
        <p className="text-muted-foreground">
          Configure autenticação em dois fatores para proteger sua conta
        </p>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {status?.enabled ? (
                  <ShieldCheck className="w-5 h-5 text-success" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-warning" />
                )}
                Autenticação em Dois Fatores (2FA)
              </CardTitle>
              <CardDescription>
                Adicione uma camada extra de segurança usando Google Authenticator ou similar
              </CardDescription>
            </div>
            <Badge variant={status?.enabled ? "default" : "secondary"} className="text-sm">
              {status?.enabled ? "Ativado" : "Desativado"}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Status Atual */}
          {status?.enabled ? (
            <Alert className="border-success/50 bg-success/10">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <AlertDescription>
                2FA está ativo desde {status.confirmed_at ? new Date(status.confirmed_at).toLocaleDateString('pt-BR') : 'recentemente'}.
                <br />
                Códigos de backup restantes: <strong>{status.backup_codes_remaining || 0}</strong>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-warning/50 bg-warning/10">
              <AlertCircle className="h-4 w-4 text-warning" />
              <AlertDescription>
                Sua conta não está protegida com 2FA. Recomendamos ativar para maior segurança.
              </AlertDescription>
            </Alert>
          )}

          {/* Ações */}
          {!status?.enabled && !isActivating && (
            <Button 
              onClick={handleStartActivation} 
              size="lg"
              className="w-full sm:w-auto"
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              Ativar 2FA
            </Button>
          )}

          {status?.enabled && !isDeactivating && !isRegenerating && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                onClick={handleStartRegeneration}
                disabled={status.backup_codes_remaining >= 10}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerar Códigos de Backup
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleStartDeactivation}
              >
                <ShieldAlert className="w-4 h-4 mr-2" />
                Desativar 2FA
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* FLUXO DE ATIVAÇÃO */}
      {isActivating && setupData && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-primary">Configurar 2FA</CardTitle>
            <CardDescription>Siga os passos abaixo para ativar a autenticação em dois fatores</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Passo 1: QR Code */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">1</span>
                Escaneie o QR Code
              </h3>
              <p className="text-sm text-muted-foreground">
                Abra o Google Authenticator (ou Authy, Microsoft Authenticator) e 
                escaneie o código abaixo:
              </p>
              
              {/* QR Code */}
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <img 
                  src={setupData.qr_code} 
                  alt="QR Code 2FA" 
                  className="w-48 h-48"
                />
              </div>

              {/* Secret (manual) */}
              <details className="text-sm">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                  Não consegue escanear? Clique para ver o código manual
                </summary>
                <div className="mt-2 p-3 bg-muted rounded font-mono text-xs break-all flex items-center justify-between">
                  <code>{setupData.secret}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(setupData.secret)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </details>
            </div>

            {/* Passo 2: Verificar Código */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">2</span>
                Digite o Código
              </h3>
              <p className="text-sm text-muted-foreground">
                Após escanear, digite o código de 6 dígitos exibido no app:
              </p>
              
              <div className="flex gap-2">
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                  className="text-center text-2xl tracking-widest font-mono"
                  disabled={verifying}
                />
                <Button 
                  onClick={handleConfirmActivation}
                  disabled={verifying || verificationCode.length !== 6}
                  isLoading={verifying}
                  size="lg"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirmar
                </Button>
              </div>
            </div>

            {/* Passo 3: Backup Codes (preview) */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-sm">3</span>
                Códigos de Backup
              </h3>
              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  Após confirmar, você receberá <strong>10 códigos de backup</strong> para 
                  usar caso perca acesso ao app autenticador. Guarde-os em local seguro!
                </AlertDescription>
              </Alert>

              {/* Preview dos códigos (blur) */}
              <div className="grid grid-cols-2 gap-2 blur-sm select-none pointer-events-none">
                {setupData.backup_codes.slice(0, 4).map((code, i) => (
                  <div key={i} className="p-2 bg-muted rounded text-center font-mono text-sm">
                    {code}
                  </div>
                ))}
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-2 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={handleCancelActivation}
                disabled={verifying}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* BACKUP CODES (após ativação bem-sucedida) */}
      {!isActivating && setupData && !status?.enabled && (
        <Card className="border-success">
          <CardHeader>
            <CardTitle className="text-success flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              2FA Ativado com Sucesso!
            </CardTitle>
            <CardDescription>
              Guarde seus códigos de backup em local seguro
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-warning/50 bg-warning/10">
              <AlertCircle className="h-4 w-4 text-warning" />
              <AlertDescription>
                <strong>IMPORTANTE:</strong> Cada código só pode ser usado uma vez. 
                Se você perder acesso ao app autenticador, estes códigos serão sua única forma de recuperar a conta.
              </AlertDescription>
            </Alert>

            {/* Lista de Códigos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {setupData.backup_codes.map((code, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between p-3 bg-muted rounded hover:bg-muted/80 transition-colors"
                >
                  <span className="font-mono text-sm font-semibold">{code}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(code)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Ações */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => downloadBackupCodes(setupData.backup_codes)}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar Códigos
              </Button>
              <Button
                onClick={() => {
                  copyToClipboard(setupData.backup_codes.join("\n"));
                }}
                className="flex-1"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar Todos
              </Button>
            </div>

            <Button 
              variant="secondary" 
              onClick={() => setSetupData(null)}
              className="w-full"
            >
              Entendi, fechar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* FLUXO DE DESATIVAÇÃO */}
      {isDeactivating && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Desativar 2FA</CardTitle>
            <CardDescription>
              Digite sua senha e um código de verificação para desativar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-warning/50 bg-warning/10">
              <AlertCircle className="h-4 w-4 text-warning" />
              <AlertDescription>
                <strong>Atenção:</strong> Desativar 2FA deixará sua conta menos segura.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Senha Atual</label>
                <Input
                  type="password"
                  placeholder="Digite sua senha"
                  value={deactivationPassword}
                  onChange={(e) => setDeactivationPassword(e.target.value)}
                  disabled={deactivating}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Código 2FA</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  value={deactivationCode}
                  onChange={(e) => setDeactivationCode(e.target.value.replace(/\D/g, ""))}
                  className="text-center text-xl tracking-widest font-mono"
                  disabled={deactivating}
                />
                <p className="text-xs text-muted-foreground">
                  Digite o código do app ou use um código de backup (XXXX-XXXX)
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={handleCancelDeactivation}
                disabled={deactivating}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleConfirmDeactivation}
                disabled={deactivating || !deactivationPassword || !deactivationCode}
                isLoading={deactivating}
                className="flex-1"
              >
                <Lock className="w-4 h-4 mr-2" />
                Desativar 2FA
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* FLUXO DE REGENERAÇÃO DE BACKUP CODES */}
      {isRegenerating && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Regenerar Códigos de Backup</CardTitle>
            <CardDescription>
              Digite um código 2FA para gerar novos códigos de backup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!newBackupCodes ? (
              <>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Os códigos antigos serão <strong>invalidados</strong> após gerar novos códigos.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Código 2FA Atual</label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    value={regenerationCode}
                    onChange={(e) => setRegenerationCode(e.target.value.replace(/\D/g, ""))}
                    className="text-center text-xl tracking-widest font-mono"
                    disabled={regenerating}
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleCancelRegeneration}
                    disabled={regenerating}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleConfirmRegeneration}
                    disabled={regenerating || regenerationCode.length !== 6}
                    isLoading={regenerating}
                    className="flex-1"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Gerar Novos Códigos
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Alert className="border-success/50 bg-success/10">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <AlertDescription>
                    Novos códigos de backup gerados! Os códigos antigos foram invalidados.
                  </AlertDescription>
                </Alert>

                {/* Lista de Novos Códigos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {newBackupCodes.map((code, i) => (
                    <div 
                      key={i} 
                      className="flex items-center justify-between p-3 bg-muted rounded"
                    >
                      <span className="font-mono text-sm font-semibold">{code}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(code)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Ações */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => downloadBackupCodes(newBackupCodes)}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Códigos
                  </Button>
                  <Button
                    onClick={() => {
                      copyToClipboard(newBackupCodes.join("\n"));
                    }}
                    className="flex-1"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Todos
                  </Button>
                </div>

                <Button 
                  variant="secondary" 
                  onClick={handleCancelRegeneration}
                  className="w-full"
                >
                  Fechar
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Informações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Como funciona o 2FA?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            A autenticação em dois fatores adiciona uma camada extra de segurança 
            exigindo não apenas sua senha, mas também um código temporário gerado 
            por um aplicativo autenticador.
          </p>
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">Apps recomendados:</h4>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Google Authenticator (Android/iOS)</li>
              <li>Microsoft Authenticator (Android/iOS)</li>
              <li>Authy (Android/iOS/Desktop)</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">Códigos de backup:</h4>
            <p>
              São códigos de uso único que permitem acessar sua conta caso você 
              perca acesso ao app autenticador. Guarde-os em local seguro 
              (gerenciador de senhas, papel em cofre, etc.).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
