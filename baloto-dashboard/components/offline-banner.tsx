"use client"

import { WifiOff, Database, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface OfflineBannerProps {
  message?: string
  dbDriver?: "postgres" | "sqlite"
  lastSynced?: string | null
  syncing?: boolean
  onSync?: () => void
  className?: string
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

export function OfflineBanner({
  message,
  dbDriver = "sqlite",
  lastSynced,
  syncing = false,
  onSync,
  className,
}: OfflineBannerProps) {
  const defaultMsg = message || "Sin conexion. Los datos locales siguen disponibles."

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 px-4 py-2 text-sm rounded-md animate-in fade-in-50 slide-in-from-top-2 duration-300",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <WifiOff className="h-4 w-4 shrink-0" />
        <span>{defaultMsg}</span>
      </div>
      <div className="flex items-center gap-3 shrink-0 text-xs text-amber-600 dark:text-amber-500">
        <span className="flex items-center gap-1">
          <Database className="h-3 w-3" />
          {dbDriver === "postgres" ? "PostgreSQL" : "SQLite local"}
        </span>
        <span>Sync: {formatSyncDate(lastSynced)}</span>
        {onSync && dbDriver === "sqlite" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSync}
            disabled={syncing}
            className="h-6 px-2 text-xs text-amber-700 dark:text-amber-400 hover:bg-amber-500/20"
          >
            <RefreshCw
              className={cn("h-3 w-3 mr-1", syncing && "animate-spin")}
            />
            Sincronizar
          </Button>
        )}
      </div>
    </div>
  )
}
