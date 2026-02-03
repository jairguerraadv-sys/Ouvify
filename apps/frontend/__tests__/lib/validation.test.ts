import { 
  isValidEmail, 
  validatePassword, 
  isValidSubdomain,
  validateSubdomain,
  isReservedSubdomain,
  isValidCNPJ,
  formatCNPJ,
  formatPhone,
  validateForm,
} from '@/lib/validation'

describe('Validation Utils', () => {
  describe('isValidEmail', () => {
    it('validates correct email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true)
      expect(isValidEmail('test.user@domain.co.uk')).toBe(true)
      expect(isValidEmail('user+tag@example.com')).toBe(true)
    })

    it('rejects invalid email addresses', () => {
      expect(isValidEmail('')).toBe(false)
      expect(isValidEmail('invalid')).toBe(false)
      expect(isValidEmail('user@')).toBe(false)
      expect(isValidEmail('@domain.com')).toBe(false)
      expect(isValidEmail('user @domain.com')).toBe(false)
    })
  })

  describe('validatePassword', () => {
    it('validates strong password', () => {
      const result = validatePassword('Str0ng!Pass')
      expect(result.isValid).toBe(true)
      expect(result.strength).toBe('strong')
      expect(result.feedback).toHaveLength(0)
    })

    it('detects weak password - too short', () => {
      const result = validatePassword('Weak1!')
      expect(result.isValid).toBe(false)
      expect(result.feedback).toContain('Mínimo de 8 caracteres')
    })

    it('detects weak password - no uppercase', () => {
      const result = validatePassword('weak1password!')
      expect(result.isValid).toBe(false)
      expect(result.feedback).toContain('Adicione letras maiúsculas')
    })

    it('detects weak password - no lowercase', () => {
      const result = validatePassword('WEAK1PASSWORD!')
      expect(result.isValid).toBe(false)
      expect(result.feedback).toContain('Adicione letras minúsculas')
    })

    it('detects weak password - no numbers', () => {
      const result = validatePassword('WeakPassword!')
      expect(result.isValid).toBe(false)
      expect(result.feedback).toContain('Adicione números')
    })

    it('detects weak password - no special chars', () => {
      const result = validatePassword('WeakPassword1')
      expect(result.isValid).toBe(false)
      expect(result.feedback).toContain('Adicione caracteres especiais')
    })

    it('classifies medium strength password', () => {
      const result = validatePassword('MediumPass123')
      expect(result.isValid).toBe(false)
      expect(result.strength).toBe('medium')
      expect(result.feedback.length).toBeLessThanOrEqual(2)
    })
  })

  describe('isValidSubdomain', () => {
    it('validates correct subdomains', () => {
      expect(isValidSubdomain('minhaempresa')).toBe(true)
      expect(isValidSubdomain('empresa-123')).toBe(true)
      expect(isValidSubdomain('abc')).toBe(true)
    })

    it('rejects invalid subdomains', () => {
      expect(isValidSubdomain('')).toBe(false)
      expect(isValidSubdomain('ab')).toBe(false) // muito curto
      expect(isValidSubdomain('minha-empresa')).toBe(true) // hífen é válido
      expect(isValidSubdomain('empresa_teste')).toBe(false) // underscore
      expect(isValidSubdomain('EMPRESA')).toBe(false) // maiúsculas
    })

    it('rejects reserved subdomains via validateSubdomain', () => {
      expect(validateSubdomain('www')).toContain('reservado')
      expect(validateSubdomain('api')).toContain('reservado')
      expect(validateSubdomain('admin')).toContain('reservado')
    })

    it('validates subdomain length', () => {
      expect(validateSubdomain('ab')).toContain('mínimo 3 caracteres')
      expect(validateSubdomain('a'.repeat(64))).toContain('máximo 63 caracteres')
    })
  })

  describe('isReservedSubdomain', () => {
    it('identifies reserved subdomains', () => {
      expect(isReservedSubdomain('www')).toBe(true)
      expect(isReservedSubdomain('api')).toBe(true)
      expect(isReservedSubdomain('admin')).toBe(true)
      expect(isReservedSubdomain('ouvify')).toBe(true)
    })

    it('allows non-reserved subdomains', () => {
      expect(isReservedSubdomain('minhaempresa')).toBe(false)
      expect(isReservedSubdomain('teste123')).toBe(false)
    })
  })

  describe('isValidCNPJ', () => {
    it('validates correct CNPJ', () => {
      expect(isValidCNPJ('11222333000181')).toBe(true)
      expect(isValidCNPJ('11.222.333/0001-81')).toBe(true)
    })

    it('rejects invalid CNPJ', () => {
      expect(isValidCNPJ('')).toBe(false)
      expect(isValidCNPJ('00000000000000')).toBe(false)
      expect(isValidCNPJ('11111111111111')).toBe(false)
    })

    it('rejects CNPJ with incorrect check digits', () => {
      expect(isValidCNPJ('11222333000180')).toBe(false)
    })
  })

  describe('formatCNPJ', () => {
    it('formats CNPJ correctly', () => {
      expect(formatCNPJ('11222333000181')).toBe('11.222.333/0001-81')
    })

    it('handles already formatted CNPJ', () => {
      const formatted = formatCNPJ('11.222.333/0001-81')
      expect(formatted).toContain('11')
      expect(formatted).toContain('222')
    })
  })

  describe('formatPhone', () => {
    it('formats cellphone correctly', () => {
      expect(formatPhone('11987654321')).toBe('(11) 98765-4321')
    })

    it('formats landline correctly', () => {
      expect(formatPhone('1133334444')).toBe('(11) 3333-4444')
    })

    it('returns unformatted for invalid length', () => {
      expect(formatPhone('123')).toBe('123')
    })
  })

  describe('validateForm', () => {
    it('validates required fields', () => {
      const data = { name: '', email: 'test@example.com' }
      const rules = {
        name: { required: true },
        email: { required: true },
      }

      const result = validateForm(data, rules)
      expect(result.isValid).toBe(false)
      expect(result.errors.name).toBeDefined()
    })

    it('validates email type', () => {
      const data = { email: 'invalid-email' }
      const rules = { email: { type: 'email' as const } }

      const result = validateForm(data, rules)
      expect(result.isValid).toBe(false)
      expect(result.errors.email).toContain('Email inválido')
    })

    it('validates password type', () => {
      const data = { password: 'weak' }
      const rules = { password: { type: 'password' as const } }

      const result = validateForm(data, rules)
      expect(result.isValid).toBe(false)
      expect(result.errors.password).toBeDefined()
    })

    it('validates minLength', () => {
      const data = { username: 'ab' }
      const rules = { username: { minLength: 3 } }

      const result = validateForm(data, rules)
      expect(result.isValid).toBe(false)
      expect(result.errors.username).toContain('mínimo')
    })

    it('validates maxLength', () => {
      const data = { bio: 'a'.repeat(101) }
      const rules = { bio: { maxLength: 100 } }

      const result = validateForm(data, rules)
      expect(result.isValid).toBe(false)
      expect(result.errors.bio).toContain('máximo')
    })

    it('validates with custom function', () => {
      const data = { age: 15 }
      const rules = {
        age: {
          custom: (value: number) => value < 18 ? 'Deve ser maior de 18' : null,
        },
      }

      const result = validateForm(data, rules)
      expect(result.isValid).toBe(false)
      expect(result.errors.age).toBe('Deve ser maior de 18')
    })

    it('returns no errors for valid data', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Str0ng!Pass',
      }
      const rules = {
        name: { required: true, minLength: 3 },
        email: { required: true, type: 'email' as const },
        password: { required: true, type: 'password' as const },
      }

      const result = validateForm(data, rules)
      expect(result.isValid).toBe(true)
      expect(Object.keys(result.errors)).toHaveLength(0)
    })
  })
})
