'use client';

import { useState, useEffect } from 'react';
import ConsentCheckboxes from './ConsentCheckboxes';

interface PendingConsent {
  document_type: string;
  document_type_display: string;
  version: string;
  content_url: string;
}

interface ConsentModalProps {
  apiUrl?: string;
}

export default function ConsentModal({ apiUrl = '' }: ConsentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingConsents, setPendingConsents] = useState<PendingConsent[]>([]);
  const [loading, setLoading] = useState(false);
  const [consents, setConsents] = useState({
    terms: false,
    privacy: false,
    lgpd: false,
    marketing: false,
  });

  useEffect(() => {
    checkPendingConsents();
  }, []);

  const checkPendingConsents = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch(`${apiUrl}/api/consent/user-consents/pending/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) return;

      const data = await response.json();

      if (data.has_pending) {
        setPendingConsents(data.pending_consents);
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Erro ao verificar consentimentos:', error);
    }
  };

  const handleAccept = async () => {
    // Validar se todos os obrigatórios foram aceitos
    if (!consents.terms || !consents.privacy || !consents.lgpd) {
      alert('Você deve aceitar todos os termos obrigatórios para continuar.');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access_token');
      
      const consentsData = [
        { document_type: 'terms', version: '1.0' },
        { document_type: 'privacy', version: '1.0' },
        { document_type: 'lgpd', version: '1.0' },
      ];

      if (consents.marketing) {
        consentsData.push({ document_type: 'marketing', version: '1.0' });
      }

      const response = await fetch(`${apiUrl}/api/consent/user-consents/accept/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ consents: consentsData }),
      });

      if (response.ok) {
        setIsOpen(false);
      } else {
        throw new Error('Erro ao aceitar termos');
      }
    } catch (error) {
      console.error('Erro ao aceitar consentimentos:', error);
      alert('Erro ao salvar seus consentimentos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="mx-auto max-w-2xl w-full bg-white rounded-xl shadow-2xl">
          <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              📋 Atualização de Termos
            </h2>

            <p className="text-gray-600 mb-6">
              Nossos termos foram atualizados. Por favor, revise e aceite para 
              continuar usando a plataforma.
            </p>

            {/* Lista de termos atualizados */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-primary-900 mb-2">
                Documentos Atualizados:
              </h3>
              <ul className="space-y-1">
                {pendingConsents.map((consent) => (
                  <li key={consent.document_type} className="text-primary-800">
                    • {consent.document_type_display} (v{consent.version})
                  </li>
                ))}
              </ul>
            </div>

            {/* Checkboxes */}
            <ConsentCheckboxes
              showMarketing={false}
              onConsentChange={setConsents}
            />

            {/* Botão */}
            <div className="mt-8">
              <button
                onClick={handleAccept}
                disabled={loading || !consents.terms || !consents.privacy || !consents.lgpd}
                className="w-full bg-primary-600 text-gray-900 py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Salvando...' : 'Aceitar e Continuar'}
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              Você deve aceitar os termos atualizados para continuar usando o Ouvy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
