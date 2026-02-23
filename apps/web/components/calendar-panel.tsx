"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { CalendarDays, Clock, CalendarRange, Infinity } from "lucide-react"
import { subMonths, subYears, startOfMonth, startOfYear } from "date-fns"

interface CalendarPanelProps {
  selectedDate: Date | undefined
  onDateChange: (date: Date | undefined) => void
  disabled?: boolean
}

export function CalendarPanel({
  selectedDate,
  onDateChange,
  disabled,
}: CalendarPanelProps) {
  const handleShortcut = (type: "always" | "year" | "month") => {
    const now = new Date()
    switch (type) {
      case "always":
        onDateChange(new Date("2015-01-01"))
        break
      case "year":
        onDateChange(startOfYear(subYears(now, 1)))
        break
      case "month":
        onDateChange(startOfMonth(subMonths(now, 1)))
        break
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground text-base">
          <CalendarDays className="h-5 w-5 text-primary" />
          Rango de Analisis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShortcut("always")}
            disabled={disabled}
            className="flex-1 min-w-[80px] transition-all duration-200 hover:scale-[1.02]"
          >
            <Infinity className="mr-1 h-3 w-3" />
            Siempre
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShortcut("year")}
            disabled={disabled}
            className="flex-1 min-w-[80px] transition-all duration-200 hover:scale-[1.02]"
          >
            <CalendarRange className="mr-1 h-3 w-3" />
            Ultimo Ano
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShortcut("month")}
            disabled={disabled}
            className="flex-1 min-w-[80px] transition-all duration-200 hover:scale-[1.02]"
          >
            <Clock className="mr-1 h-3 w-3" />
            Ultimo Mes
          </Button>
        </div>

        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateChange}
            disabled={(date) => date > new Date()}
            className="rounded-md border"
          />
        </div>

        {selectedDate && (
          <p className="text-xs text-center text-muted-foreground animate-in fade-in-50 duration-300">
            Analizando desde:{" "}
            <span className="font-medium text-foreground">
              {selectedDate.toLocaleDateString("es-CO", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
