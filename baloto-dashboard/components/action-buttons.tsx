"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BarChart3, Sparkles, RefreshCw, Download } from "lucide-react"
import { useCallback, useEffect } from "react"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"
import { DatePicker } from "@/components/date-picker"
import { format } from "date-fns"

interface ActionButtonsProps {
  onCountBaloto: (data: Record<string, number>) => void
  onCountSuperbalota: (data: Record<string, number>) => void
  onGenerate: (ticket: number[]) => void
  onRefresh: (date: Date) => void
  onCountTotalSorteos: (total: number) => void
  onRecentDraws: (draws: { date: string; numbers: number[] }[]) => void
  setIsLoadingChart: (loading: boolean) => void
  setIsLoadingTicket: (loading: boolean) => void
  isLoadingChart: boolean
  isLoadingTicket: boolean
  selectedDate: Date | undefined
  onDateChange: (date: Date | undefined) => void
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export function ActionButtons({
  onCountBaloto,
  onCountTotalSorteos,
  onCountSuperbalota,
  onGenerate,
  onRefresh,
  onRecentDraws,
  setIsLoadingChart,
  setIsLoadingTicket,
  isLoadingChart,
  isLoadingTicket,
  selectedDate,
  onDateChange,
}: ActionButtonsProps) {
  const { toast } = useToast()

  const fetchData = useCallback(async (date?: Date) => {
    setIsLoadingChart(true)
    try {
      const fechaParam = date ? format(date, "yyyy-MM-dd") : "2020-01-01"
      const conteo = await axios.get(
        `${API_URL}/conteo?fecha=${fechaParam}&tipo=baloto`
      )
      onCountBaloto(conteo.data.numeros)
      onCountTotalSorteos(conteo.data.totalSorteos)
      onCountSuperbalota(conteo.data.superbalotas)

      const draws = await axios.get(
        `${API_URL}/recent-draws?tipo=baloto&cantidad=5`
      )
      onRecentDraws(draws.data)
      toast({
        title: "Conteo actualizado",
        description: "Los datos de frecuencia se han cargado correctamente.",
      })
    } catch (error: unknown) {
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "No se pudo obtener el conteo de numeros."
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoadingChart(false)
    }
  }, [onCountBaloto, onCountSuperbalota, onCountTotalSorteos, onRecentDraws, setIsLoadingChart, toast])

  // Auto-fetch when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchData(selectedDate)
    }
  }, [selectedDate, fetchData])

  const handleCount = () => fetchData(selectedDate)

  const handleGenerate = async () => {
    setIsLoadingTicket(true)
    try {
      const fechaParam = selectedDate
        ? format(selectedDate, "yyyy-MM-dd")
        : "2020-01-01"
      const response = await axios.get(
        `${API_URL}/generar?tipo=baloto&fecha=${fechaParam}&tickets=1`
      )
      onGenerate([
        ...response.data[0].numeros.map(Number),
        Number(response.data[0].superbalota),
      ])
      toast({
        title: "Ticket generado",
        description: "Se ha generado un nuevo ticket con numeros ponderados.",
      })
    } catch (error: unknown) {
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "No se pudo generar el ticket."
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoadingTicket(false)
    }
  }

  const handleRefresh = async () => {
    setIsLoadingChart(true)
    try {
      await axios.post(`${API_URL}/refresh`)
      onRefresh(new Date())
      toast({
        title: "Datos actualizados",
        description: "Los resultados mas recientes se han sincronizado.",
      })
    } catch (error: unknown) {
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "No se pudo actualizar los datos."
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoadingChart(false)
    }
  }

  const handleLoad = async () => {
    setIsLoadingChart(true)
    try {
      await axios.put(`${API_URL}/load`)
      toast({
        title: "Carga completa",
        description: "Todos los datos historicos se han cargado exitosamente.",
      })
    } catch (error: unknown) {
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "No se pudo cargar los datos historicos."
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoadingChart(false)
    }
  }

  const isLoading = isLoadingChart || isLoadingTicket

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Acciones Rapidas</CardTitle>
        <CardDescription className="text-muted-foreground">
          Interactua con los datos de Baloto
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-foreground">
              Analizar desde fecha
            </label>
            <DatePicker
              date={selectedDate}
              onDateChange={onDateChange}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Button
            onClick={handleCount}
            disabled={isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Obtener Conteo
          </Button>

          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-all duration-200"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Generar Ticket
          </Button>

          <Button
            onClick={handleRefresh}
            disabled={isLoading}
            className="bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-200"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoadingChart ? "animate-spin" : ""}`}
            />
            Actualizar
          </Button>

          <Button
            onClick={handleLoad}
            disabled={isLoading}
            variant="outline"
            className="border-border text-foreground hover:bg-muted bg-transparent transition-all duration-200"
          >
            <Download className="mr-2 h-4 w-4" />
            Cargar Historico
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
