import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Clock } from "lucide-react"

interface RecentDrawsProps {
  recentDraws: Record<string, number[]>[] | null
  isLoading: boolean
  onSelectDraw?: (numbers: number[]) => void
  selectedDraw?: number[] | null
}

export function RecentDraws({
  recentDraws,
  isLoading,
  onSelectDraw,
  selectedDraw,
}: RecentDrawsProps) {
  const finalDraws =
    recentDraws && recentDraws.length > 0
      ? recentDraws
      : [{ date: "2025-01-15", numbers: [0, 0, 0, 0, 0, 0] }]

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Clock className="h-5 w-5 text-secondary" />
          {"Sorteos Recientes"}
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {"Últimos resultados oficiales"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-3">
            {finalDraws.map((draw, index) => {
              const isSelected =
                selectedDraw &&
                draw.numbers.every((n, i) => n === selectedDraw[i])
              return (
                <div
                  key={index}
                  className={`space-y-2 p-2 rounded-md cursor-pointer transition-all ${
                    isSelected
                      ? "bg-primary/10 border border-primary"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => onSelectDraw?.(draw.numbers)}
                >
                  <p className="text-xs font-medium text-muted-foreground">
                    {draw.date}
                  </p>
                  <div className="flex gap-2">
                    {draw.numbers.map((num, i) => (
                      <div
                        key={i}
                        className={`flex h-10 w-10 items-center justify-center rounded-md text-sm font-semibold transition-colors ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
