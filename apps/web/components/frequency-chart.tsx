"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/empty-state"
import { ErrorState } from "@/components/error-state"
import { BarChart3 } from "lucide-react"

interface FrequencyChartProps {
  title: string
  data?: Record<string, number>
  isLoading: boolean
  selectedDraw?: number[]
  hasData?: boolean
  error?: string | null
  onRetry?: () => void
}

export function FrequencyChart({
  title,
  data,
  isLoading,
  selectedDraw = [],
  hasData = false,
  error,
  onRetry,
}: FrequencyChartProps) {
  const chartData = data
    ? Object.entries(data).map(([number, count]) => ({
        number: Number(number),
        count: Number(count),
      }))
    : []

  const getBarColor = (number: number, count: number) => {
    const max = Math.max(...chartData.map((d) => d.count))
    const percentage = max > 0 ? (count / max) * 100 : 0

    const baseColor =
      percentage > 80
        ? "hsl(0, 80%, 50%)"
        : percentage > 60
          ? "hsl(45, 100%, 50%)"
          : "hsl(210, 100%, 56%)"
    if (!selectedDraw || selectedDraw.length === 0) {
      return baseColor
    }
    const isHighlighted = selectedDraw.includes(number)
    return isHighlighted ? baseColor : "hsl(0, 0%, 60%, 0.3)"
  }

  const renderContent = () => {
    if (error) {
      return (
        <ErrorState
          title="Error al cargar"
          message={error}
          onRetry={onRetry}
          className="h-[400px]"
        />
      )
    }

    if (isLoading) {
      return (
        <div className="space-y-4 h-[400px] p-4">
          <div className="flex items-end gap-1 h-full">
            {Array.from({ length: 20 }).map((_, i) => (
              <Skeleton
                key={i}
                className="flex-1"
                style={{ height: `${Math.random() * 60 + 20}%` }}
              />
            ))}
          </div>
        </div>
      )
    }

    if (!hasData || chartData.length === 0) {
      return (
        <EmptyState
          icon={BarChart3}
          title="Sin datos"
          description="Selecciona una fecha y haz clic en 'Obtener Conteo' para ver la frecuencia de numeros."
          className="h-[400px]"
        />
      )
    }

    return (
      <div className="animate-in fade-in-50 duration-500">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
            />
            <XAxis
              dataKey="number"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              interval={0}
              angle={-45}
              textAnchor="end"
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                color: "hsl(var(--foreground))",
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} animationDuration={800}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getBarColor(entry.number, entry.count)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">
          {`Frecuencia de Numeros ${title}`}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Cantidad de veces que cada numero ha aparecido
        </CardDescription>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  )
}
