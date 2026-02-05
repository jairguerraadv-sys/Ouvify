"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo, LogoAuth } from "@/components/ui/logo";
import { DecorativeBlob, FlexBetween } from "@/components/ui/layout-utils";
import { MutedText } from "@/components/ui";
import { ArrowRight, Lock, Mail, AlertCircle } from "lucide-react";
import Link from "next/link";
import { isValidEmail } from "@/lib/validation";
import { useAuth } from "@/contexts/AuthContext";

interface LoginForm {
  email: string;
  senha: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
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

  const handleChange = useCallback(
    (field: keyof LoginForm, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Limpar erro do campo ao digitar
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
      setApiError("");
    },
    [errors],
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setApiError("");

    try {
      await login(formData.email, formData.senha);
      const redirect =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("redirect")
          : null;
      router.push(redirect || "/dashboard");
    } catch (error) {
      console.error("Erro no login:", error);
      setApiError(
        error instanceof Error ? error.message : "Erro ao fazer login",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <DecorativeBlob
        size="sm"
        placement="topLeftQuarter"
        className="animate-pulse opacity-100"
      />
      <DecorativeBlob
        size="sm"
        placement="bottomRightQuarter"
        className="animate-pulse delay-1000 opacity-100"
      />

      <Card
        variant="elevated"
        className="w-full max-w-md relative z-10 animate-scale-in"
      >
        <CardHeader>
          <div className="flex justify-center mb-8">
            <LogoAuth />
          </div>
          <h1 className="text-3xl font-bold text-secondary text-center mb-2">
            Bem-vindo de volta
          </h1>
          <p className="text-muted-foreground text-center">
            Entre na sua conta{" "}
            <span className="text-gradient font-semibold">Ouvify</span>
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
              <p id="email-error" className="text-sm text-error">
                {errors.email}
              </p>
            )}
          </div>

          {/* Senha */}
          <div className="space-y-2">
            <FlexBetween>
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
            </FlexBetween>
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
              <p id="senha-error" className="text-sm text-error">
                {errors.senha}
              </p>
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
          <MutedText block className="text-center">
            Não tem uma conta?{" "}
            <Link
              href="/cadastro"
              className="text-primary hover:text-primary-dark font-semibold transition-colors"
              tabIndex={loading ? -1 : 0}
            >
              Cadastre-se grátis
            </Link>
          </MutedText>
        </form>
      </Card>
    </main>
  );
}
