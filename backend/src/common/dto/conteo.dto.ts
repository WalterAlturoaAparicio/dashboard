import { z } from 'zod'

export const ConteoQuerySchema = z.object({
  tipo: z.enum(['baloto', 'revancha']),
  fecha: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato YYYY-MM-DD')
    .optional(),
})

export type ConteoQueryDto = z.infer<typeof ConteoQuerySchema>
