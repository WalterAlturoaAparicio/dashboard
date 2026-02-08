"use client"

import { Database, Wifi, WifiOff, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatusIndicatorProps {
  online: boolean
  dbDriver: "postgres" | "sqlite"
  lastSynced?: string | null
  syncing?: boolean
}

function formatSyncDate(iso: string | null | undefined): string {
  if (!iso) return "nunca"
  try {
    const d = new Date(iso)
    return d.toLocaleString("es-CO", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
}

export function StatusIndicator({
  online,
  dbDriver,
  lastSynced,
  syncing = false,
}: StatusIndicatorProps) {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <span className="flex items-center gap-1">
        {online ? (
          <Wifi className="h-3 w-3 text-green-500" />
        ) : (
          <WifiOff className="h-3 w-3 text-amber-500" />
        )}
        {online ? "Online" : "Offline"}
      </span>
      <span className="flex items-center gap-1">
        <Database className="h-3 w-3" />
        {dbDriver === "postgres" ? "PostgreSQL" : "SQLite"}
      </span>
      {dbDriver === "sqlite" && (
        <span className={cn("flex items-center gap-1", syncing && "animate-pulse")}>
          {syncing && <RefreshCw className="h-3 w-3 animate-spin" />}
          Sync: {syncing ? "sincronizando..." : formatSyncDate(lastSynced)}
        </span>
      )}
    </div>
  )
}
