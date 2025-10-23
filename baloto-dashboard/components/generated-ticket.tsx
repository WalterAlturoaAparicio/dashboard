import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Ticket } from "lucide-react"

interface GeneratedTicketProps {
  ticket: number[] | null
  isLoading: boolean
}

export function GeneratedTicket({ ticket, isLoading }: GeneratedTicketProps) {
  const displayTicket = ticket || [7, 14, 21, 28, 35, 42]

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Ticket className="h-5 w-5 text-primary" />
          {"Ticket Generado"}
        </CardTitle>
        <CardDescription className="text-muted-foreground">{"Números seleccionados con ponderación"}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-6 gap-3">
            {displayTicket.map((number, index) => (
              <div
                key={index}
                className="flex h-16 items-center justify-center rounded-lg bg-linear-to-br from-primary to-primary/80 text-2xl font-bold text-primary-foreground shadow-lg"
              >
                {number}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
