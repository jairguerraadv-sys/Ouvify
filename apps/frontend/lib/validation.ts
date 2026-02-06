// Validação de email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validação de senha forte
export interface PasswordStrength {
  isValid: boolean;
  strength: "weak" | "medium" | "strong";
  feedback: string[];
}

export function validatePassword(password: string): PasswordStrength {
  const feedback: string[] = [];
  let strength: "weak" | "medium" | "strong" = "weak";

  if (password.length < 8) {
    feedback.push("Mínimo de 8 caracteres");
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push("Adicione letras maiúsculas");
  }

  if (!/[a-z]/.test(password)) {
    feedback.push("Adicione letras minúsculas");
  }

  if (!/[0-9]/.test(password)) {
    feedback.push("Adicione números");
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    feedback.push("Adicione caracteres especiais");
  }

  const isValid = feedback.length === 0;

  if (isValid) {
    strength = "strong";
  } else if (feedback.length <= 2) {
    strength = "medium";
  }

  return { isValid, strength, feedback };
}

// Validação de subdomínio
export function isValidSubdomain(subdomain: string): boolean {
  // Deve ter entre 3 e 63 caracteres
  if (subdomain.length < 3 || subdomain.length > 63) {
    return false;
  }

  // Deve começar e terminar com letra ou número
  // Pode conter letras minúsculas, números e hífens
  const subdomainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
  return subdomainRegex.test(subdomain);
}

// Validação de subdomínio com mensagem de erro
export function validateSubdomain(subdomain: string): string | null {
  if (subdomain.length < 3) {
    return "Subdomínio deve ter no mínimo 3 caracteres";
  }

  if (subdomain.length > 63) {
    return "Subdomínio deve ter no máximo 63 caracteres";
  }

  // Deve começar e terminar com letra ou número
  const subdomainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
  if (!subdomainRegex.test(subdomain)) {
    return "Use apenas letras minúsculas, números e hífens";
  }

  if (isReservedSubdomain(subdomain)) {
    return "Este subdomínio está reservado";
  }

  return null;
}

// Subdomínios reservados
const RESERVED_SUBDOMAINS = [
  "www",
  "api",
  "admin",
  "app",
  "mail",
  "ftp",
  "smtp",
  "pop",
  "imap",
  "webmail",
  "email",
  "static",
  "assets",
  "cdn",
  "media",
  "files",
  "blog",
  "forum",
  "shop",
  "store",
  "help",
  "support",
  "docs",
  "ouvify",
  "ouvy",
  "test",
  "dev",
  "staging",
  "prod",
  "production",
];

export function isReservedSubdomain(subdomain: string): boolean {
  return RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase());
}

// Validação de CNPJ
export function isValidCNPJ(cnpj: string): boolean {
  // Remove caracteres não numéricos
  cnpj = cnpj.replace(/[^\d]/g, "");

  if (cnpj.length !== 14) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cnpj)) return false;

  // Validação dos dígitos verificadores
  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  const digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;

  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1))) return false;

  return true;
}

// Formatadores
export function formatCNPJ(cnpj: string): string {
  cnpj = cnpj.replace(/[^\d]/g, "");
  return cnpj.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5",
  );
}

export function formatPhone(phone: string): string {
  phone = phone.replace(/[^\d]/g, "");
  if (phone.length === 11) {
    return phone.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  } else if (phone.length === 10) {
    return phone.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  }
  return phone;
}

// Validação de formulário genérica
export type ValidationRule = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  type?: "email" | "password";
  custom?: (value: any) => string | null; // Retorna mensagem de erro ou null
  message?: string;
};

export type ValidationRules = Record<string, ValidationRule | ValidationRule[]>;

export function validateForm<T extends Record<string, any>>(
  data: T,
  rules: ValidationRules,
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];
    const rulesArray = Array.isArray(fieldRules) ? fieldRules : [fieldRules];

    for (const rule of rulesArray) {
      // Required validation
      if (
        rule.required &&
        (!value || (typeof value === "string" && !value.trim()))
      ) {
        errors[field] = rule.message || `${field} é obrigatório`;
        break;
      }

      // Type-based validation
      if (rule.type === "email" && value) {
        if (!isValidEmail(value as string)) {
          errors[field] = rule.message || "Email inválido";
          break;
        }
      }

      if (rule.type === "password" && value) {
        const result = validatePassword(value as string);
        if (!result.isValid) {
          errors[field] =
            rule.message || result.feedback[0] || "Senha inválida";
          break;
        }
      }

      // Min length validation
      if (
        rule.minLength &&
        typeof value === "string" &&
        value.length < rule.minLength
      ) {
        errors[field] =
          rule.message ||
          `${field} deve ter no mínimo ${rule.minLength} caracteres`;
        break;
      }

      // Max length validation
      if (
        rule.maxLength &&
        typeof value === "string" &&
        value.length > rule.maxLength
      ) {
        errors[field] =
          rule.message ||
          `${field} deve ter no máximo ${rule.maxLength} caracteres`;
        break;
      }

      // Pattern validation
      if (
        rule.pattern &&
        typeof value === "string" &&
        !rule.pattern.test(value)
      ) {
        errors[field] = rule.message || `${field} inválido`;
        break;
      }

      // Custom validation
      if (rule.custom && value) {
        const customError = rule.custom(value);
        if (customError) {
          errors[field] = customError;
          break;
        }
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// ============================================================================
// Schemas Zod para validação type-safe
// ============================================================================

import { z } from "zod";

/**
 * Schema para Preferências de Notificação
 * Valida os campos de email e push notifications
 */
export const notificationPreferencesSchema = z.object({
  email_new_feedback: z.boolean().default(true),
  email_feedback_response: z.boolean().default(true),
  email_status_change: z.boolean().default(false),
  push_assigned_feedback: z.boolean().default(true),
  push_comment: z.boolean().default(true),
  push_status_change: z.boolean().default(true),
  push_mention: z.boolean().default(false),
});

export type NotificationPreferences = z.infer<
  typeof notificationPreferencesSchema
>;

/**
 * Schema para Filtros de Audit Log
 * Valida parâmetros de busca e filtro de logs
 */
export const auditLogFiltersSchema = z
  .object({
    action: z
      .enum([
        "all",
        "login",
        "logout",
        "create",
        "update",
        "delete",
        "view",
        "export",
        "import",
        "config_change",
      ])
      .default("all"),
    search: z.string().max(200).optional(),
    date_from: z.date().optional(),
    date_to: z.date().optional(),
    page: z.number().int().positive().default(1),
  })
  .refine(
    (data) => {
      // Se ambas as datas estão presentes, date_from deve ser <= date_to
      if (data.date_from && data.date_to) {
        return data.date_from <= data.date_to;
      }
      return true;
    },
    {
      message: "Data inicial deve ser anterior ou igual à data final",
      path: ["date_from"],
    },
  );

export type AuditLogFilters = z.infer<typeof auditLogFiltersSchema>;

/**
 * Schema para entrada de feedback
 * Valida título, descrição, tipo e categoria
 */
export const feedbackInputSchema = z.object({
  titulo: z
    .string()
    .min(5, "Título deve ter no mínimo 5 caracteres")
    .max(200, "Título deve ter no máximo 200 caracteres"),
  descricao: z
    .string()
    .min(10, "Descrição deve ter no mínimo 10 caracteres")
    .max(2000, "Descrição deve ter no máximo 2000 caracteres"),
  tipo: z.enum(["reclamacao", "sugestao", "elogio", "duvida"]),
  categoria: z
    .string()
    .min(3, "Categoria deve ter no mínimo 3 caracteres")
    .max(50, "Categoria deve ter no máximo 50 caracteres"),
  email: z.string().email("Email inválido").optional(),
  nome: z
    .string()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .optional(),
});

export type FeedbackInput = z.infer<typeof feedbackInputSchema>;

/**
 * Schema para configuração de webhook
 * Valida URL, eventos e headers opcionais
 */
export const webhookConfigSchema = z.object({
  url: z.string().url("URL inválida"),
  events: z.array(z.string()).min(1, "Selecione pelo menos um evento"),
  active: z.boolean().default(true),
  secret: z
    .string()
    .min(16, "Secret deve ter no mínimo 16 caracteres")
    .optional(),
  headers: z.record(z.string(), z.string()).optional(),
  description: z.string().max(500, "Descrição muito longa").optional(),
});

export type WebhookConfig = z.infer<typeof webhookConfigSchema>;

/**
 * Schema para rastreamento de feedback
 * Valida formato do código de protocolo
 */
export const feedbackTrackingSchema = z.object({
  protocolo: z
    .string()
    .regex(/^OUVY-[A-Z0-9]{4}-[A-Z0-9]{4}$/, "Formato de protocolo inválido")
    .or(z.string().regex(/^[A-Z0-9]{12}$/, "Código de rastreamento inválido")),
});

export type FeedbackTracking = z.infer<typeof feedbackTrackingSchema>;

/**
 * Schema para configurações de tenant/white-label
 * Valida cores, logos e domínio customizado
 */
export const tenantConfigSchema = z.object({
  nome: z.string().min(2, "Nome muito curto").max(100, "Nome muito longo"),
  subdominio: z
    .string()
    .min(3, "Subdomínio deve ter no mínimo 3 caracteres")
    .max(63, "Subdomínio deve ter no máximo 63 caracteres")
    .regex(
      /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/,
      "Use apenas letras minúsculas, números e hífens",
    )
    .refine((val) => !isReservedSubdomain(val), "Subdomínio reservado"),
  cor_primaria: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Cor hexadecimal inválida"),
  cor_secundaria: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Cor hexadecimal inválida")
    .optional(),
  logo_url: z.string().url("URL de logo inválida").optional(),
  favicon_url: z.string().url("URL de favicon inválida").optional(),
  dominio_customizado: z
    .string()
    .regex(
      /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/,
      "Domínio inválido",
    )
    .optional(),
});

export type TenantConfig = z.infer<typeof tenantConfigSchema>;

/**
 * Schema para busca/filtros genéricos
 * Usado em páginas de listagem com paginação
 */
export const searchFiltersSchema = z.object({
  query: z.string().max(200).optional(),
  page: z.number().int().positive().default(1),
  per_page: z.number().int().positive().max(100).default(20),
  sort_by: z.string().optional(),
  sort_order: z.enum(["asc", "desc"]).default("desc"),
});

export type SearchFilters = z.infer<typeof searchFiltersSchema>;

/**
 * Helper para validar dados com Zod e retornar erros formatados
 * Compatível com React Hook Form
 */
export function zodValidate<T extends z.ZodType>(
  schema: T,
  data: unknown,
):
  | { success: true; data: z.infer<T> }
  | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path.join(".");
    errors[path] = issue.message;
  });

  return { success: false, errors };
}
