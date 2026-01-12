"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      
      // Tentar obter token via Django REST auth
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
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="Ouvy Logo" width={180} height={50} className="h-auto" />
        </div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Bem-vindo de volta</h1>
          <p className="text-muted-foreground">Entre na sua conta Ouvy</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Senha</label>
            <Input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Não tem conta?{" "}
            <a href="/cadastro" className="text-primary hover:underline font-medium">
              Cadastre-se
            </a>
          </p>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-xs text-blue-800">
            <strong>ℹ️ Nota:</strong> Esta página requer configuração da autenticação Django REST.
            Use o endpoint <code className="bg-blue-100 px-1 rounded">/api-token-auth/</code> ou ajuste conforme seu backend.
          </p>
        </div>
      </Card>
    </main>
  );
}
