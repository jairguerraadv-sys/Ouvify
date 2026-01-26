'use client';

import { useState, useEffect } from 'react';
import TermsCheckbox from './TermsCheckbox';

interface ConsentState {
  terms: boolean;
  privacy: boolean;
  lgpd: boolean;
  marketing: boolean;
}

interface ConsentCheckboxesProps {
  showMarketing?: boolean;
  onConsentChange?: (consents: ConsentState) => void;
  errors?: Partial<Record<keyof ConsentState, string>>;
  initialConsents?: Partial<ConsentState>;
}

export default function ConsentCheckboxes({
  showMarketing = true,
  onConsentChange,
  errors = {},
  initialConsents = {},
}: ConsentCheckboxesProps) {
  const [consents, setConsents] = useState<ConsentState>({
    terms: initialConsents.terms ?? false,
    privacy: initialConsents.privacy ?? false,
    lgpd: initialConsents.lgpd ?? false,
    marketing: initialConsents.marketing ?? false,
  });

  useEffect(() => {
    onConsentChange?.(consents);
  }, []);

  const handleChange = (key: keyof ConsentState) => (checked: boolean) => {
    const newConsents = { ...consents, [key]: checked };
    setConsents(newConsents);
    onConsentChange?.(newConsents);
  };

  return (
    <div className="space-y-4">
      {/* Termos de Uso */}
      <TermsCheckbox
        name="terms"
        label="Li e aceito os"
        termsUrl="/termos"
        termsText="Termos de Uso"
        required
        checked={consents.terms}
        onChange={handleChange('terms')}
        error={errors.terms}
      />

      {/* Política de Privacidade */}
      <TermsCheckbox
        name="privacy"
        label="Li e aceito a"
        termsUrl="/privacidade"
        termsText="Política de Privacidade"
        required
        checked={consents.privacy}
        onChange={handleChange('privacy')}
        error={errors.privacy}
      />

      {/* LGPD */}
      <TermsCheckbox
        name="lgpd"
        label="Autorizo o tratamento dos meus dados pessoais conforme"
        termsUrl="/lgpd"
        termsText="LGPD"
        required
        checked={consents.lgpd}
        onChange={handleChange('lgpd')}
        error={errors.lgpd}
      />

      {/* Marketing (Opcional) */}
      {showMarketing && (
        <TermsCheckbox
          name="marketing"
          label="Aceito receber emails sobre novidades e ofertas (opcional)"
          termsUrl="/privacidade"
          termsText="Saiba mais"
          required={false}
          checked={consents.marketing}
          onChange={handleChange('marketing')}
          error={errors.marketing}
        />
      )}
    </div>
  );
}
