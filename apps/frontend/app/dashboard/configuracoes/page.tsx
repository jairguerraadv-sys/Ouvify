"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TenantBanner } from "@/components/TenantBanner";
import { BrandingPreview } from "@/components/BrandingPreview";
import { useTenantTheme } from "@/hooks/use-tenant-theme";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/components/OnboardingTour";
import { useState, useEffect, useRef } from "react";
import { Save, Upload, Building2, Palette, Settings, Image as ImageIcon, Loader2, HelpCircle, PlayCircle, BookOpen, MessageCircle } from "lucide-react";
import { uploadBrandingImages, updateBrandingSettings, validateImageFile, createImagePreview, revokeImagePreview } from "@/lib/branding-upload";
import { toast } from "sonner";

export default function ConfiguracoesPage() {
  return (
    <ProtectedRoute>
      <ConfiguracoesContent />
    </ProtectedRoute>
  );
}

function ConfiguracoesContent() {
  const { user } = useAuth();
  const theme = useTenantTheme();
  const { restartTour } = useOnboarding();
  const [tenant, setTenant] = useState<any>(null);
  const [corPrimaria, setCorPrimaria] = useState('#3B82F6');
  const [corSecundaria, setCorSecundaria] = useState('#10B981');
  const [corTexto, setCorTexto] = useState('#1F2937');
  const [fonteCustomizada, setFonteCustomizada] = useState('Inter');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("tenant_data");
      if (stored) {
        setTenant(JSON.parse(stored));
      }
    }
  }, []);

  useEffect(() => {
    if (theme) {
      setCorPrimaria(theme.cor_primaria || '#3B82F6');
      setCorSecundaria(theme.cor_secundaria || '#10B981');
      setCorTexto(theme.cor_texto || '#1F2937');
      setFonteCustomizada(theme.fonte_customizada || 'Inter');
      setLogoPreview(theme.logo || null);
      setFaviconPreview(theme.favicon || null);
    }
  }, [theme]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file, 5);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    const preview = createImagePreview(file);
    setLogoPreview(preview);
  };

  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file, 1);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    const preview = createImagePreview(file);
    setFaviconPreview(preview);
  };

  const handleUploadImages = async () => {
    const logoFile = logoInputRef.current?.files?.[0];
    const faviconFile = faviconInputRef.current?.files?.[0];

    if (!logoFile && !faviconFile) {
      toast.error('Selecione ao menos uma imagem para enviar');
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadBrandingImages(logoFile, faviconFile);
      
      if (result.errors.length > 0) {
        result.errors.forEach(err => toast.error(err.message));
      } else {
        toast.success('Imagens enviadas com sucesso!');
        // Recarregar tema
        window.location.reload();
      }
    } catch (error) {
      toast.error('Erro ao enviar imagens');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateBrandingSettings({
        cor_primaria: corPrimaria,
        cor_secundaria: corSecundaria,
        cor_texto: corTexto,
        fonte_customizada: fonteCustomizada,
      });
      
      toast.success('Configurações salvas com sucesso!');
      // Recarregar tema
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar user={user || undefined} />
      
      <main className="flex-1 p-6 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <Settings className="w-6 h-6" />
              Configurações
            </h1>
            <p className="text-muted-foreground text-sm">Personalize sua experiência</p>
          </div>
        </header>

        {/* ✅ Banner com preview do White Label */}
        <TenantBanner />

        {/* Layout de duas colunas: Formulário + Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coluna Esquerda: Formulários */}
          <div className="space-y-6">
            {/* Informações da Empresa */}
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Informações da Empresa
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome da Empresa</label>
                  <Input 
                    defaultValue={theme?.nome || tenant?.nome_empresa || "Minha Empresa"} 
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subdomínio</label>
                  <Input 
                    defaultValue={theme?.subdominio || tenant?.subdominio || "minhaempresa"} 
                    disabled
                    className="bg-muted font-mono"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Seu subdomínio não pode ser alterado após o cadastro
                  </p>
                </div>
              </div>
            </Card>

            {/* White Label */}
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5" />
                White Label
              </h3>
              <div className="space-y-6">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Logo da Empresa
                </label>
                {logoPreview && (
                  <div className="mb-3 p-4 bg-muted rounded-lg">
                    <div 
                      className="logo-tenant w-32 h-32 mx-auto"
                      style={{ backgroundImage: `url(${logoPreview})` }}
                    />
                  </div>
                )}
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleLogoChange}
                  className="hidden"
                  id="logo-upload"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => logoInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Selecionar Logo
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  Formatos: PNG, JPG, WebP | Máximo: 2MB
                  <br />
                  Recomendado: PNG com fundo transparente (500x200px)
                </p>
              </div>

              {/* Favicon Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Favicon</label>
                {faviconPreview && (
                  <div className="mb-3 p-4 bg-muted rounded-lg inline-block">
                    <img 
                      src={faviconPreview} 
                      alt="Favicon" 
                      className="w-8 h-8"
                    />
                  </div>
                )}
                <input
                  ref={faviconInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFaviconChange}
                  className="hidden"
                  id="favicon-upload"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => faviconInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Selecionar Favicon
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  Deve ser quadrado | Máximo: 1MB
                </p>
              </div>

              {/* Botão de Upload */}
              {(logoInputRef.current?.files?.[0] || faviconInputRef.current?.files?.[0]) && (
                <Button 
                  onClick={handleUploadImages} 
                  disabled={isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Enviar Imagens
                    </>
                  )}
                </Button>
              )}

              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">Cores e Tipografia</h4>
                
                {/* Cor Primária */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Cor Primária</label>
                  <div className="flex gap-2">
                    <Input 
                      type="color" 
                      value={corPrimaria}
                      onChange={(e) => setCorPrimaria(e.target.value)}
                      className="w-20 h-10 cursor-pointer" 
                    />
                    <Input 
                      type="text" 
                      value={corPrimaria}
                      onChange={(e) => setCorPrimaria(e.target.value)}
                      className="font-mono" 
                      placeholder="#3B82F6"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Cor principal dos botões e links
                  </p>
                </div>

                {/* Cor Secundária */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Cor Secundária</label>
                  <div className="flex gap-2">
                    <Input 
                      type="color" 
                      value={corSecundaria}
                      onChange={(e) => setCorSecundaria(e.target.value)}
                      className="w-20 h-10 cursor-pointer" 
                    />
                    <Input 
                      type="text" 
                      value={corSecundaria}
                      onChange={(e) => setCorSecundaria(e.target.value)}
                      className="font-mono" 
                      placeholder="#10B981"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Cor de destaques e badges
                  </p>
                </div>

                {/* Cor de Texto */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Cor do Texto</label>
                  <div className="flex gap-2">
                    <Input 
                      type="color" 
                      value={corTexto}
                      onChange={(e) => setCorTexto(e.target.value)}
                      className="w-20 h-10 cursor-pointer" 
                    />
                    <Input 
                      type="text" 
                      value={corTexto}
                      onChange={(e) => setCorTexto(e.target.value)}
                      className="font-mono" 
                      placeholder="#1F2937"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Cor principal do texto
                  </p>
                </div>

                {/* Fonte Customizada */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Fonte (Google Fonts)</label>
                  <Input 
                    type="text" 
                    value={fonteCustomizada}
                    onChange={(e) => setFonteCustomizada(e.target.value)}
                    placeholder="Inter"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Ex: Inter, Roboto, Poppins, Montserrat
                  </p>
                </div>

                {/* Botão de Salvar */}
                <Button 
                  onClick={handleSaveSettings} 
                  disabled={isSaving}
                  className="w-full"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar Configurações
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Preview de Componentes */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Preview dos Componentes</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Botões</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="default">Primário</Button>
                  <Button variant="secondary">Secundário</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">Badges</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">Inputs</p>
                <Input placeholder="Digite algo..." />
              </div>
            </div>
          </Card>

          {/* Notificações */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">🔔 Notificações</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="accent-primary" />
                <span className="text-sm">Novos feedbacks</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="accent-primary" />
                <span className="text-sm">Respostas de usuários</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-primary" />
                <span className="text-sm">Relatórios semanais</span>
              </label>
            </div>
          </Card>

          {/* Ajuda & Tour */}
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Ajuda & Tour
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Precisa de ajuda? Refaça o tour guiado ou acesse nossa central de ajuda.
            </p>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={() => {
                  restartTour();
                  toast.success('Tour reiniciado! Navegue pelo dashboard para ver as dicas.');
                }}
              >
                <PlayCircle className="w-4 h-4" />
                Refazer Tour Guiado
              </Button>
              <a href="https://docs.ouvify.com" target="_blank" rel="noopener noreferrer" className="w-full">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  Central de Ajuda
                </Button>
              </a>
              <a href="mailto:suporte@ouvify.com" className="w-full">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contato com Suporte
                </Button>
              </a>
            </div>
          </Card>

          {/* Zona de Perigo */}
          <Card className="p-6 border-red-200 bg-red-50">
            <h3 className="text-lg font-medium mb-2 text-red-800">⚠️ Zona de Perigo</h3>
            <p className="text-sm text-red-700 mb-4">
              Ações irreversíveis que afetam toda a conta
            </p>
            <Button variant="destructive">Desativar Conta</Button>
          </Card>
        </div>

        {/* Coluna Direita: Preview em Tempo Real */}
        <div className="hidden lg:block">
          <BrandingPreview 
            corPrimaria={corPrimaria}
            corSecundaria={corSecundaria}
            logoUrl={logoPreview || theme?.logo || ''}
          />
        </div>
      </div>
    </main>
  </div>
  );
}
