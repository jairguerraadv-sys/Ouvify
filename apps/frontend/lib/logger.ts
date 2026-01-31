/**
 * Logger utilitário com suporte condicional para desenvolvimento
 * Evita logs desnecessários em produção
 */

const isDev = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';
const isClient = typeof window !== 'undefined';

export const logger = {
  /**
   * Log de erro (sempre ativo, mas com informação reduzida em produção)
   */
  error: (...args: unknown[]) => {
    if (isTest) return;
    if (isDev) {
      console.error('[ERROR]', ...args);
    } else {
      // Em produção, logar apenas mensagem simples (integrar com Sentry futuramente)
      console.error('[ERROR]', args[0]);
    }
  },

  /**
   * Log de aviso (apenas em desenvolvimento)
   */
  warn: (...args: unknown[]) => {
    if (isDev && !isTest) {
      console.warn('[WARN]', ...args);
    }
  },

  /**
   * Log informativo (apenas em desenvolvimento)
   */
  log: (...args: unknown[]) => {
    if (isDev && !isTest) {
      console.log('[INFO]', ...args);
    }
  },

  /**
   * Log de debug (apenas em desenvolvimento)
   */
  debug: (...args: unknown[]) => {
    if (isDev && !isTest) {
      console.debug('[DEBUG]', ...args);
    }
  },

  /**
   * Log de sucesso (apenas em desenvolvimento)
   */
  success: (...args: unknown[]) => {
    if (isDev && !isTest) {
      console.log('[SUCCESS] ✅', ...args);
    }
  },

  /**
   * Helper para logar apenas no cliente (não no SSR)
   */
  client: {
    error: (...args: unknown[]) => isClient && logger.error(...args),
    warn: (...args: unknown[]) => isClient && logger.warn(...args),
    log: (...args: unknown[]) => isClient && logger.log(...args),
    debug: (...args: unknown[]) => isClient && logger.debug(...args),
  },
};

export default logger;
