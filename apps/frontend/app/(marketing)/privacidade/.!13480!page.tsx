'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Shield, Eye, Lock, Database, UserCheck, FileText } from 'lucide-react';

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-30" />
        
        <div className="container mx-auto px-4 py-16 max-w-4xl relative z-10">
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4 bg-white rounded-2xl p-8 shadow-lg border border-border">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-primary/10 p-4">
                  <Shield className="w-12 h-12 text-primary" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-primary">
                Política de Privacidade
              </h1>
              <p className="text-muted-foreground">
                Última atualização: 14 de janeiro de 2026
              </p>
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                No Ouvy, levamos sua privacidade a sério. Esta política descreve como coletamos, 
                usamos, armazenamos e protegemos seus dados pessoais.
              </p>
            </div>

            {/* Resumo Visual */}
            <div className="grid md:grid-cols-3 gap-4 my-8">
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center space-y-2">
                <Lock className="w-8 h-8 text-primary mx-auto" />
                <h3 className="font-semibold text-secondary">Dados Criptografados</h3>
                <p className="text-xs text-muted-foreground">SSL/TLS em todas as conexões</p>
              </div>
              <div className="bg-success/5 border border-success/20 rounded-xl p-4 text-center space-y-2">
                <UserCheck className="w-8 h-8 text-success mx-auto" />
                <h3 className="font-semibold text-secondary">LGPD Compliant</h3>
                <p className="text-xs text-muted-foreground">Conformidade total com a lei</p>
              </div>
              <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-4 text-center space-y-2">
                <Eye className="w-8 h-8 text-secondary mx-auto" />
                <h3 className="font-semibold text-secondary">Transparência</h3>
                <p className="text-xs text-muted-foreground">Você controla seus dados</p>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="prose prose-lg max-w-none space-y-6 bg-white rounded-2xl p-8 shadow-lg border border-border">
              {/* Seção 1 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-secondary flex items-center gap-2">
                  <Database className="w-6 h-6" />
                  1. Dados que Coletamos
                </h2>
                
                <h3 className="text-xl font-semibold text-secondary mt-4">1.1 Clientes (Empresas)</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Ao criar uma conta como Cliente, coletamos:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li><strong>Dados de cadastro:</strong> Nome, email, nome da empresa, subdomínio</li>
                  <li><strong>Dados de pagamento:</strong> Processados pelo Stripe (não armazenamos cartões)</li>
                  <li><strong>Dados de uso:</strong> Logs de acesso, features utilizadas, métricas</li>
                  <li><strong>Dados técnicos:</strong> IP, navegador, dispositivo, l