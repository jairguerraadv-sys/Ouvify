'use client';

import { useState } from 'react';
import { useConsent } from '@/hooks/use-consent';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { H2, Paragraph } from '@/components/ui/typography';
import { MutedText } from '@/components/ui';
import { 
  Shield, 
  FileText, 
  Download, 
  Trash2, 
  AlertCircle, 
  CheckCircle2,
  XCircle,
  ExternalLink,
  Calendar,
  Mail
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RevokeModalProps {
  consentId: number;
  consentType: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

function RevokeModal({ consentId, consentType, isOpen, onClose, onConfirm, isLoading }: RevokeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-error/10 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-error" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-secondary">Confirmar Revogação</h3>
              <MutedText block>Esta ação pode afetar o funcionamento do sistema</MutedText>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <Paragraph>
            Tem certeza que deseja revogar o consentimento para <strong>{consentType}</strong>?
          </Paragraph>
          <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
            <p className="text-sm text-warning-dark flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                Ao revogar este consentimento, você pode perder acesso a certas funcionalidades 
                do sistema até que aceite os termos novamente.
              </span>
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={isLoading}
              isLoading={isLoading}
              className="flex-1"
            >
              {!isLoading && <XCircle className="w-4 h-4 mr-2" />}
              Revogar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PrivacidadePage() {
  const { myConsents, pending, revokeConsent, isLoading } = useConsent();
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [selectedConsent, setSelectedConsent] = useState<{ id: number; type: string } | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  const handleRevokeClick = (consentId: number, consentType: string) => {
    setSelectedConsent({ id: consentId, type: consentType });
    setRevokeModalOpen(true);
  };

  const handleRevokeConfirm = async () => {
    if (!selectedConsent) return;
    
    setIsRevoking(true);
    try {
      await revokeConsent(selectedConsent.id);
      setRevokeModalOpen(false);
      setSelectedConsent(null);
    } catch (error) {
      console.error('Erro ao revogar consentimento:', error);
    } finally {
      setIsRevoking(false);
    }
  };

  const getConsentTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'lgpd':
        return <Shield className="w-5 h-5" />;
      case 'terms':
        return <FileText className="w-5 h-5" />;
      case 'privacy':
        return <Shield className="w-5 h-5" />;
      case 'marketing':
        return <Mail className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getConsentTypeBadgeVariant = (type: string): 'primary' | 'info' | 'success' | 'warning' => {
    switch (type.toLowerCase()) {
      case 'lgpd':
        return 'primary';
      case 'terms':
        return 'info';
      case 'privacy':
        return 'success';
      case 'marketing':
        return 'warning';
      default:
        return 'info';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div>
              <H2 className="text-secondary mb-1">Privacidade e Dados</H2>
              <MutedText>Gerencie seus consentimentos e dados pessoais</MutedText>
            </div>
          </div>
        </div>

        {/* Pending Consents Alert */}
        {pending?.has_pending && (
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-warning flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="font-semibold text-secondary mb-2">
                    Termos Pendentes
                  </p>
                  <MutedText block className="mb-3">
                    Existem novos termos que precisam da sua aceitação para continuar 
                    usando o sistema normalmente.
                  </MutedText>
                  <Button variant="warning" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Revisar Termos
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* My Consents */}
        <Card className="shadow-lg">
          <CardHeader className="border-b bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-secondary">Meus Consentimentos</h3>
                  <MutedText block>Histórico de termos aceitos e revogados</MutedText>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-24 bg-muted rounded-lg" />
                  </div>
                ))}
              </div>
            ) : myConsents && myConsents.length > 0 ? (
              <div className="space-y-4">
                {myConsents.map((consent) => (
                  <Card 
                    key={consent.id} 
                    className={`border ${
                      consent.revoked 
                        ? 'border-error/20 bg-error/5' 
                        : 'border-success/20 bg-success/5'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          consent.revoked ? 'bg-error/10 text-error' : 'bg-success/10 text-success'
                        }`}>
                          {getConsentTypeIcon(consent.consent_version_details.document_type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                            <div>
                              <h4 className="font-semibold text-secondary mb-1">
                                {consent.consent_version_details.document_type_display}
                              </h4>
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge 
                                  variant={getConsentTypeBadgeVariant(consent.consent_version_details.document_type)}
                                  size="sm"
                                >
                                  Versão {consent.consent_version_details.version}
                                </Badge>
                                {consent.revoked ? (
                                  <Badge variant="destructive" size="sm" className="flex items-center gap-1">
                                    <XCircle className="w-3 h-3" />
                                    Revogado
                                  </Badge>
                                ) : (
                                  <Badge variant="success" size="sm" className="flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Ativo
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Metadata */}
                          <div className="space-y-1 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 flex-shrink-0" />
                              <span>
                                {consent.revoked 
                                  ? `Revogado ${formatDate(consent.revoked_at || '')}`
                                  : `Aceito ${formatDate(consent.accepted_at || '')}`
                                }
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2">
                            {consent.consent_version_details.content_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                              >
                                <a 
                                  href={consent.consent_version_details.content_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2"
                                >
                                  <FileText className="w-4 h-4" />
                                  Ver Documento
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </Button>
                            )}
                            {!consent.revoked && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRevokeClick(
                                  consent.id, 
                                  consent.consent_version_details.document_type_display
                                )}
                                className="text-error hover:text-error hover:bg-error/10"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Revogar
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-2">Nenhum consentimento registrado</p>
                <MutedText block>
                  Você ainda não aceitou nenhum termo de consentimento
                </MutedText>
              </div>
            )}
          </CardContent>
        </Card>

        {/* LGPD Rights & Data Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Your Rights */}
          <Card className="shadow-lg">
            <CardHeader className="border-b bg-gradient-to-br from-info/5 to-info/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-info/10 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-info" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-secondary">Seus Direitos (LGPD)</h3>
                  <MutedText block>Garantias sobre seus dados pessoais</MutedText>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-secondary text-sm">Acesso aos Dados</p>
                    <MutedText block className="text-xs">
                      Você pode solicitar uma cópia de todos os dados que temos sobre você
                    </MutedText>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-secondary text-sm">Correção de Dados</p>
                    <MutedText block className="text-xs">
                      Você pode corrigir informações incorretas ou desatualizadas
                    </MutedText>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-secondary text-sm">Exclusão de Dados</p>
                    <MutedText block className="text-xs">
                      Você pode solicitar a exclusão dos seus dados pessoais
                    </MutedText>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-secondary text-sm">Portabilidade</p>
                    <MutedText block className="text-xs">
                      Você pode exportar seus dados em formato estruturado
                    </MutedText>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Actions */}
          <Card className="shadow-lg">
            <CardHeader className="border-b bg-gradient-to-br from-secondary/5 to-secondary/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                  <Download className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-secondary">Ações sobre Dados</h3>
                  <MutedText block>Exporte ou solicite exclusão dos seus dados</MutedText>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Button className="w-full" size="lg">
                  <Download className="w-5 h-5 mr-2" />
                  Exportar Meus Dados
                </Button>
                <MutedText block className="text-xs mt-2">
                  Receba uma cópia de todos os seus dados em formato JSON
                </MutedText>
              </div>

              <div className="pt-4 border-t border-border">
                <Button 
                  variant="outline" 
                  className="w-full text-error hover:text-error hover:bg-error/10 hover:border-error/30"
                  size="lg"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  Solicitar Exclusão de Conta
                </Button>
                <MutedText block className="text-xs mt-2">
                  Esta ação é irreversível e removerá todos os seus dados
                </MutedText>
              </div>

              <div className="p-4 bg-info/10 border border-info/30 rounded-lg">
                <p className="text-xs text-info-dark flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    As solicitações de exclusão são processadas em até 30 dias úteis 
                    conforme a LGPD
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Revoke Modal */}
      {selectedConsent && (
        <RevokeModal
          consentId={selectedConsent.id}
          consentType={selectedConsent.type}
          isOpen={revokeModalOpen}
          onClose={() => {
            setRevokeModalOpen(false);
            setSelectedConsent(null);
          }}
          onConfirm={handleRevokeConfirm}
          isLoading={isRevoking}
        />
      )}
    </div>
  );
}
