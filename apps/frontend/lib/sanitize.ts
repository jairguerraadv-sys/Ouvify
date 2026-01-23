/**
 * Utilitário de sanitização HTML
 * Usa DOMPurify para prevenir ataques XSS
 */

import DOMPurify from 'isomorphic-dompurify';

interface SanitizeConfig {
  ALLOWED_TAGS?: string[];
  ALLOWED_ATTR?: string[];
  ALLOW_DATA_ATTR?: boolean;
}

/**
 * Sanitiza HTML para prevenir XSS
 * @param dirty - HTML não confiável (vindo do usuário ou API)
 * @param options - Opções de configuração do DOMPurify
 * @returns HTML sanitizado e seguro
 */
export function sanitizeHtml(
  dirty: string,
  options?: SanitizeConfig
): string {
  // Configuração padrão mais restritiva
  const defaultConfig: SanitizeConfig = {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    ...options,
  };

  return String(DOMPurify.sanitize(dirty, defaultConfig));
}

/**
 * Sanitiza HTML permitindo apenas texto formatado básico
 * Remove todos os links e elementos potencialmente perigosos
 */
export function sanitizeTextOnly(dirty: string): string {
  return String(DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u'],
    ALLOWED_ATTR: [],
  }));
}

/**
 * Remove completamente todas as tags HTML
 * Retorna apenas texto puro
 */
export function stripHtml(dirty: string): string {
  return String(DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  }));
}

/**
 * Sanitiza URLs para prevenir javascript: e data: URIs
 */
export function sanitizeUrl(url: string): string {
  const sanitized = String(DOMPurify.sanitize(url, {
    ALLOWED_TAGS: [],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  }));
  
  return sanitized;
}

export default {
  sanitizeHtml,
  sanitizeTextOnly,
  stripHtml,
  sanitizeUrl,
};
