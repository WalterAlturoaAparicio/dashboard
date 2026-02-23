"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Sparkles, Info, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface Ticket {
  numeros: number[]
  superbalota: number
}

interface TicketGeneratorProps {
  tickets: Ticket[]
  isLoading: boolean
  onGenerate: (cantidad: number) => void
  onRefresh: () => void
  isRefreshing: boolean
  selectedDraw: number[] | null
  frequencyData: Record<string, number>
  isOffline?: boolean
}

function getNumberColor(
  num: number,
  frequencyData: Record<string, number>,
  selectedDraw: number[] | null
): string {
  if (!frequencyData || Object.keys(frequencyData).length === 0) {
    return "bg-primary"
  }

  const values = Object.values(frequencyData)
  const max = Math.max(...values)
  const freq = frequencyData[num.toString()] || 0
  const percentage = max > 0 ? (freq / max) * 100 : 0

  // Si hay un sorteo seleccionado, atenuar los que no coinciden
  if (selectedDraw && selectedDraw.length > 0) {
    const isInSelected = selectedDraw.includes(num)
    if (!isInSelected) {
      return "bg-muted text-muted-foreground"
    }
  }

  // Sistema de colores basado en frecuencia
  if (percentage > 80) {
    return "bg-red-500 text-white" // Alta frecuencia
  } else if (percentage > 60) {
    return "bg-amber-500 text-white" // Media-alta
  } else if (percentage > 40) {
    return "bg-blue-500 text-white" // Media
  } else {
    return "bg-primary text-primary-foreground" // Baja
  }
}

export function TicketGenerator({
  tickets,
  isLoading,
  onGenerate,
  onRefresh,
  isRefreshing,
  selectedDraw,
  frequencyData,
  isOffline = false,
}: TicketGeneratorProps) {
  const [cantidad, setCantidad] = useState(1)
  const [error, setError] = useState<string | null>(null)

  const handleCantidadChange = (value: string) => {
    const num = parseInt(value, 10)
    if (isNaN(num) || num < 1) {
      setCantidad(1)
      setError("Minimo 1 ticket")
    } else if (num > 10) {
      setCantidad(10)
      setError("Maximo 10 tickets")
    } else {
      setCantidad(num)
      setError(null)
    }
  }

  const handleGenerate = () => {
    setError(null)
    onGenerate(cantidad)
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <Sparkles className="h-5 w-5 text-primary" />
            Generador de Tickets
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[250px]">
                <p>
                  Los numeros se generan de forma aleatoria pero ponderada
                  segun la frecuencia historica. Los numeros mas frecuentes
                  tienen mayor probabilidad de aparecer.
                </p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </div>
        <CardDescription className="text-muted-foreground">
          Genera tickets con numeros ponderados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="number"
              min={1}
              max={10}
              value={cantidad}
              onChange={(e) => handleCantidadChange(e.target.value)}
              placeholder="Cantidad"
              className="h-9"
              disabled={isLoading}
            />
            {error && (
              <p className="text-xs text-destructive mt-1 animate-in fade-in-50">
                {error}
              </p>
            )}
          </div>
          <Button
            onClick={handleGenerate}
            disabled={isLoading || isRefreshing}
            className="transition-all duration-200 hover:scale-[1.02]"
          >
            <Sparkles
              className={cn("mr-2 h-4 w-4", isLoading && "animate-pulse")}
            />
            Generar
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading || isRefreshing || isOffline}
          className="w-full transition-all duration-200"
        >
          <RefreshCw
            className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")}
          />
          {isOffline ? "Sin conexion" : "Actualizar Resultados"}
        </Button>

        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: cantidad }).map((_, index) => (
                <div key={index} className="p-3 rounded-lg border">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <div className="flex gap-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-10 rounded-md" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : tickets.length > 0 ? (
            <div className="space-y-3 animate-in fade-in-50 duration-500">
              {tickets.map((ticket, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border bg-muted/30 transition-all duration-300 hover:bg-muted/50"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <p className="text-xs text-muted-foreground mb-2">
                    Ticket #{index + 1}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {ticket.numeros.map((num, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-md text-sm font-bold shadow-sm transition-all duration-300 hover:scale-110",
                          getNumberColor(num, frequencyData, selectedDraw)
                        )}
                      >
                        {num}
                      </div>
                    ))}
                    <div className="flex items-center px-1">
                      <span className="text-muted-foreground">+</span>
                    </div>
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-md text-sm font-bold shadow-sm ring-2 ring-primary/50 transition-all duration-300 hover:scale-110",
                        getNumberColor(
                          ticket.superbalota,
                          frequencyData,
                          selectedDraw
                        )
                      )}
                    >
                      {ticket.superbalota}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-3 rounded-full bg-muted p-3">
                <Sparkles className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Genera tu primer ticket
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
