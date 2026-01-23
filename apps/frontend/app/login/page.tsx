"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { ArrowRight, Lock, Mail, AlertCircle } from "lucide-react";
import Link from "next/link";
import { api, getErrorMessage } from "@/lib/api";
import { isValidEmail } from "@/lib/validation";
import { storage } from "@/lib/helpers";
import type { AuthToken } from "@/lib/types";

interface LoginForm {
  email: string;
  senha: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginForm>({ email: "", senha: "" });
  const [errors, setErrors] = useState<Partial<LoginForm>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const validate = useCallback((): boolean => {
    const newErrors: Partial<LoginForm> = {};

    if (!formData.email) {
      newErrors.email = "Email é obrigatório";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.senha) {
      newErrors.senha = "Senha é obrigatória";
    } else if (formData.senha.length < 6) {
      newErrors.senha = "Senha deve ter no mínimo 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback((field: keyof LoginForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo ao digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    setApiError("");
  }, [errors]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setApiError("");

    try {
      const response = await api.post<{ token: string }>("/api-token-auth/", {
        username: formData.email,
        password: formData.senha,
      });

      if (response.token) {
        storage.set("auth_token", response.token);
        
        // Buscar informações do usuário após login
        try {
          const userResponse = await api.get<AuthToken>("/api/tenant-info/", {
            headers: {
              Authorization: `Token ${response.token}`
            }
          });
          
          if (userResponse.tenant) {
            storage.set("tenant_id", userResponse.tenant.id);
          }
        } catch (err) {
          console.warn("Não foi possível buscar tenant_info:", err);
        }
        
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Erro no login:", error);
      setApiError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <Card variant="elevated" className="w-full max-w-md relative z-10 animate-scale-in">
        <CardHeader>
          <div className="flex justify-center mb-8">
            <Logo size="xl" />
          </div>
          <h1 className="text-3xl font-bold text-secondary text-center mb-2">
            Bem-vindo de volta
          </h1>
          <p className="text-muted-foreground text-center">
            Entre na sua conta <span className="text-gradient font-semibold">Ouvy</span>
          </p>
        </CardHeader>

        <form onSubmit={handleLogin} className="p-6 space-y-5">
          {/* API Error */}
          {apiError && (
            <div 
              role="alert"
              aria-live="polite"
              className="flex items-center gap-2 p-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Email */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-secondary">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="seu@email.com"
                className="pl-11"
                disabled={loading}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
            </div>
            {errors.email && (
              <p id="email-error" className="text-sm text-error">{errors.email}</p>
            )}
          </div>

          {/* Senha */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-secondary">
                Senha
              </label>
              <Link 
                href="/recuperar-senha" 
                className="text-sm text-primary hover:text-primary-dark font-medium transition-colors"
                tabIndex={loading ? -1 : 0}
              >
                Esqueceu?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="password"
                value={formData.senha}
                onChange={(e) => handleChange("senha", e.target.value)}
                placeholder="••••••••"
                className="pl-11"
                disabled={loading}
                aria-invalid={!!errors.senha}
                aria-describedby={errors.senha ? "senha-error" : undefined}
              />
            </div>
            {errors.senha && (
              <p id="senha-error" className="text-sm text-error">{errors.senha}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full group"
            disabled={loading}
            isLoading={loading}
          >
            {!loading && (
              <>
                Entrar
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>

          {/* Cadastro Link */}
          <p className="text-center text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <Link
              href="/cadastro"
              className="text-primary hover:text-primary-dark font-semibold transition-colors"
              tabIndex={loading ? -1 : 0}
            >
              Cadastre-se grátis
            </Link>
          </p>
        </form>
      </Card>
    </main>
  );
}
