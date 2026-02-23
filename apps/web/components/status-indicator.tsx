"use client"

import { Wifi, WifiOff } from "lucide-react"

interface StatusIndicatorProps {
  online: boolean
}

export function StatusIndicator({ online }: StatusIndicatorProps) {
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      {online ? (
        <Wifi className="h-3 w-3 text-green-500" />
      ) : (
        <WifiOff className="h-3 w-3 text-amber-500" />
      )}
      {online ? "Online" : "Offline"}
    </div>
  )
}
