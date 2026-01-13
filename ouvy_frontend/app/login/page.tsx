"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
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
    <main className="min-h-screen bg-gradient-to-br from-white via-neutral-50 to-cyan-50 flex items-center justify-center p-4">
      <Card variant="elevated" className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-6">
            <Logo variant="full" className="justify-center" />
          </div>
          <h1 className="text-3xl font-bold text-secondary text-center mb-2">
            Bem-vindo de volta
          </h1>
          <p className="text-neutral-500 text-center">
            Entre na sua conta Ouvy
          </p>
        </CardHeader>

        <form onSubmit={handleLogin} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-secondary mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary mb-2">
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-error/10 border border-error text-error rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            variant="default"
            size="lg"
            className="w-full" 
            isLoading={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="p-6 border-t border-neutral-100 text-center">
          <p className="text-sm text-neutral-600">
            Não tem conta?{" "}
            <a href="/cadastro" className="text-primary font-semibold hover:opacity-80 transition">
              Cadastre-se
            </a>
          </p>
        </div>
      </Card>
    </main>
  );
}
        </div>
      </Card>
    </main>
  );
}
