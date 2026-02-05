"use client"

import { useState, useCallback, useEffect } from "react"
import { Header } from "@/components/header"
import { FrequencyChart } from "@/components/frequency-chart"
import { RecentDraws } from "@/components/recent-draws"
import { CalendarPanel } from "@/components/calendar-panel"
import { TicketGenerator } from "@/components/ticket-generator"
import { ResponsibleGamingDisclaimer } from "@/components/responsible-gaming-disclaimer"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

interface Ticket {
  numeros: number[]
  superbalota: number
}

export default function DashboardPage() {
  const { toast } = useToast()
  const [frequencyBaloto, setFrequencyBaloto] = useState<
    Record<string, number>
  >({})
  const [frequencySuperbalota, setFrequencySuperbalota] = useState<
    Record<string, number>
  >({})
  const [generatedTickets, setGeneratedTickets] = useState<Ticket[]>([])
  const [recentDraws, setRecentDraws] = useState<
    { date: string; numbers: number[] }[]
  >([])
  const [isLoadingChart, setIsLoadingChart] = useState(false)
  const [isLoadingTicket, setIsLoadingTicket] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date("2024-01-01")
  )
  const [selectedDraw, setSelectedDraw] = useState<number[] | null>(null)

  const hasData = Object.keys(frequencyBaloto).length > 0

  const fetchData = useCallback(
    async (date?: Date) => {
      setIsLoadingChart(true)
      try {
        const fechaParam = date ? format(date, "yyyy-MM-dd") : "2020-01-01"
        const [conteoRes, drawsRes] = await Promise.all([
          axios.get(`${API_URL}/conteo?fecha=${fechaParam}&tipo=baloto`),
          axios.get(`${API_URL}/recent-draws?tipo=baloto&cantidad=5`),
        ])

        setFrequencyBaloto(conteoRes.data.numeros)
        setFrequencySuperbalota(conteoRes.data.superbalotas)
        setRecentDraws(drawsRes.data)

        toast({
          title: "Datos actualizados",
          description: `Analizando ${conteoRes.data.totalSorteos} sorteos.`,
        })
      } catch (error: unknown) {
        const errorMessage =
          axios.isAxiosError(error) && error.response?.data?.message
            ? error.response.data.message
            : "No se pudieron cargar los datos."
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setIsLoadingChart(false)
      }
    },
    [toast]
  )

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await axios.post(`${API_URL}/refresh`)
      toast({
        title: "Resultados sincronizados",
        description: "Los datos mas recientes han sido descargados.",
      })
      // Recargar datos despues de sincronizar
      await fetchData(selectedDate)
    } catch (error: unknown) {
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "No se pudo sincronizar."
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleGenerate = async (cantidad: number) => {
    setIsLoadingTicket(true)
    try {
      const fechaParam = selectedDate
        ? format(selectedDate, "yyyy-MM-dd")
        : "2020-01-01"
      const response = await axios.get(
        `${API_URL}/generar?tipo=baloto&fecha=${fechaParam}&tickets=${cantidad}`
      )
      const tickets: Ticket[] = response.data.map(
        (t: { numeros: string[]; superbalota: string }) => ({
          numeros: t.numeros.map(Number),
          superbalota: Number(t.superbalota),
        })
      )
      setGeneratedTickets(tickets)
      toast({
        title: "Tickets generados",
        description: `Se generaron ${cantidad} ticket(s).`,
      })
    } catch (error: unknown) {
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "No se pudieron generar los tickets."
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoadingTicket(false)
    }
  }

  // Auto-fetch cuando cambia la fecha
  useEffect(() => {
    if (selectedDate) {
      fetchData(selectedDate)
    }
  }, [selectedDate, fetchData])

  return (
    <div className="min-h-screen bg-background">
      <ResponsibleGamingDisclaimer />
      <Header />

      <main className="container mx-auto px-4 py-6">
        {/* Layout de 3 columnas */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Columna izquierda: Calendario + Sorteos Recientes */}
          <div className="lg:col-span-3 space-y-6">
            <CalendarPanel
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              disabled={isLoadingChart}
            />
            <RecentDraws
              recentDraws={recentDraws}
              isLoading={isLoadingChart}
              onSelectDraw={setSelectedDraw}
              selectedDraw={selectedDraw}
              frequencyData={frequencyBaloto}
            />
          </div>

          {/* Columna central: Graficas */}
          <div className="lg:col-span-6 space-y-6">
            <FrequencyChart
              title="Baloto"
              data={frequencyBaloto}
              isLoading={isLoadingChart}
              selectedDraw={selectedDraw?.slice(0, 5) || []}
              hasData={hasData}
            />
            <FrequencyChart
              title="Superbalota"
              data={frequencySuperbalota}
              isLoading={isLoadingChart}
              selectedDraw={
                selectedDraw ? [selectedDraw[selectedDraw.length - 1]] : []
              }
              hasData={hasData}
            />
          </div>

          {/* Columna derecha: Generador de Tickets */}
          <div className="lg:col-span-3">
            <TicketGenerator
              tickets={generatedTickets}
              isLoading={isLoadingTicket}
              onGenerate={handleGenerate}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
              selectedDraw={selectedDraw}
              frequencyData={frequencyBaloto}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
