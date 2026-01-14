'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, CheckCircle, Loader, XCircle, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge-chip';
import { api, getErrorMessage } from '@/lib/api';
import { validateForm, validateSubdomain } from '@/lib/validation';
import { stripHtml } from '@/lib/sanitize';
import { storage, debounce } from '@/lib/helpers';
import type { RegisterData, AuthToken } from '@/lib/types';

interface FormErrors {
  [key: string]: string;
}

type SubdominioStatus = 'available' | 'taken' | 'checking' | 'invalid' | null;

export default function CadastroPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterData>({
    nome: '',
    email: '',
    senha: '',
    nome_empresa: '',
    subdominio_desejado: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [subdominioStatus, setSubdominioStatus] = useState<SubdominioStatus>(null);
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Validar disponibilidade do subdomínio com debounce
  const checkSubdominioAvailability = useCallback(async (subdominio: string) => {
    if (!subdominio || subdominio.length < 3) {
      setSubdominioStatus('invalid');
      return;
    }

    const validationError = validateSubdomain(subdominio);
    if (validationError) {
      setSubdominioStatus('invalid');
      setErrors(prev => ({ ...prev, subdominio_desejado: validationError }));
      return;
    }

    setSubdominioStatus('checking');
    
    try {
      const response = await api.get<{ available: boolean }>(
        '/api/check-subdominio/',
        { params: { subdominio } }
      );
      
      if (response.available) {
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
      console.warn('Endpoint de verificação não implementado, assumindo disponível');
      setSubdominioStatus('available');
    }
  }, []);

  // Debounced version
  const debouncedCheck = useCallback(
    debounce((subdominio: string) => checkSubdominioAvailability(subdominio), 800),
    [checkSubdominioAvailability]
  );

  // Validar e formatar subdomínio em tempo real
  const handleSubdominioChange = useCallback((value: string) => {
    const formatted = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/^-+|-+$/g, '');

    setFormData(prev => ({ ...prev, subdominio_desejado: formatted }));
    setErrors(prev => {
      const { subdominio_desejado, ...rest } = prev;
      return rest;
    });
    
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    if (!formatted) {
      setSubdominioStatus(null);
      return;
    }

    checkTimeoutRef.current = setTimeout(() => {
      checkSubdominioAvailability(formatted);
    }, 800);
  }, [checkSubdominioAvailability]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, []);

  // Validação do formulário
  const validate = useCallback((): boolean => {
    const validation = validateForm(formData, {
      nome: {
        required: true,
        message: 'Nome completo é obrigatório',
        custom: (value: string) => {
          if (value.trim().split(' ').length < 2) {
            return 'Digite seu nome completo';
          }
          return null;
        },
      },
      email: { required: true, type: 'email' },
      senha: { required: true, type: 'password' },
      nome_empresa: { required: true, message: 'Nome da empresa é obrigatório' },
      subdominio_desejado: {
        required: true,
        message: 'Subdomínio é obrigatório',
        custom: (value: string) => {
          if (value.length < 3) {
            return 'Subdomínio deve ter no mínimo 3 caracteres';
          }
          return validateSubdomain(value);
        },
      },
    });

    setErrors(validation.errors);
    return validation.isValid;
  }, [formData]);

  // Submit do formulário
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
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
      // Sanitizar dados antes de enviar para a API
      const sanitizedData = {
        ...formData,
        nome: stripHtml(formData.nome.trim()),
        email: stripHtml(formData.email.trim().toLowerCase()),
        nome_empresa: stripHtml(formData.nome_empresa.trim()),
        subdominio_desejado: formData.subdominio_desejado.toLowerCase().trim(),
      };
      
      const response = await api.post<AuthToken>('/api/register-tenant/', sanitizedData);

      // Armazenar dados de autenticação
      const { token, tenant, user } = response;
      
      storage.set('auth_token', token);
      storage.set('tenant_id', tenant?.id?.toString() || '');
      storage.set('tenant_subdominio', tenant?.subdominio || '');
      storage.set('user_name', user?.first_name || user?.username || '');
      
      setSuccess(true);
      
      // Redirecionar para dashboard após 2.5 segundos
      setTimeout(() => {
        router.push('/dashboard');
      }, 2500);
      
    } catch (error) {
      console.error('❌ Erro ao criar conta:', error);
      console.error('Dados enviados:', formData);
      
      // Log detalhado do erro
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        console.error('Response data:', axiosError.response?.data);
        console.error('Response status:', axiosError.response?.status);
        
        // Extrair erros de validação por campo
        const responseData = axiosError.response?.data;
        if (responseData?.errors && typeof responseData.errors === 'object') {
          const fieldErrors: FormErrors = {};
          
          Object.entries(responseData.errors).forEach(([field, messages]) => {
            const msgArray = Array.isArray(messages) ? messages : [messages];
            fieldErrors[field] = msgArray[0] as string;
          });
          
          setErrors(fieldErrors);
          return;
        }
      }
      
      const errorMessage = getErrorMessage(error);
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  }, [formData, validate, subdominioStatus, router]);

  // Handle input changes
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'subdominio_desejado') {
      handleSubdominioChange(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [handleSubdominioChange]);

  if (success) {
    return (
      <main className="min-h-screen bg-gradient-mesh flex items-center justify-center p-4">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-wave-pulse" />
        <Card variant="elevated" className="w-full max-w-md text-center relative z-10 animate-scale-in shadow-elegant">
          <CardHeader>
            <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-secondary-900 mb-2">
              Conta Criada!
            </h2>
            <p className="text-secondary-600">
              Bem-vindo ao <span className="text-gradient-primary font-semibold">Ouvy</span>, {formData.nome.split(' ')[0]}!
            </p>
          </CardHeader>
          <div className="p-6">
            <p className="text-secondary-600 mb-6">
              Você será redirecionado para seu dashboard em segundos...
            </p>
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto"></div>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-mesh pt-12 pb-12 px-4">
      {/* Elementos decorativos */}
      <div className="absolute top-40 right-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-40 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      
      <div className="max-w-md mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <Link href="/" className="inline-block mb-6 hover:scale-105 transition-transform">
            <Logo size="xl" />
          </Link>
          <h1 className="text-4xl font-bold text-secondary-900 mt-6 mb-2">
            Criar Conta
          </h1>
          <p className="text-secondary-600">
            Comece seu <span className="text-gradient-primary font-semibold">canal de ética</span> agora
          </p>
        </div>

        {/* Form */}
        <Card variant="elevated" className="shadow-elegant animate-slide-up">
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {/* Erro geral */}
            {errors.submit && (
              <div className="bg-error/10 border border-error/30 text-error rounded-lg p-4 flex gap-3 animate-slide-down">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Erro ao criar conta</p>
                  <p className="text-sm mt-1">
                    {errors.submit}
                  </p>
                </div>
              </div>
            )}

            {/* Nome Completo */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-secondary-900">
                Nome Completo
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="João Silva Santos"
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.nome
                    ? 'border-error bg-error/5'
                    : 'border-secondary-200 hover:border-secondary-300'
                }`}
              />
              {errors.nome && (
                <p className="text-error text-sm mt-1 flex items-center gap-1">
                  <span className="w-1 h-1 bg-error rounded-full" />
                  {errors.nome}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-secondary-900">
                Email Corporativo
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@empresa.com"
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.email
                    ? 'border-error bg-error/5'
                    : 'border-secondary-200 hover:border-secondary-300'
                }`}
              />
              {errors.email && (
                <p className="text-error text-sm mt-1 flex items-center gap-1">
                  <span className="w-1 h-1 bg-error rounded-full" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-secondary-900">
                Senha
              </label>
              <input
                type="password"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                placeholder="Mínimo 8 caracteres"
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.senha
                    ? 'border-error bg-error/5'
                    : 'border-secondary-200 hover:border-secondary-300'
                }`}
              />
              {errors.senha && (
                <p className="text-error text-sm mt-1 flex items-center gap-1">
                  <span className="w-1 h-1 bg-error rounded-full" />
                  {errors.senha}
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-secondary-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-secondary-600 font-semibold">Dados da Empresa</span>
              </div>
            </div>

            {/* Nome da Empresa */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-secondary-900">
                Nome da Empresa
              </label>
              <input
                type="text"
                name="nome_empresa"
                value={formData.nome_empresa}
                onChange={handleChange}
                placeholder="Minha Empresa LTDA"
                className={`w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.nome_empresa
                    ? 'border-error bg-error/5'
                    : 'border-secondary-200 hover:border-secondary-300'
                }`}
              />
              {errors.nome_empresa && (
                <p className="text-error text-sm mt-1 flex items-center gap-1">
                  <span className="w-1 h-1 bg-error rounded-full" />
                  {errors.nome_empresa}
                </p>
              )}
            </div>

            {/* Subdomínio */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-secondary-900">
                Seu Subdomínio
              </label>
              <div className="flex items-center rounded-lg overflow-hidden border border-secondary-200 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent transition-all duration-200">
                <input
                  type="text"
                  name="subdominio_desejado"
                  value={formData.subdominio_desejado}
                  onChange={handleChange}
                  placeholder="minhaempresa"
                  className={`flex-1 px-4 py-3 border-0 focus:ring-0 ${
                    errors.subdominio_desejado
                      ? 'bg-error/5'
                      : 'bg-transparent'
                  }`}
                />
                <div className="bg-gradient-primary-soft px-4 py-3 text-primary-700 text-sm font-semibold">
                  .ouvy.com
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                {subdominioStatus === 'checking' && (
                  <span className="text-sm text-secondary-500 flex items-center gap-2 font-medium">
                    <Loader className="w-4 h-4 animate-spin" />
                    Verificando...
                  </span>
                )}
                {subdominioStatus === 'available' && (
                  <span className="text-sm text-success flex items-center gap-2 font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    Disponível!
                  </span>
                )}
                {subdominioStatus === 'taken' && (
                  <span className="text-sm text-error flex items-center gap-2 font-semibold">
                    <XCircle className="w-4 h-4" />
                    Já está em uso
                  </span>
                )}
                {subdominioStatus === 'invalid' && (
                  <span className="text-sm text-warning flex items-center gap-2 font-semibold">
                    <AlertCircle className="w-4 h-4" />
                    Mínimo 3 caracteres válidos
                  </span>
                )}
              </div>
              {errors.subdominio_desejado && (
                <p className="text-error text-sm mt-1 flex items-center gap-1">
                  <span className="w-1 h-1 bg-error rounded-full" />
                  {errors.subdominio_desejado}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button 
              type="submit" 
              variant="default"
              size="lg"
              className="w-full shadow-elegant group" 
              isLoading={loading}
            >
              {loading ? "Criando conta..." : "Criar Conta Grátis"}
              {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </Button>

            {/* Login Link */}
            <p className="text-center text-secondary-600 text-sm">
              Já tem conta?{' '}
              <Link href="/login" className="text-primary-500 font-semibold hover:text-primary-600 transition-colors">
                Entre aqui
              </Link>
            </p>
          </form>
        </Card>

        {/* Benefícios */}
        <div className="mt-10 space-y-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <p className="text-sm text-secondary-700 font-semibold mb-4">✨ Incluso no plano:</p>
          <div className="flex items-center gap-3 group">
            <div className="w-6 h-6 bg-success/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle className="w-4 h-4 text-success" />
            </div>
            <span className="text-sm text-secondary-700 font-medium">30 dias de teste grátis - sem cartão de crédito</span>
          </div>
          <div className="flex items-center gap-3 group">
            <div className="w-6 h-6 bg-success/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle className="w-4 h-4 text-success" />
            </div>
            <span className="text-sm text-secondary-700 font-medium">Suporte por email 24/7</span>
          </div>
          <div className="flex items-center gap-3 group">
            <div className="w-6 h-6 bg-success/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle className="w-4 h-4 text-success" />
            </div>
            <span className="text-sm text-secondary-700 font-medium">Personalizável com sua logo e cores</span>
          </div>
        </div>
      </div>
    </main>
  );
}
