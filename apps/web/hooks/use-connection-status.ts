"use client"

import { useState, useEffect, useCallback } from "react"

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://dashboard-production-1f56.up.railway.app/api/v1").replace(/\/$/, "")
const POLL_INTERVAL = 30_000

interface ConnectionStatus {
  online: boolean
  lastScrape: string | null
  checking: boolean
  error: string | null
}

export function useConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>({
    online: true,
    lastScrape: null,
    checking: true,
    error: null,
  })

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/status`, {
        signal: AbortSignal.timeout(5000),
      })
      if (!res.ok) throw new Error("Backend no disponible")
      const data = await res.json()
      setStatus({
        online: data.online,
        lastScrape: data.lastScrape,
        checking: false,
        error: null,
      })
    } catch {
      setStatus((prev) => ({
        ...prev,
        online: false,
        checking: false,
        error: "No se pudo conectar al servidor",
      }))
    }
  }, [])

  useEffect(() => {
    checkStatus()
    const interval = setInterval(checkStatus, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [checkStatus])

  return { ...status, refresh: checkStatus }
}

export { API_BASE }
