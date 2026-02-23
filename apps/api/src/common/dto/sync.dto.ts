import { z } from 'zod'

export const SyncQuerySchema = z.object({
  after: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/,
      'Formato invalido. Usar YYYY-MM-DD o ISO 8601',
    ),
})

export type SyncQueryDto = z.infer<typeof SyncQuerySchema>
