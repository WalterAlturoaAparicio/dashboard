"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/empty-state"
import { Clock, History } from "lucide-react"
import { cn } from "@/lib/utils"

interface Draw {
  date: string
  numbers: number[]
}

interface RecentDrawsProps {
  recentDraws: Draw[] | null
  isLoading: boolean
  onSelectDraw?: (numbers: number[]) => void
  selectedDraw?: number[] | null
  frequencyData?: Record<string, number>
}

function getNumberColor(
  num: number,
  frequencyData: Record<string, number> | undefined,
  isSelected: boolean
): string {
  if (!frequencyData || Object.keys(frequencyData).length === 0) {
    return isSelected
      ? "bg-primary text-primary-foreground shadow-md"
      : "bg-muted text-foreground"
  }

  const values = Object.values(frequencyData)
  const max = Math.max(...values)
  const freq = frequencyData[num.toString()] || 0
  const percentage = max > 0 ? (freq / max) * 100 : 0

  if (!isSelected) {
    return "bg-muted text-foreground"
  }

  // Sistema de colores basado en frecuencia
  if (percentage > 80) {
    return "bg-red-500 text-white shadow-md"
  } else if (percentage > 60) {
    return "bg-amber-500 text-white shadow-md"
  } else if (percentage > 40) {
    return "bg-blue-500 text-white shadow-md"
  } else {
    return "bg-primary text-primary-foreground shadow-md"
  }
}

export function RecentDraws({
  recentDraws,
  isLoading,
  onSelectDraw,
  selectedDraw,
  frequencyData,
}: RecentDrawsProps) {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="space-y-2 p-2">
              <Skeleton className="h-4 w-24" />
              <div className="flex gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-9 rounded-md" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (!recentDraws || recentDraws.length === 0) {
      return (
        <EmptyState
          icon={History}
          title="Sin sorteos"
          description="Selecciona una fecha para ver los sorteos."
          className="py-8"
        />
      )
    }

    return (
      <div className="space-y-2 animate-in fade-in-50 duration-500">
        {recentDraws.map((draw, index) => {
          const isSelected =
            selectedDraw &&
            draw.numbers.every((n, i) => n === selectedDraw[i])
          return (
            <div
              key={index}
              className={cn(
                "space-y-2 p-2 rounded-lg cursor-pointer transition-all duration-200",
                isSelected
                  ? "bg-primary/10 border border-primary scale-[1.02]"
                  : "hover:bg-muted/50 hover:scale-[1.01] border border-transparent"
              )}
              onClick={() => onSelectDraw?.(draw.numbers)}
            >
              <p className="text-xs font-medium text-muted-foreground">
                {draw.date}
              </p>
              <div className="flex gap-1.5 flex-wrap">
                {draw.numbers.slice(0, 5).map((num, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-md text-sm font-semibold transition-all duration-200",
                      getNumberColor(num, frequencyData, !!isSelected)
                    )}
                  >
                    {num}
                  </div>
                ))}
                <div className="flex items-center px-0.5">
                  <span className="text-xs text-muted-foreground">+</span>
                </div>
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-md text-sm font-semibold transition-all duration-200 ring-1 ring-primary/30",
                    getNumberColor(
                      draw.numbers[5],
                      frequencyData,
                      !!isSelected
                    )
                  )}
                >
                  {draw.numbers[5]}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground text-base">
          <Clock className="h-5 w-5 text-secondary" />
          Sorteos Recientes
        </CardTitle>
        <CardDescription className="text-muted-foreground text-xs">
          Haz clic para resaltar en las graficas
        </CardDescription>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  )
}
