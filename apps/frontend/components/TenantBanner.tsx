'use client';

import { useTenantTheme, useTenantName, useTenantLogo } from '@/hooks/use-tenant-theme';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Palette } from 'lucide-react';
import type { CSSProperties } from 'react';

/**
 * Componente de exemplo que demonstra o uso do White Label
 * Mostra o nome da empresa, logo e cor primária aplicada
 */
export function TenantBanner() {
  const theme = useTenantTheme();
  const tenantName = useTenantName();
  const tenantLogo = useTenantLogo();

  if (!theme) {
    return (
      <Card className="animate-pulse">
        <CardContent className="h-32 bg-muted" />
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/20 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {tenantLogo ? (
              <div 
                className="logo-tenant w-12 h-12 rounded-lg border-2 border-primary/20"
                aria-label={`Logo ${tenantName}`}
              />
            ) : (
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
            )}
            <div>
              <CardTitle className="text-xl">{tenantName}</CardTitle>
              <p className="text-sm text-muted-foreground">
                @{theme.subdominio}
              </p>
            </div>
          </div>
          
          <Badge variant="default" className="gap-2">
            <Palette className="w-4 h-4" />
            White Label Ativo
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {(() => {
              const colorStyle = { backgroundColor: theme.cor_primaria } as CSSProperties;
              return (
            <div 
              className="w-8 h-8 rounded-full border-2 border-border"
                style={colorStyle}
            />
              );
            })()}
            <div>
              <p className="text-xs text-muted-foreground">Cor Primária</p>
              <p className="text-sm font-mono font-semibold">{theme.cor_primaria}</p>
            </div>
          </div>
          
          <div className="h-8 w-px bg-border" />
          
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-2">Preview do Tema</p>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                Botão Primário
              </button>
              <button className="px-4 py-2 border-2 border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary/10 transition-colors">
                Botão Outline
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
