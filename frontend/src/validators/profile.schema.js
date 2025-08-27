//src/validators/profile.schema.js

import { z } from 'zod';

export const updateProfileSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  firstName: z.string().max(50).optional(),
  lastName: z.string().max(50).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  dateOfBirth: z.coerce.date().optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
});
