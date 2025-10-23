import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"

export function RecentDraws() {
  const recentDraws = [
    { date: "2025-01-15", numbers: [3, 12, 23, 31, 38, 42] },
    { date: "2025-01-12", numbers: [7, 15, 22, 29, 35, 41] },
    { date: "2025-01-08", numbers: [5, 11, 18, 27, 33, 40] },
  ]

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Clock className="h-5 w-5 text-secondary" />
          {"Sorteos Recientes"}
        </CardTitle>
        <CardDescription className="text-muted-foreground">{"Últimos resultados oficiales"}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentDraws.map((draw, index) => (
          <div key={index} className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">{draw.date}</p>
            <div className="flex gap-2">
              {draw.numbers.map((num, i) => (
                <div
                  key={i}
                  className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-sm font-semibold text-foreground"
                >
                  {num}
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
