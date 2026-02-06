"use client"

import { WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface OfflineBannerProps {
  message?: string
  className?: string
}

export function OfflineBanner({
  message = "Sin conexion. Los datos pueden no estar actualizados.",
  className,
}: OfflineBannerProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 px-4 py-2 text-sm rounded-md animate-in fade-in-50 slide-in-from-top-2 duration-300",
        className
      )}
    >
      <WifiOff className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  )
}
