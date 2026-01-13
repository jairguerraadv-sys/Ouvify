'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { AlertCircle, CheckCircle, Loader, XCircle, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge-chip';

interface FormData {
  nome: string;
  email: string;
  senha: string;
  nome_empresa: string;
  subdominio_desejado: string;
}

interface Errors {
  [key: string]: string | string[];
}

interface ApiErrorResponse {
  detail?: string;
  errors?: {
    [key: string]: string[];
  };
  error?: string;
}

export default function CadastroPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    senha: '',
    nome_empresa: '',
    subdominio_desejado: '',
  });

  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [subdominioStatus, setSubdominioStatus] = useState<'available' | 'taken' | 'checking' | 'invalid' | null>(null);
  const subdominioTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  // Validar disponibilidade do subdomínio com debounce
  const checkSubdominioAvailability = async (subdominio: string) => {
    if (!subdominio || subdominio.length < 3) {
      setSubdominioStatus('invalid');
      return;
    }

    // Validar formato básico
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(subdominio)) {
      setSubdominioStatus('invalid');
      setErrors(prev => ({ ...prev, subdominio_desejado: 'Use apenas letras minúsculas, números e hífens' }));
      return;
    }

    // Palavras reservadas
    const reserved = ['www', 'api', 'admin', 'app', 'mail', 'ftp', 'smtp', 'ouvy'];
    if (reserved.includes(subdominio)) {
      setSubdominioStatus('taken');
      setErrors(prev => ({ ...prev, subdominio_desejado: 'Este subdomínio está reservado' }));
      return;
    }

    setSubdominioStatus('checking');
    
    try {
      // Verificar disponibilidade no backend
      const response = await axios.get(
        `${API_URL}/api/check-subdominio/`,
        { params: { subdominio } }
      );
      
      if (response.data.available) {
        setSubdominioStatus('available');
        setErrors(prev => {
          const { subdominio_desejado, ...rest } = prev;
          return rest;
        });
      } else {
        setSubdominioStatus('taken');
        setErrors(prev => ({ ...prev, subdominio_desejado: 'Este subdomínio já está em uso' }));
      }
    } catch (error) {
      // Se o endpoint não existir, considerar como disponível por padrão
      console.warn('Endpoint de verificação não implementado, assumindo disponível');
      setSubdominioStatus('available');
    }
  };

  // Validar e formatar subdomínio em tempo real
  const handleSubdominioChange = (value: string) => {
    const formatted = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/^-+|-+$/g, '');

    setFormData(prev => ({ ...prev, subdominio_desejado: formatted }));
    setErrors(prev => {
      const { subdominio_desejado, ...rest } = prev;
      return rest;
    });
    
    // Limpar timeout anterior
    if (subdominioTimeoutRef.current) {
      clearTimeout(subdominioTimeoutRef.current);
    }

    if (!formatted) {
      setSubdominioStatus(null);
      return;
    }

    // Debounce de 800ms para não sobrecarregar o backend
    subdominioTimeoutRef.current = setTimeout(() => {
      checkSubdominioAvailability(formatted);
    }, 800);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (subdominioTimeoutRef.current) {
        clearTimeout(subdominioTimeoutRef.current);
      }
    };
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    // Validar nome
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome completo é obrigatório';
    } else if (formData.nome.trim().split(' ').length < 2) {
      newErrors.nome = 'Digite seu nome completo';
    }

    // Validar email
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validar senha
    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 8) {
      newErrors.senha = 'Senha deve ter no mínimo 8 caracteres';
    } else if (!/[A-Za-z]/.test(formData.senha)) {
      newErrors.senha = 'Senha deve conter pelo menos uma letra';
    } else if (!/\d/.test(formData.senha)) {
      newErrors.senha = 'Senha deve conter pelo menos um número';
    }

    // Validar nome da empresa
    if (!formData.nome_empresa.trim()) {
      newErrors.nome_empresa = 'Nome da empresa é obrigatório';
    }

    // Validar subdomínio
    if (!formData.subdominio_desejado) {
      newErrors.subdominio_desejado = 'Subdomínio é obrigatório';
    } else if (formData.subdominio_desejado.length < 3) {
      newErrors.subdominio_desejado = 'Subdomínio deve ter no mínimo 3 caracteres';
    } else if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(formData.subdominio_desejado)) {
      newErrors.subdominio_desejado = 'Subdomínio inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Verificar se subdomínio está disponível antes de enviar
    if (subdominioStatus !== 'available') {
      setErrors({ subdominio_desejado: 'Aguarde a verificação do subdomínio' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await axios.post(
        `${API_URL}/api/register-tenant/`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Armazenar dados de autenticação
      const { token, tenant, user } = response.data;
      
      localStorage.setItem('auth_token', token);
      localStorage.setItem('tenant_id', tenant.id);
      localStorage.setItem('tenant_subdominio', tenant.subdominio);
      localStorage.setItem('user_name', user.first_name || user.username);
      
      setSuccess(true);
      
      // Redirecionar para dashboard após 2.5 segundos
      setTimeout(() => {
        // Em produção: window.location.href = `https://${tenant.subdominio}.ouvy.com/dashboard`;
        // Em desenvolvimento: usar localhost
        router.push('/dashboard');
      }, 2500);
      
    } catch (error: any) {
      console.error('❌ Erro ao criar conta:', error.response?.data || error);
      
      if (error.response?.data) {
        const apiError: ApiErrorResponse = error.response.data;
        
        // Tratar erros de validação do Django REST Framework
        if (apiError.errors) {
          const formattedErrors: Errors = {};
          
          Object.entries(apiError.errors).forEach(([field, messages]) => {
            // DRF retorna arrays de mensagens
            formattedErrors[field] = Array.isArray(messages) ? messages[0] : messages;
          });
          
          setErrors(formattedErrors);
        } 
        // Tratar mensagem de erro genérica
        else if (apiError.detail) {
          setErrors({ submit: apiError.detail });
        }
        // Tratar erro técnico
        else if (apiError.error) {
          setErrors({ submit: `Erro técnico: ${apiError.error}` });
        }
        // Fallback
        else {
          setErrors({ submit: 'Erro desconhecido ao criar conta' });
        }
      } 
      // Erro de rede ou servidor indisponível
      else if (error.request) {
        setErrors({ 
          submit: 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.' 
        });
      } 
      // Erro na configuração da requisição
      else {
        setErrors({ submit: 'Erro ao processar a requisição. Tente novamente.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'subdominio_desejado') {
      handleSubdominioChange(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-white via-neutral-50 to-cyan-50 flex items-center justify-center p-4">
        <Card variant="elevated" className="w-full max-w-md text-center">
          <CardHeader>
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-success" />
            </div>
            <h2 className="text-3xl font-bold text-secondary mb-2">Conta Criada!</h2>
            <p className="text-neutral-600">
              Bem-vindo ao Ouvy, {formData.nome.split(' ')[0]}!
            </p>
          </CardHeader>
          <div className="p-6">
            <p className="text-neutral-600 mb-6">
              Você será redirecionado para seu dashboard em segundos...
            </p>
            <div className="w-8 h-8 border-4 border-cyan-100 border-t-primary rounded-full animate-spin mx-auto"></div>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-neutral-50 to-cyan-50 pt-12 pb-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-6 hover:opacity-80 transition">
            <Logo variant="full" />
          </Link>
          <h1 className="text-4xl font-bold text-secondary mt-6 mb-2">
            Criar Conta
          </h1>
          <p className="text-neutral-600">
            Comece seu canal de ética agora
          </p>
        </div>

        {/* Form */}
        <Card variant="elevated">
          <form onSubmit={handleSubmit} className="p-8 space-y-4">
            {/* Erro geral */}
            {errors.submit && (
              <div className="bg-error/10 border border-error text-error rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Erro ao criar conta</p>
                  <p className="text-sm mt-1">
                    {typeof errors.submit === 'string' ? errors.submit : errors.submit[0]}
                  </p>
                </div>
              </div>
            )}

            {/* Nome Completo */}
            <div>
              <label className="block text-sm font-semibold text-secondary mb-2">
                Nome Completo
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="João Silva Santos"
                className={`w-full px-4 py-2.5 rounded-lg border transition focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.nome
                    ? 'border-error bg-error/5'
                    : 'border-neutral-200'
                }`}
              />
              {errors.nome && (
                <p className="text-error text-sm mt-1">
                  {typeof errors.nome === 'string' ? errors.nome : errors.nome[0]}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-secondary mb-2">
                Email Corporativo
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@empresa.com"
                className={`w-full px-4 py-2.5 rounded-lg border transition focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.email
                    ? 'border-error bg-error/5'
                    : 'border-neutral-200'
                }`}
              />
              {errors.email && (
                <p className="text-error text-sm mt-1">
                  {typeof errors.email === 'string' ? errors.email : errors.email[0]}
                </p>
              )}
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-semibold text-secondary mb-2">
                Senha
              </label>
              <input
                type="password"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                placeholder="Mín. 8 caracteres"
                className={`w-full px-4 py-2.5 rounded-lg border transition focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.senha
                    ? 'border-error bg-error/5'
                    : 'border-neutral-200'
                }`}
              />
              {errors.senha && (
                <p className="text-error text-sm mt-1">
                  {typeof errors.senha === 'string' ? errors.senha : errors.senha[0]}
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-neutral-600 font-medium">Dados da Empresa</span>
              </div>
            </div>

            {/* Nome da Empresa */}
            <div>
              <label className="block text-sm font-semibold text-secondary mb-2">
                Nome da Empresa
              </label>
              <input
                type="text"
                name="nome_empresa"
                value={formData.nome_empresa}
                onChange={handleChange}
                placeholder="Minha Empresa LTDA"
                className={`w-full px-4 py-2.5 rounded-lg border transition focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.nome_empresa
                    ? 'border-error bg-error/5'
                    : 'border-neutral-200'
                }`}
              />
              {errors.nome_empresa && (
                <p className="text-error text-sm mt-1">
                  {typeof errors.nome_empresa === 'string' ? errors.nome_empresa : errors.nome_empresa[0]}
                </p>
              )}
            </div>

            {/* Subdomínio */}
            <div>
              <label className="block text-sm font-semibold text-secondary mb-2">
                Seu Subdomínio
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  name="subdominio_desejado"
                  value={formData.subdominio_desejado}
                  onChange={handleChange}
                  placeholder="minhaempresa"
                  className={`flex-1 px-4 py-2.5 rounded-l-lg border transition focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.subdominio_desejado
                      ? 'border-error bg-error/5'
                      : 'border-neutral-200'
                  }`}
                />
                <div className="bg-neutral-100 px-3 py-2.5 rounded-r-lg border border-l-0 border-neutral-200 text-neutral-600 text-sm font-medium">
                  .ouvy.com
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                {subdominioStatus === 'checking' && (
                  <span className="text-sm text-neutral-500 flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    Verificando...
                  </span>
                )}
                {subdominioStatus === 'available' && (
                  <span className="text-sm text-success flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Disponível!
                  </span>
                )}
                {subdominioStatus === 'taken' && (
                  <span className="text-sm text-error flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Já está em uso
                  </span>
                )}
                {subdominioStatus === 'invalid' && (
                  <span className="text-sm text-warning flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Mínimo 3 caracteres válidos
                  </span>
                )}
              </div>
              {errors.subdominio_desejado && (
                <p className="text-error text-sm mt-1">
                  {typeof errors.subdominio_desejado === 'string' ? errors.subdominio_desejado : errors.subdominio_desejado[0]}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button 
              type="submit" 
              variant="default"
              size="lg"
              className="w-full" 
              isLoading={loading}
            >
              {loading ? "Criando conta..." : "Criar Conta Grátis"}
            </Button>

            {/* Login Link */}
            <p className="text-center text-neutral-600 text-sm">
              Já tem conta?{' '}
              <Link href="/login" className="text-primary font-semibold hover:opacity-80 transition">
                Entre aqui
              </Link>
            </p>
          </form>
        </Card>

        {/* Benefícios */}
        <div className="mt-10 space-y-3">
          <p className="text-sm text-neutral-600 font-medium mb-4">Incluso no plano:</p>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
            <span className="text-sm text-neutral-700">30 dias de teste grátis - sem cartão de crédito</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
            <span className="text-sm text-neutral-700">Suporte por email 24/7</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
            <span className="text-sm text-neutral-700">Personalizável com sua logo e cores</span>
          </div>
        </div>
      </div>
    </main>
  );
}
