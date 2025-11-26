"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { StatsCards } from "@/components/stats-cards"
import { FrequencyChart } from "@/components/frequency-chart"
import { GeneratedTicket } from "@/components/generated-ticket"
import { ActionButtons } from "@/components/action-buttons"
import { RecentDraws } from "@/components/recent-draws"

export default function DashboardPage() {
  const [frequencyBaloto, setFrequencyBaloto] = useState<
    Record<string, number>
  >({})
  const [totalBaloto, setTotalBaloto] = useState<number>(0)
  const [frequencySuperbalota, setFrequencySuperbalota] = useState<
    Record<string, number>
  >({})
  const [generatedTicket, setGeneratedTicket] = useState<number[] | null>(null)
  const [recentDraws, setRecentDraws] = useState<Record<string, number[]>[]>([])
  const [isLoadingChart, setIsLoadingChart] = useState(false)
  const [isLoadingTicket, setIsLoadingTicket] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const [selectedDraw, setSelectedDraw] = useState<number[] | null>(null)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 space-y-6">
        <StatsCards
          totalDraws={frequencyBaloto.length}
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
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <FrequencyChart
              title="Baloto"
              data={frequencyBaloto}
              isLoading={isLoadingChart}
              selectedDraw={selectedDraw?.slice(0, 5) || []}
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
            />
          </div>
        </div>
      </main>
    </div>
  )
}
