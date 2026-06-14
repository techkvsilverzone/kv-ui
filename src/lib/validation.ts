import { z } from 'zod';

/**
 * Shared form validation schemas (zod) used across the storefront forms.
 * Keep field-level rules here so every form validates consistently and the
 * server-side rules have a single client mirror.
 */

const digitsOnly = (value: string) => value.replace(/\D/g, '');

/** Indian mobile: 10 digits starting 6-9, tolerant of spaces / +91 prefix. */
export const phoneSchema = z
  .string()
  .trim()
  .min(1, 'Phone number is required')
  .refine((v) => {
    let d = digitsOnly(v);
    if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
    return /^[6-9]\d{9}$/.test(d);
  }, 'Enter a valid 10-digit Indian mobile number');

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Enter a valid email address');

export const pincodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, 'Enter a valid 6-digit PIN code');

export const nameSchema = z
  .string()
  .trim()
  .min(2, 'Please enter at least 2 characters');

export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: 'Please accept the terms and conditions' }),
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export const shippingAddressSchema = z.object({
  firstName: nameSchema,
  lastName: z.string().trim().min(1, 'Last name is required'),
  address: z.string().trim().min(5, 'Please enter a complete address'),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().min(2, 'State is required'),
  pincode: pincodeSchema,
  phone: phoneSchema,
});

export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  message: z.string().trim().min(10, 'Please enter at least 10 characters'),
});

export const profileSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: z
    .string()
    .trim()
    .optional()
    .refine((v) => {
      if (!v) return true;
      let d = digitsOnly(v);
      if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
      return /^[6-9]\d{9}$/.test(d);
    }, 'Enter a valid 10-digit Indian mobile number'),
  pincode: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^\d{6}$/.test(v), 'Enter a valid 6-digit PIN code'),
});

/**
 * Validates `data` against `schema`. Returns `{ success, errors }` where `errors`
 * is a flat `{ field: firstErrorMessage }` map (empty when valid) for inline display.
 */
export function validateForm(
  schema: z.ZodTypeAny,
  data: unknown,
): { success: boolean; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  if (result.success) return { success: true, errors: {} };

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join('.') || 'form';
    if (!errors[key]) errors[key] = issue.message;
  }
  return { success: false, errors };
}
