'use client';

import { ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface BrandingPreviewProps {
  corPrimaria?: string;
  corSecundaria?: string;
  logoUrl?: string;
}

/**
 * BrandingPreview - Pré-visualização em tempo real da página pública de feedbacks
 * 
 * Mostra como os clientes verão a página com as cores e logo configuradas.
 * Atualiza instantaneamente conforme o usuário modifica as configurações.
 */
export function BrandingPreview({
  corPrimaria = '#3B82F6',
  corSecundaria = '#1E40AF',
  logoUrl = '',
}: BrandingPreviewProps) {
  const { user } = useAuth();
  
  // Pegar tenant do localStorage
  const tenant = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('tenant_data') || '{}')
    : {};
  
  const publicUrl = tenant?.subdominio
    ? `https://${tenant.subdominio}.ouvy.com/enviar`
    : '#';

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden sticky top-6">
      {/* Header do Preview */}
      <div className="bg-gradient-to-r from-primary-50 to-indigo-50 border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Pré-visualização</h3>
            <p className="text-xs text-gray-600 mt-0.5">
              Como seus clientes verão a página
            </p>
          </div>
          
          {tenant?.subdominio && (
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors"
            >
              <span>Abrir página</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Preview Frame */}
      <div className="p-6 bg-gray-50">
        {/* Simulação da página pública */}
        <div 
          className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 transition-all duration-300"
          style={{ 
            minHeight: '500px',
            maxHeight: '600px',
          }}
        >
          {/* Header da página pública com branding */}
          <div
            className="px-6 py-8 transition-colors duration-300"
            style={{ backgroundColor: corPrimaria }}
          >
            <div className="flex items-center justify-center mb-4">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="h-12 w-auto object-contain"
                  onError={(e) => {
                    // Fallback caso a imagem não carregue
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-gray-900 text-xl font-bold">
                    {tenant?.empresa?.[0]?.toUpperCase() || 'L'}
                  </span>
                </div>
              )}
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
              {tenant?.empresa || 'Sua Empresa'}
            </h1>
            <p className="text-gray-900/90 text-center text-sm">
              Envie seu feedback, sugestão ou elogio
            </p>
          </div>

          {/* Formulário de feedback (simplificado) */}
          <div className="p-6">
            <form className="space-y-4">
              {/* Tipo de Feedback */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Feedback
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    className="px-3 py-2 text-sm font-medium rounded-md transition-colors border-2"
                    style={{
                      borderColor: corSecundaria,
                      color: corSecundaria,
                      backgroundColor: 'transparent',
                    }}
                  >
                    💡 Sugestão
                  </button>
                  <button
                    type="button"
                    className="px-3 py-2 text-sm font-medium rounded-md border-2 border-gray-200 text-gray-600 bg-transparent"
                  >
                    🐛 Problema
                  </button>
                  <button
                    type="button"
                    className="px-3 py-2 text-sm font-medium rounded-md border-2 border-gray-200 text-gray-600 bg-transparent"
                  >
                    👏 Elogio
                  </button>
                </div>
              </div>

              {/* Mensagem */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sua Mensagem
                </label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-shadow"
                  placeholder="Descreva seu feedback..."
                  disabled
                />
              </div>

              {/* Email (opcional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seu Email (opcional)
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none"
                  placeholder="seu@email.com"
                  disabled
                />
              </div>

              {/* Botão de envio */}
              <button
                type="button"
                className="w-full py-3 text-gray-900 font-medium rounded-md transition-all duration-300 hover:shadow-lg"
                style={{
                  backgroundColor: corPrimaria,
                }}
                disabled
              >
                Enviar Feedback
              </button>
            </form>
          </div>
        </div>

        {/* Legenda informativa */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            ✨ As alterações aparecem em tempo real
          </p>
        </div>
      </div>
    </div>
  );
}
