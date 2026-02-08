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

  @Column({ type: 'text', nullable: true })
  fecha: string

  @Column({ type: 'varchar', length: 20 })
  tipo: Tipo

  @Column({
    type: 'text',
    transformer: new JsonArrayTransformer(),
    nullable: true,
  })
  numeros: number[]

  @Column({ type: 'int', nullable: true })
  superbalota: number

  @Column({ type: 'text', nullable: true })
  fuente?: string

  @CreateDateColumn({ name: 'timestamp_guardado' })
  timestampGuardado: Date
}
