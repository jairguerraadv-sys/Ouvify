"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

export default function ConfiguracoesPage() {
  const [tenant, setTenant] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("tenant_data");
      if (stored) {
        setTenant(JSON.parse(stored));
      }
    }
  }, []);

  return (
    <main className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Configurações</h1>
        <p className="text-muted-foreground text-sm">Personalize sua experiência</p>
      </header>

      <div className="grid gap-6 max-w-2xl">
        {/* Informações da Empresa */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">🏢 Informações da Empresa</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome da Empresa</label>
              <Input 
                defaultValue={tenant?.nome_empresa || "Minha Empresa"} 
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subdomínio</label>
              <Input 
                defaultValue={tenant?.subdominio || "minhaempresa"} 
                disabled
              />
              <p className="text-xs text-muted-foreground mt-1">
                Seu subdomínio não pode ser alterado após o cadastro
              </p>
            </div>
          </div>
        </Card>

        {/* White Label */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">🎨 White Label</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Cor Primária</label>
              <div className="flex gap-2">
                <Input type="color" defaultValue="#3B82F6" className="w-20" />
                <Input defaultValue="#3B82F6" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Logo da Empresa</label>
              <Input type="file" accept="image/*" />
              <p className="text-xs text-muted-foreground mt-1">
                Recomendado: PNG ou SVG, até 200KB
              </p>
            </div>
            <Button variant="secondary">Salvar Personalização</Button>
          </div>
        </Card>

        {/* Notificações */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">🔔 Notificações</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="accent-primary" />
              <span className="text-sm">Novos feedbacks</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="accent-primary" />
              <span className="text-sm">Respostas de usuários</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-primary" />
              <span className="text-sm">Relatórios semanais</span>
            </label>
          </div>
        </Card>

        {/* Zona de Perigo */}
        <Card className="p-6 border-red-200 bg-red-50">
          <h3 className="text-lg font-medium mb-2 text-red-800">⚠️ Zona de Perigo</h3>
          <p className="text-sm text-red-700 mb-4">
            Ações irreversíveis que afetam toda a conta
          </p>
          <Button variant="destructive">Desativar Conta</Button>
        </Card>
      </div>
    </main>
  );
}
