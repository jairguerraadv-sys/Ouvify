'use client';

import { useState } from 'react';
import axios from 'axios';
import SuccessCard from '@/components/SuccessCard';

interface FormData {
  tipo: string;
  titulo: string;
  descricao: string;
  anonimo: boolean;
  email_contato: string;
}

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    tipo: 'denuncia',
    titulo: '',
    descricao: '',
    anonimo: false,
    email_contato: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [protocolo, setProtocolo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Detectar subdomínio do host atual
      const hostname = window.location.hostname;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || `http://${hostname}:8000`;
      
      const response = await axios.post(`${apiUrl}/api/feedbacks/`, formData);
      
      // Salvar protocolo retornado
      setProtocolo(response.data.protocolo);
      
      // Limpar formulário
      setFormData({
        tipo: 'denuncia',
        titulo: '',
        descricao: '',
        anonimo: false,
        email_contato: ''
      });
    } catch (err: any) {
      console.error('Erro ao enviar feedback:', err);
      
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        setError('⚠️ Não foi possível conectar ao servidor. Verifique se o backend está rodando em http://localhost:8000');
      } else if (err.response?.status === 500) {
        setError('Erro no servidor. Tente novamente mais tarde.');
      } else {
        setError('Erro ao enviar feedback. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-2xl w-full bg-white shadow-2xl rounded-2xl overflow-hidden">
          
          {/* Header */}
          <div className="bg-primary text-white p-8 text-center">
            <h1 className="text-3xl font-bold mb-2">
              📢 Canal de Ouvidoria
            </h1>
            <p className="text-blue-100">
              Sua voz importa. Compartilhe sua experiência de forma segura.
            </p>
          </div>

          {/* Alerta de Backend Offline */}
          {error && error.includes('conectar ao servidor') && (
            <div className="bg-orange-50 border-l-4 border-orange-400 p-4 m-6">
              <div className="flex items-start">
                <span className="text-2xl mr-3">🔌</span>
                <div className="flex-1">
                  <p className="font-semibold text-orange-800 mb-1">
                    Backend Offline
                  </p>
                  <p className="text-sm text-orange-700 mb-2">
                    O servidor Django não está respondendo. Para testar o envio de feedbacks, inicie o backend:
                  </p>
                  <code className="block bg-orange-100 text-orange-900 p-2 rounded text-xs">
                    cd ouvy_saas && bash run_server.sh
                  </code>
                </div>
              </div>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Tipo de Feedback */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Tipo de Manifestação
              </label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-secondary"
                required
              >
                <option value="denuncia">🚨 Denúncia</option>
                <option value="sugestao">💡 Sugestão</option>
                <option value="reclamacao">😞 Reclamação</option>
                <option value="elogio">⭐ Elogio</option>
              </select>
            </div>

            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título
              </label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Resuma sua manifestação em poucas palavras"
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-secondary"
                required
                maxLength={200}
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Descrição
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descreva sua manifestação com detalhes..."
                rows={5}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-secondary resize-none"
                required
              />
            </div>

            {/* Checkbox Anônimo */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="anonimo"
                checked={formData.anonimo}
                onChange={(e) => setFormData({ ...formData, anonimo: e.target.checked })}
                className="mt-1 h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
              />
              <label htmlFor="anonimo" className="ml-3 text-sm text-secondary">
                <span className="font-medium">Enviar anonimamente</span>
                <p className="text-text-secondary mt-1">
                  Sua identidade será protegida. Não será possível responder diretamente.
                </p>
              </label>
            </div>

            {/* Email (se não for anônimo) */}
            {!formData.anonimo && (
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  E-mail para Contato
                </label>
                <input
                  type="email"
                  value={formData.email_contato}
                  onChange={(e) => setFormData({ ...formData, email_contato: e.target.value })}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-secondary"
                  required={!formData.anonimo}
                />
                <p className="mt-1 text-xs text-text-secondary">
                  Usaremos apenas para enviar atualizações sobre sua manifestação
                </p>
              </div>
            )}

            {/* Mensagem de Erro */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm flex items-center">
                  <span className="mr-2">⚠️</span>
                  {error}
                </p>
              </div>
            )}

            {/* Botão de Envio */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:opacity-90 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </span>
              ) : (
                '📤 Enviar Manifestação'
              )}
            </button>

            {/* Link para Acompanhar */}
            <div className="text-center pt-4 border-t border-neutral-200">
              <p className="text-sm text-text-secondary mb-2">
                Já enviou uma manifestação?
              </p>
              <a 
                href="/acompanhar" 
                className="text-primary hover:underline font-medium inline-flex items-center"
              >
                🔍 Acompanhar Status do Protocolo
              </a>
            </div>
          </form>

          {/* Footer */}
          <div className="bg-background-secondary px-8 py-4 text-center border-t border-neutral-200">
            <p className="text-xs text-text-secondary">
              🔒 Suas informações são tratadas com total confidencialidade
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              Powered by Ouvy SaaS
            </p>
          </div>
        </div>
      </main>

      {/* Modal de Sucesso */}
      {protocolo && (
        <SuccessCard 
          protocolo={protocolo} 
          onClose={() => setProtocolo(null)} 
        />
      )}
    </>
  );
}
