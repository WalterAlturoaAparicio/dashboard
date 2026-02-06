import { parseSpanishDate } from './date-parser'

describe('parseSpanishDate', () => {
  it('debe parsear fecha en formato "DD de MES de YYYY"', () => {
    const result = parseSpanishDate('15 de enero de 2024')
    expect(result.getFullYear()).toBe(2024)
    expect(result.getMonth()).toBe(0) // enero = 0
    expect(result.getDate()).toBe(15)
  })

  it('debe parsear todos los meses correctamente', () => {
    const meses = [
      { nombre: 'enero', indice: 0 },
      { nombre: 'febrero', indice: 1 },
      { nombre: 'marzo', indice: 2 },
      { nombre: 'abril', indice: 3 },
      { nombre: 'mayo', indice: 4 },
      { nombre: 'junio', indice: 5 },
      { nombre: 'julio', indice: 6 },
      { nombre: 'agosto', indice: 7 },
      { nombre: 'septiembre', indice: 8 },
      { nombre: 'octubre', indice: 9 },
      { nombre: 'noviembre', indice: 10 },
      { nombre: 'diciembre', indice: 11 },
    ]

    for (const { nombre, indice } of meses) {
      const result = parseSpanishDate(`1 de ${nombre} de 2024`)
      expect(result.getMonth()).toBe(indice)
    }
  })

  it('debe ser case-insensitive', () => {
    const result = parseSpanishDate('15 de Enero de 2024')
    expect(result.getMonth()).toBe(0)
  })

  it('debe manejar dias de un solo digito', () => {
    const result = parseSpanishDate('5 de marzo de 2024')
    expect(result.getDate()).toBe(5)
  })

  it('debe lanzar error con formato invalido', () => {
    expect(() => parseSpanishDate('2024-01-15')).toThrow(
      'Formato de fecha invalido',
    )
  })

  it('debe lanzar error con mes desconocido', () => {
    expect(() => parseSpanishDate('15 de invalid de 2024')).toThrow(
      'Mes desconocido',
    )
  })

  it('debe lanzar error con string vacio', () => {
    expect(() => parseSpanishDate('')).toThrow('Formato de fecha invalido')
  })
})
