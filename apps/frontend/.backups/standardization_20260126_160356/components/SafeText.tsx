/**
 * Componente para exibição segura de texto
 * Sanitiza automaticamente o conteúdo para prevenir XSS
 */
'use client';

import { useMemo, type ElementType, type ReactNode } from 'react';
import { stripHtml, sanitizeHtml, sanitizeTextOnly } from '@/lib/sanitize';

interface SafeTextProps {
  /** Texto a ser exibido (potencialmente não confiável) */
  children: string | null | undefined;
  /** Modo de sanitização */
  mode?: 'strip' | 'basic' | 'html';
  /** Tag HTML a ser usada */
  as?: ElementType;
  /** Classe CSS */
  className?: string;
  /** Fallback quando children é nulo/undefined */
  fallback?: string;
}

/**
 * Componente que sanitiza texto antes de exibir
 * 
 * @example
 * // Remove todas as tags HTML
 * <SafeText>{userData.name}</SafeText>
 * 
 * @example
 * // Permite formatação básica (p, br, strong, em)
 * <SafeText mode="basic">{userData.bio}</SafeText>
 * 
 * @example
 * // Permite HTML mais completo (inclui links)
 * <SafeText mode="html" as="div">{userData.description}</SafeText>
 */
export function SafeText({
  children,
  mode = 'strip',
  as: Component = 'span',
  className,
  fallback = '',
}: SafeTextProps) {
  const sanitizedContent = useMemo(() => {
    if (!children) return fallback;
    
    const text = String(children);
    
    switch (mode) {
      case 'html':
        return sanitizeHtml(text);
      case 'basic':
        return sanitizeTextOnly(text);
      case 'strip':
      default:
        return stripHtml(text);
    }
  }, [children, mode, fallback]);

  // Para modos que preservam HTML, usamos dangerouslySetInnerHTML com conteúdo SANITIZADO
  if (mode !== 'strip') {
    return (
      <Component
        className={className}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    );
  }

  // Para modo strip, renderizamos como texto puro
  return <Component className={className}>{sanitizedContent}</Component>;
}

/**
 * Hook para sanitizar objeto de dados
 * Útil para sanitizar respostas da API antes de usar no estado
 */
export function useSanitizedData<T extends Record<string, any>>(
  data: T | null | undefined,
  fieldsToSanitize: (keyof T)[]
): T | null {
  return useMemo(() => {
    if (!data) return null;

    const sanitized = { ...data };
    
    for (const field of fieldsToSanitize) {
      const value = sanitized[field];
      if (typeof value === 'string') {
        (sanitized as any)[field] = stripHtml(value);
      }
    }

    return sanitized;
  }, [data, fieldsToSanitize]);
}

export default SafeText;
