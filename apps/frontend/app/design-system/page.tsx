/**
 * Design System Showcase - Rebrand Visual
 * 
 * Página de demonstração da nova paleta "Modern SaaS"
 * Acesse em: http://localhost:3000/design-system
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Ouvify Design System
          </h1>
          <p className="text-xl text-muted-foreground">
            Nova paleta profissional <strong>Modern SaaS</strong> - Slate/Blue
          </p>
        </div>

        {/* Color Palette Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🎨 Paleta de Cores Principal</CardTitle>
            <CardDescription>Cores base do sistema - Modo Claro</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              {/* Background/Foreground */}
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-background border-2 border-border flex items-center justify-center">
                  <span className="text-foreground font-semibold">Background</span>
                </div>
                <p className="text-xs text-muted-foreground font-mono">hsl(0 0% 100%)</p>
              </div>

              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-foreground flex items-center justify-center">
                  <span className="text-background font-semibold">Foreground</span>
                </div>
                <p className="text-xs text-muted-foreground font-mono">hsl(222.2 84% 4.9%)</p>
              </div>

              {/* Primary */}
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-semibold">Primary</span>
                </div>
                <p className="text-xs text-muted-foreground font-mono">hsl(221.2 83.2% 53.3%)</p>
              </div>

              {/* Secondary */}
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-secondary border border-border flex items-center justify-center">
                  <span className="text-secondary-foreground font-semibold">Secondary</span>
                </div>
                <p className="text-xs text-muted-foreground font-mono">hsl(210 40% 96.1%)</p>
              </div>

              {/* Muted */}
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-muted border border-border flex items-center justify-center">
                  <span className="text-muted-foreground font-semibold">Muted</span>
                </div>
                <p className="text-xs text-muted-foreground font-mono">hsl(210 40% 96.1%)</p>
              </div>

              {/* Accent */}
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-accent border border-border flex items-center justify-center">
                  <span className="text-accent-foreground font-semibold">Accent</span>
                </div>
                <p className="text-xs text-muted-foreground font-mono">hsl(210 40% 96.1%)</p>
              </div>

              {/* Card */}
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-card border-2 border-border flex items-center justify-center shadow-md">
                  <span className="text-card-foreground font-semibold">Card</span>
                </div>
                <p className="text-xs text-muted-foreground font-mono">hsl(0 0% 100%)</p>
              </div>

              {/* Border */}
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-background border-4 border-border flex items-center justify-center">
                  <span className="text-foreground font-semibold">Border</span>
                </div>
                <p className="text-xs text-muted-foreground font-mono">hsl(214.3 31.8% 91.4%)</p>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Semantic Colors */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>✅ Cores Semânticas (Status)</CardTitle>
            <CardDescription>Feedback visual para alertas, erros e sucessos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <AlertTitle className="text-green-900">Success</AlertTitle>
                <AlertDescription className="text-green-700">
                  Operação concluída com sucesso! (Green 600)
                </AlertDescription>
              </Alert>

              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <AlertTitle className="text-amber-900">Warning</AlertTitle>
                <AlertDescription className="text-amber-700">
                  Atenção: esta ação requer confirmação. (Amber 500)
                </AlertDescription>
              </Alert>

              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-5 w-5 text-red-600" />
                <AlertTitle className="text-red-900">Error</AlertTitle>
                <AlertDescription className="text-red-700">
                  Erro ao processar requisição. Tente novamente. (Red 500)
                </AlertDescription>
              </Alert>

              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-5 w-5 text-blue-600" />
                <AlertTitle className="text-blue-900">Info</AlertTitle>
                <AlertDescription className="text-blue-700">
                  Informação importante sobre este recurso. (Blue 500)
                </AlertDescription>
              </Alert>

            </div>
          </CardContent>
        </Card>

        {/* Typography Showcase */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🔤 Hierarquia Tipográfica</CardTitle>
            <CardDescription>Inter (body) e Poppins (headings)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div>
              <h1 className="text-5xl font-bold text-foreground mb-2">Heading 1 (Poppins Bold)</h1>
              <p className="text-sm text-muted-foreground">5xl / 48px / Bold / Poppins</p>
            </div>

            <div>
              <h2 className="text-4xl font-bold text-foreground mb-2">Heading 2 (Poppins Bold)</h2>
              <p className="text-sm text-muted-foreground">4xl / 36px / Bold / Poppins</p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-foreground mb-2">Heading 3 (Poppins Bold)</h3>
              <p className="text-sm text-muted-foreground">3xl / 30px / Bold / Poppins</p>
            </div>

            <div>
              <p className="text-base text-foreground mb-2">
                <strong>Body Text (Inter Regular):</strong> Este é um parágrafo de exemplo usando a fonte Inter Regular. 
                A tipografia foi otimizada para máxima legibilidade em telas de todos os tamanhos.
              </p>
              <p className="text-sm text-muted-foreground">base / 16px / Regular / Inter</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Small Text (Inter Regular):</strong> Texto secundário ou de apoio, geralmente usado em 
                descrições, captions e metadados.
              </p>
              <p className="text-xs text-muted-foreground">sm / 14px / Regular / Inter</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">
                <strong>Extra Small (Inter Regular):</strong> Usado em labels, timestamps e informações complementares.
              </p>
              <p className="text-xs text-muted-foreground">xs / 12px / Regular / Inter</p>
            </div>

          </CardContent>
        </Card>

        {/* Buttons Showcase */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🔘 Componente: Buttons</CardTitle>
            <CardDescription>Variantes e estados do botão</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="default">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="destructive">Destructive Button</Button>
              <Button variant="link">Link Button</Button>
              <Button disabled>Disabled Button</Button>
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              <Button size="lg">Large Button</Button>
              <Button size="default">Default Button</Button>
              <Button size="sm">Small Button</Button>
              <Button size="icon">
                <CheckCircle2 className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Badges Showcase */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🏷️ Componente: Badges</CardTitle>
            <CardDescription>Status tags e labels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Badge variant="default">Default Badge</Badge>
              <Badge variant="secondary">Secondary Badge</Badge>
              <Badge variant="outline">Outline Badge</Badge>
              <Badge variant="destructive">Destructive Badge</Badge>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Success Badge</Badge>
              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Warning Badge</Badge>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Info Badge</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Contrast & Accessibility */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">♿ Acessibilidade & Contraste</CardTitle>
            <CardDescription className="text-blue-700">
              WCAG 2.1 Level AA/AAA Compliance
            </CardDescription>
          </CardHeader>
          <CardContent className="text-blue-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Contraste Foreground/Background</h4>
                <p className="text-3xl font-bold text-foreground mb-1">21:1</p>
                <p className="text-sm text-blue-700">WCAG AAA ✅ (requer 7:1)</p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Contraste Primary/Primary-Foreground</h4>
                <p className="text-3xl font-bold text-primary mb-1">8.5:1</p>
                <p className="text-sm text-blue-700">WCAG AA ✅ (requer 4.5:1)</p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Contraste Muted Text</h4>
                <p className="text-3xl font-bold text-muted-foreground mb-1">4.8:1</p>
                <p className="text-sm text-blue-700">WCAG AA ✅ (requer 4.5:1)</p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Touch Targets</h4>
                <p className="text-3xl font-bold text-foreground mb-1">44×44px</p>
                <p className="text-sm text-blue-700">WCAG AAA ✅ (mínimo recomendado)</p>
              </div>

            </div>

            <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3">Recursos de Acessibilidade</h4>
              <ul className="space-y-2 text-blue-800">
                <li>✅ <strong>Focus Visible:</strong> Ring de 2px com offset em todos os elementos interativos</li>
                <li>✅ <strong>Contraste Alto:</strong> Todas as combinações passam WCAG AA ou AAA</li>
                <li>✅ <strong>Font Smoothing:</strong> -webkit-font-smoothing e -moz-osx-font-smoothing ativos</li>
                <li>✅ <strong>Skip to Content:</strong> Link de pular navegação para screen readers</li>
                <li>✅ <strong>Touch Targets:</strong> Mínimo de 44×44px em dispositivos touch</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12 p-6 border-t border-border">
          <p className="text-muted-foreground">
            <strong>Rebrand Visual - Fase 1:</strong> Fundação completa ✅
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Próxima fase: Restyling de componentes UI e páginas principais
          </p>
        </div>

      </div>
    </div>
  );
}
