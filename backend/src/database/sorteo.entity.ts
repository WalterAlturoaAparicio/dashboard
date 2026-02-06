import { Tipo } from '../common/types'
import { JsonArrayTransformer } from './transformers/json-array.transformer'
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  CreateDateColumn,
} from 'typeorm'

@Entity('sorteo')
@Unique(['fecha', 'tipo'])
export class Sorteo {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'text' })
  fecha: string

  @Column({ type: 'varchar', length: 20 })
  tipo: Tipo

  @Column({ type: 'text', transformer: new JsonArrayTransformer() })
  numeros: number[]

  @Column({ type: 'int' })
  superbalota: number

  @Column({ type: 'text', nullable: true })
  fuente?: string

  @CreateDateColumn({ name: 'timestamp_guardado', type: 'datetime' })
  timestampGuardado: Date
}
