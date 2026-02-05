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
import { Ticket, Sparkles } from "lucide-react"

interface GeneratedTicketProps {
  ticket: number[] | null
  isLoading: boolean
}

export function GeneratedTicket({ ticket, isLoading }: GeneratedTicketProps) {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-16 rounded-lg"
            />
          ))}
        </div>
      )
    }

    if (!ticket) {
      return (
        <EmptyState
          icon={Sparkles}
          title="Sin ticket"
          description="Genera un ticket para ver tus numeros de la suerte."
          className="py-6"
        />
      )
    }

    return (
      <div className="grid grid-cols-6 gap-3 animate-in zoom-in-50 duration-500">
        {ticket.map((number, index) => (
          <div
            key={index}
            className="flex h-16 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-2xl font-bold text-primary-foreground shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
            style={{
              animationDelay: `${index * 100}ms`,
              animation: `fadeInUp 0.5s ease-out ${index * 100}ms both`,
            }}
          >
            {number}
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Ticket className="h-5 w-5 text-primary" />
          Ticket Generado
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Numeros seleccionados con ponderacion
        </CardDescription>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  )
}
