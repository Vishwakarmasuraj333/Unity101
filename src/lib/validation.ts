import { z } from 'zod';

// Strict regex patterns
// Name: letters, spaces, hyphens, and apostrophes only - NO numbers or special symbols allowed
const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;

// Strict Email Regex: standard compliant email format with valid domain extension
const strictEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Phone: standard format allowing optional +, spaces, dashes, parentheses
const phoneCharRegex = /^[+]?[0-9\s()-]+$/;

// UK / International postal code format (letters, numbers, space, hyphen, 4 to 10 characters)
const postCodeRegex = /^[A-Za-z0-9\s-]{4,10}$/;

export const RegistrationSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters')
    .regex(nameRegex, 'First name must contain letters only (no numbers or symbols)'),
  last_name: z
    .string()
    .trim()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name cannot exceed 50 characters')
    .regex(nameRegex, 'Last name must contain letters only (no numbers or symbols)'),
  address: z
    .string()
    .trim()
    .min(5, 'Please enter a complete street address (min 5 characters)')
    .max(120, 'Address cannot exceed 120 characters'),
  town: z
    .string()
    .trim()
    .min(2, 'Town / City must be at least 2 characters')
    .max(50, 'Town / City cannot exceed 50 characters')
    .regex(nameRegex, 'Town / City must contain letters only (no numbers)'),
  post_code: z
    .string()
    .trim()
    .min(4, 'Post code must be at least 4 characters')
    .max(10, 'Post code cannot exceed 10 characters')
    .regex(postCodeRegex, 'Please enter a valid postal code (e.g. SO14 0AY)'),
  email: z
    .string()
    .trim()
    .min(5, 'Email is required')
    .max(100, 'Email cannot exceed 100 characters')
    .regex(strictEmailRegex, 'Please enter a valid, active email address (e.g. name@domain.com)'),
  mobile: z
    .string()
    .trim()
    .min(10, 'Mobile number must be at least 10 digits')
    .max(16, 'Mobile number cannot exceed 16 characters')
    .regex(phoneCharRegex, 'Mobile number must contain digits only (can include + prefix)')
    .refine(
      (val) => {
        const digits = val.replace(/\D/g, '');
        return digits.length >= 10 && digits.length <= 15;
      },
      {
        message: 'Mobile number must contain between 10 and 15 digits (e.g. 07700 900123 or +44 7700 900123)',
      }
    ),
  food_preference: z.enum(['Veg Food', 'Non Veg Food'], {
    message: 'Please select a food preference',
  }),
  gdpr_consent: z.literal(true, {
    message: 'You must agree to the GDPR consent to register',
  }),
});

export const AdminEditRegistrationSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters')
    .regex(nameRegex, 'First name must contain letters only (no numbers or symbols)'),
  last_name: z
    .string()
    .trim()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name cannot exceed 50 characters')
    .regex(nameRegex, 'Last name must contain letters only (no numbers or symbols)'),
  address: z
    .string()
    .trim()
    .min(5, 'Please enter a complete street address')
    .max(120, 'Address cannot exceed 120 characters'),
  town: z
    .string()
    .trim()
    .min(2, 'Town / City must be at least 2 characters')
    .max(50, 'Town / City cannot exceed 50 characters')
    .regex(nameRegex, 'Town / City must contain letters only (no numbers)'),
  post_code: z
    .string()
    .trim()
    .min(4, 'Post code must be at least 4 characters')
    .max(10, 'Post code cannot exceed 10 characters')
    .regex(postCodeRegex, 'Please enter a valid postal code (e.g. SO14 0AY)'),
  email: z
    .string()
    .trim()
    .min(5, 'Email is required')
    .max(100, 'Email cannot exceed 100 characters')
    .regex(strictEmailRegex, 'Please enter a valid email address'),
  mobile: z
    .string()
    .trim()
    .min(10, 'Mobile number must be at least 10 digits')
    .max(16, 'Mobile number cannot exceed 16 characters')
    .regex(phoneCharRegex, 'Mobile number must contain digits only')
    .refine(
      (val) => {
        const digits = val.replace(/\D/g, '');
        return digits.length >= 10 && digits.length <= 15;
      },
      {
        message: 'Mobile number must contain between 10 and 15 digits',
      }
    ),
  food_preference: z.enum(['Veg Food', 'Non Veg Food']),
  status: z.enum(['new', 'confirmed', 'cancelled']),
  notes: z.string().optional().nullable(),
});

export const AdminRegistrationSchema = RegistrationSchema.extend({
  status: z.enum(['new', 'confirmed', 'cancelled']),
  notes: z.string().optional().nullable(),
});

export const AdminLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .regex(strictEmailRegex, 'Please enter a valid administrative email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long'),
});

export const UpdateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(60, 'Name cannot exceed 60 characters')
    .regex(nameRegex, 'Name must contain letters only'),
  email: z
    .string()
    .trim()
    .regex(strictEmailRegex, 'Please enter a valid email address'),
  current_password: z.string().optional(),
  new_password: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || val.length >= 8, {
      message: 'New password must be at least 8 characters',
    })
    .refine((val) => !val || /[A-Z]/.test(val), {
      message: 'New password must contain at least one uppercase letter',
    })
    .refine((val) => !val || /[0-9]/.test(val), {
      message: 'New password must contain at least one number',
    }),
  confirm_password: z.string().optional().or(z.literal('')),
}).refine((data) => {
  if (data.new_password && !data.current_password) {
    return false;
  }
  return true;
}, {
  message: 'Current password is required to set a new password',
  path: ['current_password'],
}).refine((data) => {
  if (data.new_password && data.new_password !== data.confirm_password) {
    return false;
  }
  return true;
}, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

export type RegistrationFormData = z.infer<typeof RegistrationSchema>;
export type AdminEditRegistrationFormData = z.infer<typeof AdminEditRegistrationSchema>;
export type AdminRegistrationFormData = z.infer<typeof AdminRegistrationSchema>;
export type AdminLoginFormData = z.infer<typeof AdminLoginSchema>;
