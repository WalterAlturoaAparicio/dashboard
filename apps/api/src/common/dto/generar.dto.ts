import { z } from 'zod'

export const GenerarQuerySchema = z.object({
  tipo: z.enum(['baloto', 'revancha']),
  fecha: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato YYYY-MM-DD')
    .optional(),
  tickets: z.coerce
    .number()
    .int({ message: 'La cantidad de tickets debe ser un numero entero' })
    .min(1, 'La cantidad minima de tickets es 1')
    .max(10, 'La cantidad maxima de tickets es 10')
    .default(1),
})

export type GenerarQueryDto = z.infer<typeof GenerarQuerySchema>
