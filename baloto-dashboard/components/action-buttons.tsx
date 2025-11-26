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
import { useState } from "react"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"

interface ActionButtonsProps {
  onCountBaloto: (data: any) => void
  onCountSuperbalota: (data: any) => void
  onGenerate: (ticket: number[]) => void
  onRefresh: (date: Date) => void
  onCountTotalSorteos: (total: number) => void
  onRecentDraws: (draws: Record<string, number[]>[]) => void
  setIsLoadingChart: (loading: boolean) => void
  setIsLoadingTicket: (loading: boolean) => void
  isLoadingChart: boolean
  isLoadingTicket: boolean
}

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
}: ActionButtonsProps) {
  const { toast } = useToast()
  const [apiUrl] = useState("http://localhost:3001") // Change this to your backend URL

  const handleCount = async () => {
    setIsLoadingChart(true)
    try {
      const conteo = await axios.get(`${apiUrl}/conteo?fecha=2025-01-01&tipo=baloto`)
      onCountBaloto(conteo.data.numeros)
      onCountTotalSorteos(conteo.data.totalSorteos)
      onCountSuperbalota(conteo.data.superbalotas)

      const draws = await axios.get(`${apiUrl}/recent-draws?tipo=baloto&cantidad=3`)
      onRecentDraws(draws.data)
      toast({
        title: "Conteo actualizado",
        description: "Los datos de frecuencia se han cargado correctamente.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo obtener el conteo de números.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsLoadingChart(false)
    }
  }

  const handleGenerate = async () => {
    setIsLoadingTicket(true)
    try {
      const response = await axios.get(`${apiUrl}/generar?tipo=baloto&fecha=2025-01-01&tickets=1`)
      onGenerate([...response.data[0].numeros, response.data[0].superbalota])
      toast({
        title: "Ticket generado",
        description: "Se ha generado un nuevo ticket con números ponderados.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar el ticket.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsLoadingTicket(false)
    }
  }

  const handleRefresh = async () => {
    setIsLoadingChart(true)
    try {
      await axios.post(`${apiUrl}/refresh`)
      onRefresh(new Date())
      toast({
        title: "Datos actualizados",
        description: "Los resultados más recientes se han sincronizado.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar los datos.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsLoadingChart(false)
    }
  }

  const handleLoad = async () => {
    setIsLoadingChart(true)
    try {
      await axios.put(`${apiUrl}/load`)
      toast({
        title: "Carga completa",
        description: "Todos los datos históricos se han cargado exitosamente.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar los datos históricos.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsLoadingChart(false)
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">{"Acciones Rápidas"}</CardTitle>
        <CardDescription className="text-muted-foreground">
          {"Interactúa con los datos de Baloto"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Button
            onClick={handleCount}
            disabled={isLoadingChart || isLoadingTicket}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            {"Obtener Conteo"}
          </Button>

          <Button
            onClick={handleGenerate}
            disabled={isLoadingChart || isLoadingTicket}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {"Generar Ticket"}
          </Button>

          <Button
            onClick={handleRefresh}
            disabled={isLoadingChart || isLoadingTicket}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {"Actualizar"}
          </Button>

          <Button
            onClick={handleLoad}
            disabled={isLoadingChart || isLoadingTicket}
            variant="outline"
            className="border-border text-foreground hover:bg-muted bg-transparent"
          >
            <Download className="mr-2 h-4 w-4" />
            {"Cargar Histórico"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
