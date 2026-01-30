import { Metadata } from 'next';
import Link from 'next/link';
import { Cookie, Settings, Lock, BarChart3, Target, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Política de Cookies | Ouvify - Plataforma de Feedback',
  description: 'Saiba como a Ouvify usa cookies para melhorar sua experiência. Gerencie suas preferências de cookies.',
  openGraph: {
    title: 'Política de Cookies | Ouvify',
    description: 'Como usamos cookies na plataforma Ouvify',
  },
};

export default function CookiesPage() {
  const cookieTypes = [
    {
      icon: Lock,
      name: 'Essenciais',
      description: 'Necessários para o funcionamento básico do site. Não podem ser desativados.',
      examples: ['Autenticação de sessão', 'Preferências de idioma', 'Segurança'],
      required: true,
    },
    {
      icon: BarChart3,
      name: 'Analíticos',
      description: 'Nos ajudam a entender como os visitantes interagem com o site.',
      examples: ['Google Analytics', 'Hotjar', 'Métricas de uso'],
      required: false,
    },
    {
      icon: Settings,
      name: 'Funcionais',
      description: 'Permitem funcionalidades avançadas e personalização.',
      examples: ['Chat de suporte', 'Preferências de tema', 'Widgets'],
      required: false,
    },
    {
      icon: Target,
      name: 'Marketing',
      description: 'Usados para entregar anúncios relevantes.',
      examples: ['Retargeting', 'Conversões', 'Atribuição'],
      required: false,
    },
  ];

  return (
    <main className="min-h-screen bg-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-30" />
      
      <div className="container mx-auto px-4 py-16 max-w-4xl relative z-10">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4 bg-white rounded-2xl p-8 shadow-lg border border-border">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-4">
                <Cookie className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-primary">
              Política de Cookies
            </h1>
            <p className="text-muted-foreground">
              Última atualização: 23 de janeiro de 2026
            </p>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Esta política explica como usamos cookies e tecnologias similares 
              para melhorar sua experiência na plataforma Ouvify.
            </p>
          </div>

          {/* O que são cookies */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-border space-y-6">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-secondary">
                O que são Cookies?
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Cookies são pequenos arquivos de texto que são armazenados no seu dispositivo 
                (computador, tablet ou celular) quando você visita um site. Eles são amplamente 
                usados para fazer os sites funcionarem de forma mais eficiente e fornecer 
                informações aos proprietários do site.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                No Ouvify, usamos cookies para:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Manter você conectado à sua conta</li>
                <li>Lembrar suas preferências e configurações</li>
                <li>Entender como você usa nossa plataforma</li>
                <li>Melhorar nossos serviços</li>
                <li>Garantir a segurança da sua conta</li>
              </ul>
            </section>
          </div>

          {/* Tipos de Cookies */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-border space-y-6">
            <h2 className="text-2xl font-semibold text-secondary mb-6">
              Tipos de Cookies que Usamos
            </h2>
            
            <div className="grid gap-6">
              {cookieTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <div 
                    key={type.name}
                    className="border border-border rounded-xl p-6 space-y-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`rounded-lg p-2 ${type.required ? 'bg-primary/10' : 'bg-secondary/10'}`}>
                        <Icon className={`w-6 h-6 ${type.required ? 'text-primary' : 'text-secondary'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{type.name}</h3>
                          {type.required && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              Obrigatório
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                    </div>
                    <div className="pl-14">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Exemplos:</p>
                      <div className="flex flex-wrap gap-2">
                        {type.examples.map((example) => (
                          <span 
                            key={example}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                          >
                            {example}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gerenciamento */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-border space-y-6">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-secondary flex items-center gap-2">
                <Settings className="w-6 h-6" />
                Gerenciar Cookies
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Você pode controlar e gerenciar cookies de várias maneiras:
              </p>
              
              <div className="space-y-4 pl-4">
                <div>
                  <h4 className="font-semibold">Configurações do Navegador</h4>
                  <p className="text-sm text-muted-foreground">
                    A maioria dos navegadores permite que você recuse ou aceite cookies, 
                    exclua cookies existentes e defina preferências para determinados sites.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold">Banner de Cookies</h4>
                  <p className="text-sm text-muted-foreground">
                    Ao visitar nosso site pela primeira vez, você verá um banner onde pode 
                    personalizar suas preferências de cookies.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold">Configurações da Conta</h4>
                  <p className="text-sm text-muted-foreground">
                    Se você tem uma conta Ouvify, pode gerenciar suas preferências de privacidade 
                    nas configurações do perfil.
                  </p>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-yellow-800">
                  <strong>Importante:</strong> Bloquear todos os cookies pode afetar a funcionalidade 
                  do site. Alguns recursos podem não funcionar corretamente sem cookies essenciais.
                </p>
              </div>
            </section>
          </div>

          {/* Cookies de terceiros */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-border space-y-6">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-secondary">
                Cookies de Terceiros
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Alguns cookies são colocados por serviços de terceiros que aparecem em nossas páginas. 
                Trabalhamos com os seguintes parceiros:
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 font-semibold">Serviço</th>
                      <th className="text-left py-3 font-semibold">Finalidade</th>
                      <th className="text-left py-3 font-semibold">Política</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b">
                      <td className="py-3">Stripe</td>
                      <td className="py-3">Processamento de pagamentos</td>
                      <td className="py-3">
                        <a href="https://stripe.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                          Ver política
                        </a>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3">Sentry</td>
                      <td className="py-3">Monitoramento de erros</td>
                      <td className="py-3">
                        <a href="https://sentry.io/privacy/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                          Ver política
                        </a>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3">Vercel</td>
                      <td className="py-3">Analytics e hosting</td>
                      <td className="py-3">
                        <a href="https://vercel.com/legal/privacy-policy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                          Ver política
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Contato */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-border space-y-6">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-secondary">
                Dúvidas?
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Se você tiver alguma dúvida sobre nossa política de cookies, entre em contato:
              </p>
              <div className="bg-secondary/5 rounded-lg p-4 space-y-2">
                <p className="text-muted-foreground">
                  <strong>Email:</strong>{' '}
                  <a href="mailto:privacidade@ouvy.com" className="text-primary hover:underline">
                    privacidade@ouvy.com
                  </a>
                </p>
              </div>
            </section>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-8 border-t">
            <Link href="/privacidade">
              <Button variant="default">
                <Shield className="w-4 h-4 mr-2" />
                Política de Privacidade
              </Button>
            </Link>
            <Link href="/lgpd">
              <Button variant="outline">
                Direitos LGPD
              </Button>
            </Link>
            <Link href="/termos">
              <Button variant="ghost">
                Termos de Uso
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
