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

interface Draw {
  date: string
  numbers: number[]
}

interface RecentDrawsProps {
  recentDraws: Draw[] | null
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
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2 p-2">
              <Skeleton className="h-4 w-24" />
              <div className="flex gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-10 rounded-md" />
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
          description="Carga los datos para ver los sorteos recientes."
          className="py-8"
        />
      )
    }

    return (
      <div className="space-y-3 animate-in fade-in-50 duration-500">
        {recentDraws.map((draw, index) => {
          const isSelected =
            selectedDraw &&
            draw.numbers.every((n, i) => n === selectedDraw[i])
          return (
            <div
              key={index}
              className={`space-y-2 p-2 rounded-md cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "bg-primary/10 border border-primary scale-[1.02]"
                  : "hover:bg-muted hover:scale-[1.01]"
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
                    className={`flex h-10 w-10 items-center justify-center rounded-md text-sm font-semibold transition-all duration-200 ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-md"
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
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Clock className="h-5 w-5 text-secondary" />
          Sorteos Recientes
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Ultimos resultados oficiales
        </CardDescription>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  )
}
