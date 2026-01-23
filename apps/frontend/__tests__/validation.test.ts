import { validateForm } from '@/lib/validation';

describe('Validation Library', () => {
  describe('validateForm', () => {
    it('validates required fields', () => {
      const data = { name: '', email: 'test@example.com' };
      const rules = {
        name: { required: true },
        email: { required: true },
      };

      const result = validateForm(data, rules);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBeTruthy();
      expect(result.errors.email).toBeFalsy();
    });

    it('validates email format', () => {
      const data = { email: 'invalid-email' };
      const rules = { email: { required: true, type: 'email' as const } };

      const result = validateForm(data, rules);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toContain('Email');
    });

    it('validates minLength', () => {
      const data = { password: '123' };
      const rules = { password: { required: true, minLength: 8 } };

      const result = validateForm(data, rules);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toContain('8');
    });

    it('validates maxLength', () => {
      const data = { title: 'a'.repeat(201) };
      const rules = { title: { required: true, maxLength: 200 } };

      const result = validateForm(data, rules);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.title).toContain('200');
    });

    it('returns valid when all rules pass', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };
      const rules = {
        name: { required: true, minLength: 3 },
        email: { required: true, type: 'email' as const },
        password: { required: true, minLength: 8 },
      };

      const result = validateForm(data, rules);
      
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });
  });
});
