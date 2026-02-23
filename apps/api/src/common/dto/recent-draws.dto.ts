import { z } from 'zod'

export const RecentDrawsQuerySchema = z.object({
  tipo: z.enum(['baloto', 'revancha']),
  cantidad: z.coerce
    .number()
    .int({ message: 'La cantidad debe ser un numero entero' })
    .min(1, 'La cantidad minima es 1')
    .max(100, 'La cantidad maxima es 100')
    .default(3),
})

export type RecentDrawsQueryDto = z.infer<typeof RecentDrawsQuerySchema>
