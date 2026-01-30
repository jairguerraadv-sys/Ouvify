'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { colors, typography, spacing, borderRadius, shadows } from '@/lib/design-tokens';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info, 
  Bell, 
  Settings, 
  User, 
  Mail,
  Copy,
  Check
} from 'lucide-react';

export default function DesignSystemPage() {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [progress, setProgress] = useState(66);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(label);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const ColorSwatch = ({ color, name, hex }: { color: string; name: string; hex: string }) => (
    <button
      onClick={() => copyToClipboard(hex, name)}
      className="group relative flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <div
        className="w-16 h-16 rounded-lg shadow-sm border border-gray-200 transition-transform group-hover:scale-105"
        style={{ backgroundColor: hex }}
      />
      <div className="text-center">
        <p className="text-xs font-medium text-gray-900">{name}</p>
        <p className="text-[10px] text-gray-500">{hex}</p>
      </div>
      {copiedColor === name && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded">
          Copied!
        </div>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">O</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Ouvify Design System</h1>
                <p className="text-sm text-gray-500">v1.0 • Janeiro 2026</p>
              </div>
            </div>
            <Badge variant="outline" className="hidden sm:flex">
              Development Preview
            </Badge>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="colors" className="w-full">
            <TabsList className="w-full justify-start bg-transparent h-12 p-0 gap-6">
              <TabsTrigger value="colors" className="data-[state=active]:border-b-2 data-[state=active]:border-primary-500 rounded-none bg-transparent">
                🎨 Cores
              </TabsTrigger>
              <TabsTrigger value="typography" className="data-[state=active]:border-b-2 data-[state=active]:border-primary-500 rounded-none bg-transparent">
                📝 Tipografia
              </TabsTrigger>
              <TabsTrigger value="components" className="data-[state=active]:border-b-2 data-[state=active]:border-primary-500 rounded-none bg-transparent">
                📦 Componentes
              </TabsTrigger>
              <TabsTrigger value="spacing" className="data-[state=active]:border-b-2 data-[state=active]:border-primary-500 rounded-none bg-transparent">
                📐 Espaçamento
              </TabsTrigger>
            </TabsList>

            <div className="py-8">
              {/* Colors Tab */}
              <TabsContent value="colors" className="mt-0">
                <div className="space-y-8">
                  {/* Primary Colors */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-primary-500" />
                        Primary (Brand)
                      </CardTitle>
                      <CardDescription>
                        Cor principal da marca. Usada em CTAs, links e elementos de destaque.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(colors.brand.primary).filter(([key]) => key !== 'DEFAULT').map(([shade, hex]) => (
                          <ColorSwatch key={shade} color={`primary-${shade}`} name={shade} hex={hex} />
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Secondary Colors */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-secondary-500" />
                        Secondary (Accent)
                      </CardTitle>
                      <CardDescription>
                        Cor secundária. Usada para elementos de destaque e variações.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(colors.brand.secondary).filter(([key]) => key !== 'DEFAULT').map(([shade, hex]) => (
                          <ColorSwatch key={shade} color={`secondary-${shade}`} name={shade} hex={hex} />
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Semantic Colors */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Cores Semânticas</CardTitle>
                      <CardDescription>
                        Cores para feedback e estados. Success, Warning, Error, Info.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-green-700">Success</h4>
                          <div className="flex gap-2">
                            <ColorSwatch color="success-light" name="light" hex={colors.semantic.success.light} />
                            <ColorSwatch color="success-main" name="main" hex={colors.semantic.success.main} />
                            <ColorSwatch color="success-dark" name="dark" hex={colors.semantic.success.dark} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-yellow-700">Warning</h4>
                          <div className="flex gap-2">
                            <ColorSwatch color="warning-light" name="light" hex={colors.semantic.warning.light} />
                            <ColorSwatch color="warning-main" name="main" hex={colors.semantic.warning.main} />
                            <ColorSwatch color="warning-dark" name="dark" hex={colors.semantic.warning.dark} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-red-700">Error</h4>
                          <div className="flex gap-2">
                            <ColorSwatch color="error-light" name="light" hex={colors.semantic.error.light} />
                            <ColorSwatch color="error-main" name="main" hex={colors.semantic.error.main} />
                            <ColorSwatch color="error-dark" name="dark" hex={colors.semantic.error.dark} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-cyan-700">Info</h4>
                          <div className="flex gap-2">
                            <ColorSwatch color="info-light" name="light" hex={colors.semantic.info.light} />
                            <ColorSwatch color="info-main" name="main" hex={colors.semantic.info.main} />
                            <ColorSwatch color="info-dark" name="dark" hex={colors.semantic.info.dark} />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Neutral Colors */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Neutras (Gray Scale)</CardTitle>
                      <CardDescription>
                        Usadas para texto, bordas e backgrounds.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(colors.neutral.gray).map(([shade, hex]) => (
                          <ColorSwatch key={shade} color={`gray-${shade}`} name={shade} hex={hex} />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Typography Tab */}
              <TabsContent value="typography" className="mt-0">
                <div className="space-y-8">
                  {/* Font Families */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Font Families</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Sans (Body) - Inter</p>
                        <p className="text-2xl font-sans">
                          The quick brown fox jumps over the lazy dog.
                        </p>
                      </div>
                      <Separator />
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Heading - Poppins</p>
                        <p className="text-2xl font-heading">
                          The quick brown fox jumps over the lazy dog.
                        </p>
                      </div>
                      <Separator />
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Mono - JetBrains Mono</p>
                        <p className="text-lg font-mono">
                          const message = &quot;Hello, Ouvify!&quot;;
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Font Sizes */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Font Sizes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-baseline gap-4">
                        <span className="text-xs text-gray-500 w-16">7xl</span>
                        <span className="text-7xl font-bold">Aa</span>
                      </div>
                      <div className="flex items-baseline gap-4">
                        <span className="text-xs text-gray-500 w-16">6xl</span>
                        <span className="text-6xl font-bold">Aa</span>
                      </div>
                      <div className="flex items-baseline gap-4">
                        <span className="text-xs text-gray-500 w-16">5xl</span>
                        <span className="text-5xl font-bold">Aa</span>
                      </div>
                      <div className="flex items-baseline gap-4">
                        <span className="text-xs text-gray-500 w-16">4xl</span>
                        <span className="text-4xl font-bold">Aa</span>
                      </div>
                      <div className="flex items-baseline gap-4">
                        <span className="text-xs text-gray-500 w-16">3xl</span>
                        <span className="text-3xl font-semibold">Aa</span>
                      </div>
                      <div className="flex items-baseline gap-4">
                        <span className="text-xs text-gray-500 w-16">2xl</span>
                        <span className="text-2xl font-semibold">Aa</span>
                      </div>
                      <div className="flex items-baseline gap-4">
                        <span className="text-xs text-gray-500 w-16">xl</span>
                        <span className="text-xl">Aa</span>
                      </div>
                      <div className="flex items-baseline gap-4">
                        <span className="text-xs text-gray-500 w-16">lg</span>
                        <span className="text-lg">Aa</span>
                      </div>
                      <div className="flex items-baseline gap-4">
                        <span className="text-xs text-gray-500 w-16">base</span>
                        <span className="text-base">Aa (16px default)</span>
                      </div>
                      <div className="flex items-baseline gap-4">
                        <span className="text-xs text-gray-500 w-16">sm</span>
                        <span className="text-sm">Aa</span>
                      </div>
                      <div className="flex items-baseline gap-4">
                        <span className="text-xs text-gray-500 w-16">xs</span>
                        <span className="text-xs">Aa</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Font Weights */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Font Weights</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-xl font-normal">Normal (400)</p>
                      <p className="text-xl font-medium">Medium (500)</p>
                      <p className="text-xl font-semibold">Semibold (600)</p>
                      <p className="text-xl font-bold">Bold (700)</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Components Tab */}
              <TabsContent value="components" className="mt-0">
                <div className="space-y-8">
                  {/* Buttons */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Buttons</CardTitle>
                      <CardDescription>Variantes e tamanhos de botões.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-700">Variantes</p>
                        <div className="flex flex-wrap gap-3">
                          <Button variant="default">Default</Button>
                          <Button variant="secondary">Secondary</Button>
                          <Button variant="outline">Outline</Button>
                          <Button variant="ghost">Ghost</Button>
                          <Button variant="link">Link</Button>
                          <Button variant="destructive">Destructive</Button>
                          <Button variant="success">Success</Button>
                          <Button variant="warning">Warning</Button>
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-700">Tamanhos</p>
                        <div className="flex flex-wrap items-center gap-3">
                          <Button size="sm">Small</Button>
                          <Button size="default">Default</Button>
                          <Button size="lg">Large</Button>
                          <Button size="icon"><Settings className="h-4 w-4" /></Button>
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-700">Estados</p>
                        <div className="flex flex-wrap items-center gap-3">
                          <Button>Normal</Button>
                          <Button disabled>Disabled</Button>
                          <Button className="animate-pulse">Loading...</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Badges */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Badges</CardTitle>
                      <CardDescription>Status e tags.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-3">
                        <Badge>Default</Badge>
                        <Badge variant="secondary">Secondary</Badge>
                        <Badge variant="outline">Outline</Badge>
                        <Badge variant="destructive">Destructive</Badge>
                        <Badge variant="success">Success</Badge>
                        <Badge variant="warning">Warning</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Inputs */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Inputs</CardTitle>
                      <CardDescription>Campos de formulário.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" placeholder="nome@exemplo.com" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Senha</Label>
                          <Input id="password" type="password" placeholder="••••••••" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="disabled">Desabilitado</Label>
                          <Input id="disabled" disabled placeholder="Não editável" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="error" className="text-red-500">Com erro</Label>
                          <Input id="error" className="border-red-500 focus:ring-red-500" placeholder="Campo inválido" />
                          <p className="text-xs text-red-500">Este campo é obrigatório.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Alerts */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Alerts</CardTitle>
                      <CardDescription>Mensagens de feedback.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Informação</AlertTitle>
                        <AlertDescription>Esta é uma mensagem informativa.</AlertDescription>
                      </Alert>
                      <Alert variant="success">
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>Sucesso!</AlertTitle>
                        <AlertDescription>Suas alterações foram salvas com sucesso.</AlertDescription>
                      </Alert>
                      <Alert variant="warning">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Atenção</AlertTitle>
                        <AlertDescription>Verifique os dados antes de continuar.</AlertDescription>
                      </Alert>
                      <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Erro</AlertTitle>
                        <AlertDescription>Ocorreu um erro ao processar sua solicitação.</AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>

                  {/* Cards */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Cards</CardTitle>
                      <CardDescription>Containers de conteúdo.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Plano Free</CardTitle>
                            <CardDescription>Para começar</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-3xl font-bold">R$ 0</p>
                            <p className="text-sm text-gray-500">/mês</p>
                          </CardContent>
                          <CardFooter>
                            <Button variant="outline" className="w-full">Selecionar</Button>
                          </CardFooter>
                        </Card>
                        <Card className="border-primary-500 shadow-md">
                          <CardHeader>
                            <Badge className="w-fit mb-2">Popular</Badge>
                            <CardTitle className="text-lg">Plano Pro</CardTitle>
                            <CardDescription>Para equipes</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-3xl font-bold text-primary-600">R$ 99</p>
                            <p className="text-sm text-gray-500">/mês</p>
                          </CardContent>
                          <CardFooter>
                            <Button className="w-full">Selecionar</Button>
                          </CardFooter>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Enterprise</CardTitle>
                            <CardDescription>Para grandes empresas</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-3xl font-bold">Sob consulta</p>
                            <p className="text-sm text-gray-500">&nbsp;</p>
                          </CardContent>
                          <CardFooter>
                            <Button variant="outline" className="w-full">Contato</Button>
                          </CardFooter>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Avatars */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Avatars</CardTitle>
                      <CardDescription>Imagens de perfil.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="https://github.com/shadcn.png" />
                          <AvatarFallback>SM</AvatarFallback>
                        </Avatar>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="https://github.com/shadcn.png" />
                          <AvatarFallback>MD</AvatarFallback>
                        </Avatar>
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="https://github.com/shadcn.png" />
                          <AvatarFallback>LG</AvatarFallback>
                        </Avatar>
                        <Avatar className="h-16 w-16">
                          <AvatarFallback className="text-xl">XL</AvatarFallback>
                        </Avatar>
                        <Avatar className="h-24 w-24">
                          <AvatarFallback className="text-2xl">2XL</AvatarFallback>
                        </Avatar>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Form Controls */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Form Controls</CardTitle>
                      <CardDescription>Switches, checkboxes e mais.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                          <Switch id="notifications" />
                          <Label htmlFor="notifications">Notificações</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox id="terms" />
                          <Label htmlFor="terms">Aceito os termos</Label>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Progresso ({progress}%)</Label>
                        <Progress value={progress} />
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setProgress(Math.max(0, progress - 10))}>-10</Button>
                          <Button size="sm" variant="outline" onClick={() => setProgress(Math.min(100, progress + 10))}>+10</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Skeleton */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Skeleton</CardTitle>
                      <CardDescription>Loading placeholders.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-4 w-[200px]" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Spacing Tab */}
              <TabsContent value="spacing" className="mt-0">
                <div className="space-y-8">
                  {/* Spacing Scale */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Spacing Scale</CardTitle>
                      <CardDescription>Base unit: 4px</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24].map((scale) => (
                          <div key={scale} className="flex items-center gap-4">
                            <span className="text-sm text-gray-500 w-8">{scale}</span>
                            <div
                              className="h-4 bg-primary-500 rounded"
                              style={{ width: `${scale * 4}px` }}
                            />
                            <span className="text-xs text-gray-400">{scale * 4}px</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Border Radius */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Border Radius</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-6">
                        {Object.entries(borderRadius).map(([name, value]) => (
                          <div key={name} className="flex flex-col items-center gap-2">
                            <div
                              className="w-16 h-16 bg-primary-500"
                              style={{ borderRadius: value }}
                            />
                            <span className="text-xs text-gray-600">{name}</span>
                            <span className="text-[10px] text-gray-400">{value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Shadows */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Shadows</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {['sm', 'DEFAULT', 'md', 'lg', 'xl', '2xl'].map((name) => (
                          <div key={name} className="flex flex-col items-center gap-2">
                            <div
                              className="w-20 h-20 bg-white rounded-lg"
                              style={{ boxShadow: shadows[name as keyof typeof shadows] }}
                            />
                            <span className="text-xs text-gray-600">{name}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </nav>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-500">
            Ouvify Design System • Built with Next.js, Tailwind CSS & shadcn/ui
          </p>
        </div>
      </footer>
    </div>
  );
}
