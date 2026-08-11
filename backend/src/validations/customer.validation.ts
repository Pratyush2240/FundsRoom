import { CustomerStatus, CustomerType } from '@prisma/client';
import { z } from 'zod';

const optionalText = z.string().trim().optional();
const optionalNullableText = z.string().trim().nullable().optional();
const optionalEmail = z
  .string()
  .trim()
  .email('Invalid email address')
  .transform((value) => value.toLowerCase())
  .nullable()
  .optional();

const customerFields = {
  name: z.string().trim().min(1, 'Name is required'),
  mobile: optionalText,
  email: optionalEmail,
  businessName: optionalText,
  gstNumber: optionalNullableText,
  customerType: z.nativeEnum(CustomerType),
  address: optionalText,
  status: z.nativeEnum(CustomerStatus),
  followUpDate: z.coerce.date().nullable().optional(),
  notes: optionalNullableText,
};

export const createCustomerSchema = z.object(customerFields).transform((data) => ({
  ...data,
  // These fields are optional at the API boundary but remain required columns in the
  // existing schema, so absent values are represented as empty strings.
  mobile: data.mobile ?? '',
  businessName: data.businessName ?? '',
  address: data.address ?? '',
}));

export const updateCustomerSchema = z
  .object({
    ...customerFields,
    name: customerFields.name.optional(),
    customerType: customerFields.customerType.optional(),
    status: customerFields.status.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, 'At least one field is required');

export const customerIdSchema = z.object({
  id: z.string().uuid('Invalid customer ID'),
});

export const customerListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().max(100).optional(),
  status: z.nativeEnum(CustomerStatus).optional(),
  customerType: z.nativeEnum(CustomerType).optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CustomerListQuery = z.infer<typeof customerListQuerySchema>;
