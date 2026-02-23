import { Tipo } from '../common/types'
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  CreateDateColumn,
  Index,
} from 'typeorm'
import { NumericArrayTransformer } from './transformers/numeric-array.transformer'

@Entity('sorteo')
@Unique(['fecha', 'tipo'])
export class Sorteo {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'date' })
  fecha: Date

  @Column({ type: 'varchar', length: 20 })
  tipo: Tipo

  @Column({ type: 'text', transformer: new NumericArrayTransformer() })
  numeros: number[]

  @Column({ type: 'int' })
  superbalota: number

  @Column({ type: 'text', nullable: true })
  fuente?: string

  @Index()
  @CreateDateColumn({ name: 'timestamp_guardado' })
  timestampGuardado: Date
}
