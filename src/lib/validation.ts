import { z } from 'zod';

// Mobile phone regex allowing UK format (07..., +447...) and common international formats
const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,20}$/;

export const RegistrationSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(2, 'First name must be at least 2 characters')
    .max(100, 'First name cannot exceed 100 characters'),
  last_name: z
    .string()
    .trim()
    .min(2, 'Last name must be at least 2 characters')
    .max(100, 'Last name cannot exceed 100 characters'),
  address: z
    .string()
    .trim()
    .min(3, 'Address must be at least 3 characters')
    .max(255, 'Address cannot exceed 255 characters'),
  town: z
    .string()
    .trim()
    .min(2, 'Town must be at least 2 characters')
    .max(100, 'Town cannot exceed 100 characters'),
  post_code: z
    .string()
    .trim()
    .min(2, 'Post Code is required')
    .max(20, 'Post Code cannot exceed 20 characters'),
  email: z
    .string()
    .trim()
    .email('Invalid email address')
    .max(150, 'Email cannot exceed 150 characters'),
  mobile: z
    .string()
    .trim()
    .regex(phoneRegex, 'Please enter a valid mobile phone number')
    .max(30, 'Mobile cannot exceed 30 characters'),
  food_preference: z.enum(['Veg Food', 'Non Veg Food'], {
    message: 'Please select a food preference',
  }),
  gdpr_consent: z.literal(true, {
    message: 'You must agree to the GDPR consent to register',
  }),
  status: z.enum(['new', 'confirmed', 'cancelled']).optional().default('new'),
  notes: z.string().optional().nullable(),
});

export const AdminRegistrationSchema = RegistrationSchema.extend({
  gdpr_consent: z.boolean().default(true),
  status: z.enum(['new', 'confirmed', 'cancelled']).default('new'),
});

export const AdminLoginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const UpdateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email address'),
  current_password: z.string().optional(),
  new_password: z.string().min(8, 'New password must be at least 8 characters').optional().or(z.literal('')),
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
export type AdminLoginFormData = z.infer<typeof AdminLoginSchema>;
