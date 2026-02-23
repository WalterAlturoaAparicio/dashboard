const SPANISH_MONTHS: Record<string, number> = {
  enero: 0,
  febrero: 1,
  marzo: 2,
  abril: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  agosto: 7,
  septiembre: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11,
}

export function parseSpanishDate(dateStr: string): Date {
  const regex = /(\d{1,2}) de (\w+) de (\d{4})/
  const match = dateStr.toLowerCase().match(regex)

  if (!match) {
    throw new Error(`Formato de fecha invalido: ${dateStr}`)
  }

  const day = parseInt(match[1])
  const month = SPANISH_MONTHS[match[2]]
  const year = parseInt(match[3])

  if (month === undefined) {
    throw new Error(`Mes desconocido: ${match[2]}`)
  }

  return new Date(year, month, day)
}
