"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { StatsCards } from "@/components/stats-cards"
import { FrequencyChart } from "@/components/frequency-chart"
import { GeneratedTicket } from "@/components/generated-ticket"
import { ActionButtons } from "@/components/action-buttons"
import { RecentDraws } from "@/components/recent-draws"
import { ResponsibleGamingDisclaimer } from "@/components/responsible-gaming-disclaimer"

export default function DashboardPage() {
  const [frequencyBaloto, setFrequencyBaloto] = useState<
    Record<string, number>
  >({})
  const [totalBaloto, setTotalBaloto] = useState<number>(0)
  const [frequencySuperbalota, setFrequencySuperbalota] = useState<
    Record<string, number>
  >({})
  const [generatedTicket, setGeneratedTicket] = useState<number[] | null>(null)
  const [recentDraws, setRecentDraws] = useState<
    { date: string; numbers: number[] }[]
  >([])
  const [isLoadingChart, setIsLoadingChart] = useState(false)
  const [isLoadingTicket, setIsLoadingTicket] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date("2025-01-02")
  )
  const [selectedDraw, setSelectedDraw] = useState<number[] | null>(null)

  const hasData = Object.keys(frequencyBaloto).length > 0

  return (
    <div className="min-h-screen bg-background">
      <ResponsibleGamingDisclaimer />
      <Header />

      <main className="container mx-auto px-4 py-8 space-y-6">
        <StatsCards
          totalDraws={Object.keys(frequencyBaloto).length}
          lastUpdate={lastUpdate}
          totalSorteos={totalBaloto}
        />

        <ActionButtons
          onCountBaloto={setFrequencyBaloto}
          onCountTotalSorteos={setTotalBaloto}
          onCountSuperbalota={setFrequencySuperbalota}
          onRecentDraws={setRecentDraws}
          onGenerate={setGeneratedTicket}
          onRefresh={setLastUpdate}
          setIsLoadingChart={setIsLoadingChart}
          setIsLoadingTicket={setIsLoadingTicket}
          isLoadingChart={isLoadingChart}
          isLoadingTicket={isLoadingTicket}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <FrequencyChart
              title="Baloto"
              data={frequencyBaloto}
              isLoading={isLoadingChart}
              selectedDraw={selectedDraw?.slice(0, 5) || []}
              hasData={hasData}
            />
          </div>

          <div className="space-y-6">
            <RecentDraws
              recentDraws={recentDraws}
              isLoading={isLoadingChart}
              onSelectDraw={(numbers: number[]) => setSelectedDraw(numbers)}
              selectedDraw={selectedDraw}
            />
            <GeneratedTicket
              ticket={generatedTicket}
              isLoading={isLoadingTicket}
            />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
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
        </div>
      </main>
    </div>
  )
}
