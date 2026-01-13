'use client';

import { useState } from 'react';

interface SuccessCardProps {
  protocolo: string;
  onClose?: () => void;
}

export default function SuccessCard({ protocolo, onClose }: SuccessCardProps) {
  const [copied, setCopied] = useState(false);

  const copiarProtocolo = () => {
    navigator.clipboard.writeText(protocolo);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-slide-up">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Feedback Enviado!</h2>
          <p className="text-green-100">
            Obrigado por sua manifestação
          </p>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-6">
          {/* Protocolo em destaque */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-5 border-2 border-primary/20">
            <p className="text-sm text-text-secondary mb-2 text-center font-medium">
              Seu código de protocolo:
            </p>
            <div className="bg-white rounded-lg p-4 border-2 border-dashed border-primary/30">
              <p className="text-2xl font-bold text-center text-secondary font-mono tracking-wider">
                {protocolo}
              </p>
            </div>
          </div>

          {/* Botão de Copiar */}
          <button
            onClick={copiarProtocolo}
            className="w-full bg-primary hover:opacity-90 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
          >
            {copied ? (
              <>
                <span className="mr-2">✓</span>
                Copiado!
              </>
            ) : (
              <>
                <span className="mr-2">📋</span>
                Copiar Protocolo
              </>
            )}
          </button>

          {/* Aviso importante */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex items-start">
              <span className="text-2xl mr-3">⚠️</span>
              <div>
                <p className="font-semibold text-yellow-800 mb-1">
                  Importante!
                </p>
                <p className="text-sm text-yellow-700">
                  Guarde este código para acompanhar o status da sua manifestação. 
                  Você pode consultar a qualquer momento.
                </p>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="space-y-3">
            <a
              href="/acompanhar"
              className="block w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 text-center"
            >
              🔍 Acompanhar Status Agora
            </a>
            
            <button
              onClick={onClose}
              className="block w-full bg-neutral-100 hover:bg-neutral-200 text-secondary font-bold py-3 px-6 rounded-lg transition-all duration-300 text-center"
            >
              Fechar
            </button>
          </div>

          {/* Informação adicional */}
          <p className="text-xs text-text-secondary text-center">
            Você também pode acessar <strong>/acompanhar</strong> a qualquer momento
          </p>
        </div>
      </div>
    </div>
  );
}
