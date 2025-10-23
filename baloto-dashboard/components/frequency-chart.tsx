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

interface FrequencyChartProps {
  title: string
  data?: Record<string, number>
  isLoading: boolean
}

export function FrequencyChart({
  title,
  data,
  isLoading,
}: FrequencyChartProps) {
  const chartData = data
    ? Object.entries(data).map(([number, count]) => ({
        number: Number(number),
        count: Number(count),
      }))
    : []

  // Sample data for demonstration
  const sampleData = Array.from({ length: 43 }, (_, i) => ({
    number: i + 1,
    count: 0,
  }))

  const finalData = chartData.length > 0 ? chartData : sampleData

  const getBarColor = (count: number) => {
    const max = Math.max(...finalData.map((d: any) => d.count))
    const percentage = (count / max) * 100

    if (percentage > 80) return "hsl(0, 80%, 50%)" // rojo
    if (percentage > 60) return "hsl(45, 100%, 50%)" // amarillo
    return "hsl(210, 100%, 56%)"
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">
          {`Frecuencia de Números ${title}`}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {"Cantidad de veces que cada número ha aparecido"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[400px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={finalData}>
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
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {finalData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.count)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
