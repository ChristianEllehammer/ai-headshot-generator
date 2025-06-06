
import { z } from 'zod';

// Enums for different options
export const backgroundStyleEnum = z.enum(['plain', 'office', 'outdoor', 'studio', 'gradient']);
export const attireEnum = z.enum(['business_casual', 'formal', 'casual', 'smart_casual']);
export const expressionEnum = z.enum(['smiling', 'serious', 'confident', 'friendly', 'professional']);
export const headshotStatusEnum = z.enum(['pending', 'processing', 'completed', 'failed']);

// User schema
export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

// Headshot generation request schema
export const headshotRequestSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  original_image_url: z.string().url(),
  background_style: backgroundStyleEnum,
  attire: attireEnum,
  expression: expressionEnum,
  status: headshotStatusEnum,
  generated_image_url: z.string().url().nullable(),
  error_message: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type HeadshotRequest = z.infer<typeof headshotRequestSchema>;

// Input schemas
export const createUserInputSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1, 'Name is required')
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

export const createHeadshotRequestInputSchema = z.object({
  user_id: z.number(),
  original_image_url: z.string().url(),
  background_style: backgroundStyleEnum,
  attire: attireEnum,
  expression: expressionEnum
});

export type CreateHeadshotRequestInput = z.infer<typeof createHeadshotRequestInputSchema>;

export const updateHeadshotRequestInputSchema = z.object({
  id: z.number(),
  status: headshotStatusEnum.optional(),
  generated_image_url: z.string().url().nullable().optional(),
  error_message: z.string().nullable().optional()
});

export type UpdateHeadshotRequestInput = z.infer<typeof updateHeadshotRequestInputSchema>;

export const getUserHeadshotsInputSchema = z.object({
  user_id: z.number()
});

export type GetUserHeadshotsInput = z.infer<typeof getUserHeadshotsInputSchema>;

export const getHeadshotByIdInputSchema = z.object({
  id: z.number()
});

export type GetHeadshotByIdInput = z.infer<typeof getHeadshotByIdInputSchema>;

// Response schemas
export const headshotWithUserSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  original_image_url: z.string().url(),
  background_style: backgroundStyleEnum,
  attire: attireEnum,
  expression: expressionEnum,
  status: headshotStatusEnum,
  generated_image_url: z.string().url().nullable(),
  error_message: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  user: userSchema
});

export type HeadshotWithUser = z.infer<typeof headshotWithUserSchema>;
