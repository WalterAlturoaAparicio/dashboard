import { Tipo } from '../common/types'
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  CreateDateColumn,
  Index,
} from 'typeorm'

@Entity('sorteo')
@Unique(['fecha', 'tipo'])
export class Sorteo {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'date' })
  fecha: Date

  @Column({ type: 'varchar', length: 20 })
  tipo: Tipo

  @Column({ type: 'int', array: true })
  numeros: number[]

  @Column({ type: 'int' })
  superbalota: number

  @Column({ type: 'text', nullable: true })
  fuente?: string

  @Index()
  @CreateDateColumn({ name: 'timestamp_guardado' })
  timestampGuardado: Date
}
