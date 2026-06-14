import { describe, expect, it } from 'vitest';
import {
  validateForm,
  loginSchema,
  signupSchema,
  shippingAddressSchema,
  contactSchema,
} from './validation';

describe('validateForm + schemas', () => {
  describe('loginSchema', () => {
    it('accepts a valid login', () => {
      const r = validateForm(loginSchema, { email: 'a@b.com', password: 'secret' });
      expect(r.success).toBe(true);
      expect(r.errors).toEqual({});
    });

    it('rejects a bad email and empty password', () => {
      const r = validateForm(loginSchema, { email: 'nope', password: '' });
      expect(r.success).toBe(false);
      expect(r.errors.email).toBeTruthy();
      expect(r.errors.password).toBeTruthy();
    });
  });

  describe('signupSchema', () => {
    it('accepts a valid signup', () => {
      const r = validateForm(signupSchema, {
        name: 'Asha',
        email: 'asha@example.com',
        password: 'secret1',
        confirmPassword: 'secret1',
        acceptTerms: true,
      });
      expect(r.success).toBe(true);
    });

    it('flags mismatched passwords on confirmPassword', () => {
      const r = validateForm(signupSchema, {
        name: 'Asha',
        email: 'asha@example.com',
        password: 'secret1',
        confirmPassword: 'secret2',
        acceptTerms: true,
      });
      expect(r.success).toBe(false);
      expect(r.errors.confirmPassword).toMatch(/match/i);
    });

    it('requires accepting terms', () => {
      const r = validateForm(signupSchema, {
        name: 'Asha',
        email: 'asha@example.com',
        password: 'secret1',
        confirmPassword: 'secret1',
        acceptTerms: false,
      });
      expect(r.success).toBe(false);
      expect(r.errors.acceptTerms).toBeTruthy();
    });
  });

  describe('shippingAddressSchema', () => {
    const valid = {
      firstName: 'Asha',
      lastName: 'K',
      address: '14 Rajaram St',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600001',
      phone: '9876543210',
    };

    it('accepts a complete address', () => {
      expect(validateForm(shippingAddressSchema, valid).success).toBe(true);
    });

    it('accepts a +91-prefixed, spaced phone', () => {
      expect(validateForm(shippingAddressSchema, { ...valid, phone: '+91 98765 43210' }).success).toBe(true);
    });

    it.each(['12345', '7654321', '0123456789', 'abcdefghij'])(
      'rejects invalid phone %s',
      (phone) => {
        const r = validateForm(shippingAddressSchema, { ...valid, phone });
        expect(r.success).toBe(false);
        expect(r.errors.phone).toBeTruthy();
      },
    );

    it.each(['60001', '6000011', 'abcdef'])('rejects invalid pincode %s', (pincode) => {
      const r = validateForm(shippingAddressSchema, { ...valid, pincode });
      expect(r.success).toBe(false);
      expect(r.errors.pincode).toBeTruthy();
    });
  });

  describe('contactSchema', () => {
    it('requires a message of reasonable length', () => {
      const r = validateForm(contactSchema, {
        name: 'Asha',
        email: 'a@b.com',
        phone: '9876543210',
        message: 'hi',
      });
      expect(r.success).toBe(false);
      expect(r.errors.message).toBeTruthy();
    });
  });
});
