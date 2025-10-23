import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Calendar, Database } from "lucide-react"

interface StatsCardsProps {
  totalDraws: number
  totalSorteos: number
  lastUpdate: Date | null
}

export function StatsCards({ totalDraws, totalSorteos, lastUpdate }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{"Total de Números"}</p>
              <p className="text-2xl font-bold text-foreground">{totalDraws || 43}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/20">
              <TrendingUp className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{"Sorteos Analizados"}</p>
              <p className="text-2xl font-bold text-foreground">{totalSorteos}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20">
              <Calendar className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{"Última Actualización"}</p>
              <p className="text-sm font-bold text-foreground">
                {lastUpdate ? lastUpdate.toLocaleDateString("es-CO") : "No disponible"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
