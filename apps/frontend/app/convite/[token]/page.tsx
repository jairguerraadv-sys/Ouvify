'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { AxiosResponse } from 'axios';

interface AcceptInvitationResponse {
  tokens: {
    access: string;
    refresh: string;
  };
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
}

interface Props {
  params: { token: string };
}

export default function AcceptInvitePage({ params }: Props) {
  const router = useRouter();
  const { token } = params;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    passwordConfirm: '',
  });

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('Nome é obrigatório');
      return false;
    }
    
    if (!formData.lastName.trim()) {
      setError('Sobrenome é obrigatório');
      return false;
    }
    
    if (formData.password.length < 8) {
      setError('Senha deve ter no mínimo 8 caracteres');
      return false;
    }
    
    if (formData.password !== formData.passwordConfirm) {
      setError('As senhas não conferem');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      const response: AxiosResponse<AcceptInvitationResponse> = await api.post('/api/team/invitations/accept/', {
        token,
        first_name: formData.firstName,
        last_name: formData.lastName,
        password: formData.password,
        password_confirm: formData.passwordConfirm,
      });
      
      // Salvar tokens no localStorage
      if (response.data.tokens) {
        localStorage.setItem('access_token', response.data.tokens.access);
        localStorage.setItem('refresh_token', response.data.tokens.refresh);
      }
      
      setSuccess(true);
      
      // Redirecionar para dashboard após 2 segundos
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      
    } catch (error: any) {
      const message = error.response?.data?.detail 
        || error.response?.data?.message
        || 'Erro ao aceitar convite. Verifique se o link ainda é válido.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Limpar erro ao digitar
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <CheckCircle2 className="w-16 h-16 text-success-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Convite Aceito! 🎉
            </h2>
            <p className="text-gray-600">
              Bem-vindo à equipe! Redirecionando para o dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="text-6xl">🎉</div>
          </div>
          <CardTitle className="text-2xl text-center">Aceitar Convite</CardTitle>
          <CardDescription className="text-center">
            Crie sua conta para fazer parte da equipe
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Alert */}
            {error && (
              <Alert variant="error">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {/* Nome e Sobrenome */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Primeiro Nome *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="João"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Sobrenome *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Silva"
                  required
                  disabled={loading}
                />
              </div>
            </div>
            
            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="password">Senha *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
                minLength={8}
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                Use letras, números e caracteres especiais para maior segurança
              </p>
            </div>
            
            {/* Confirmar Senha */}
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">Confirmar Senha *</Label>
              <Input
                id="passwordConfirm"
                type="password"
                value={formData.passwordConfirm}
                onChange={(e) => handleInputChange('passwordConfirm', e.target.value)}
                placeholder="Digite a senha novamente"
                required
                minLength={8}
                disabled={loading}
              />
            </div>
            
            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                'Aceitar Convite e Criar Conta'
              )}
            </Button>
            
            {/* Info */}
            <p className="text-xs text-center text-gray-500 mt-4">
              Ao aceitar, você concorda com os{' '}
              <a href="/termos" className="text-primary-600 hover:underline">
                Termos de Uso
              </a>{' '}
              e{' '}
              <a href="/privacidade" className="text-primary-600 hover:underline">
                Política de Privacidade
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
