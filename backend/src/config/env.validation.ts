import * as Joi from 'joi';

// Defines the schema for environment variables
export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().required().min(32), // Ensure secret is strong enough
  JWT_EXPIRATION_TIME: Joi.string().default('3600s'),
  CORS_ORIGIN: Joi.string().required(),
  REDIS_HOST: Joi.string().default('redis'),
  REDIS_PORT: Joi.number().default(6379),
});

// If using Zod instead:
// import { z } from 'zod';
// export const validationSchema = z.object({
//   NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
//   PORT: z.coerce.number().default(3000), // coerce converts string env var to number
//   DATABASE_URL: z.string().url(),
//   JWT_SECRET: z.string().min(32),
//   JWT_EXPIRATION_TIME: z.string().default('3600s'),
//   CORS_ORIGIN: z.string().url(),
//   REDIS_HOST: z.string().default('redis'),
//   REDIS_PORT: z.coerce.number().default(6379),
// });
// export type EnvironmentVariables = z.infer<typeof validationSchema>;