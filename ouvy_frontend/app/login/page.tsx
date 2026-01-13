"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ArrowRight, Lock, Mail } from "lucide-react";
import Link from "next/link";
import axios from "axios";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      
      const response = await axios.post(`${apiUrl}/api-token-auth/`, {
        username: email,
        password: senha,
      });

      if (response.data.token) {
        localStorage.setItem("auth_token", response.data.token);
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error("Erro no login:", err);
      if (err.response?.status === 400) {
        setError("Email ou senha incorretos");
      } else {
        setError("Erro ao conectar com o servidor. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-mesh flex items-center justify-center p-4">
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-primary-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      
      <Card variant="elevated" className="w-full max-w-md relative z-10 animate-scale-in shadow-elegant">
        <CardHeader>
          <div className="flex justify-center mb-8">
            <Logo variant="full" size="lg" colorScheme="default" />
          </div>
          <h1 className="text-3xl font-bold text-secondary-900 text-center mb-2">
            Bem-vindo de volta
          </h1>
          <p className="text-secondary-600 text-center">
            Entre na sua conta <span className="text-gradient-primary font-semibold">Ouvy</span>
          </p>
        </CardHeader>

        <form onSubmit={handleLogin} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-secondary-900">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full pl-11 pr-4 py-3 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-secondary-900">
                Senha
              </label>
              <Link href="/recuperar-senha" className="text-sm text-primary-500 hover:text-primary-600 font-medium">
                Esqueceu?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-error/10 border border-error/30 text-error rounded-lg text-sm font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-error rounded-full" />
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            variant="default"
            size="lg"
            className="w-full shadow-elegant group" 
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
            {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </Button>
        </form>

        <div className="px-6 pb-6">
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-secondary-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-secondary-500 font-medium">
                Novo por aqui?
              </span>
            </div>
          </div>

          <Link href="/cadastro">
            <Button variant="outline" size="lg" className="w-full">
              Criar conta grátis
            </Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}
