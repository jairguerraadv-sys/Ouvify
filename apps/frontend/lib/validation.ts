// Validação de email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validação de senha forte
export interface PasswordStrength {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  feedback: string[];
}

export function validatePassword(password: string): PasswordStrength {
  const feedback: string[] = [];
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  
  if (password.length < 8) {
    feedback.push('Mínimo de 8 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    feedback.push('Adicione letras maiúsculas');
  }
  
  if (!/[a-z]/.test(password)) {
    feedback.push('Adicione letras minúsculas');
  }
  
  if (!/[0-9]/.test(password)) {
    feedback.push('Adicione números');
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    feedback.push('Adicione caracteres especiais');
  }
  
  const isValid = feedback.length === 0;
  
  if (isValid) {
    strength = 'strong';
  } else if (feedback.length <= 2) {
    strength = 'medium';
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
    return 'Subdomínio deve ter no mínimo 3 caracteres';
  }
  
  if (subdomain.length > 63) {
    return 'Subdomínio deve ter no máximo 63 caracteres';
  }
  
  // Deve começar e terminar com letra ou número
  const subdomainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
  if (!subdomainRegex.test(subdomain)) {
    return 'Use apenas letras minúsculas, números e hífens';
  }
  
  if (isReservedSubdomain(subdomain)) {
    return 'Este subdomínio está reservado';
  }
  
  return null;
}

// Subdomínios reservados
const RESERVED_SUBDOMAINS = [
  'www', 'api', 'admin', 'app', 'mail', 'ftp', 'smtp', 'pop', 'imap',
  'webmail', 'email', 'static', 'assets', 'cdn', 'media', 'files',
  'blog', 'forum', 'shop', 'store', 'help', 'support', 'docs',
  'ouvify', 'ouvy', 'test', 'dev', 'staging', 'prod', 'production'
];

export function isReservedSubdomain(subdomain: string): boolean {
  return RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase());
}

// Validação de CNPJ
export function isValidCNPJ(cnpj: string): boolean {
  // Remove caracteres não numéricos
  cnpj = cnpj.replace(/[^\d]/g, '');
  
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
  cnpj = cnpj.replace(/[^\d]/g, '');
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

export function formatPhone(phone: string): string {
  phone = phone.replace(/[^\d]/g, '');
  if (phone.length === 11) {
    return phone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  } else if (phone.length === 10) {
    return phone.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  }
  return phone;
}

// Validação de formulário genérica
export type ValidationRule = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  type?: 'email' | 'password';
  custom?: (value: any) => string | null; // Retorna mensagem de erro ou null
  message?: string;
};

export type ValidationRules = Record<string, ValidationRule | ValidationRule[]>;

export function validateForm<T extends Record<string, any>>(
  data: T,
  rules: ValidationRules
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  
  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];
    const rulesArray = Array.isArray(fieldRules) ? fieldRules : [fieldRules];
    
    for (const rule of rulesArray) {
      // Required validation
      if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
        errors[field] = rule.message || `${field} é obrigatório`;
        break;
      }
      
      // Type-based validation
      if (rule.type === 'email' && value) {
        if (!isValidEmail(value as string)) {
          errors[field] = rule.message || 'Email inválido';
          break;
        }
      }
      
      if (rule.type === 'password' && value) {
        const result = validatePassword(value as string);
        if (!result.isValid) {
          errors[field] = rule.message || result.feedback[0] || 'Senha inválida';
          break;
        }
      }
      
      // Min length validation
      if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
        errors[field] = rule.message || `${field} deve ter no mínimo ${rule.minLength} caracteres`;
        break;
      }
      
      // Max length validation
      if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
        errors[field] = rule.message || `${field} deve ter no máximo ${rule.maxLength} caracteres`;
        break;
      }
      
      // Pattern validation
      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
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
