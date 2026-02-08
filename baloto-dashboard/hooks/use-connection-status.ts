"use client"

import { useState, useEffect, useCallback } from "react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
const POLL_INTERVAL = 30_000

interface ConnectionStatus {
  online: boolean
  dbDriver: "postgres" | "sqlite"
  lastScrape: string | null
  lastSynced: string | null
  syncing: boolean
  checking: boolean
  error: string | null
}

export function useConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>({
    online: true,
    dbDriver: "sqlite",
    lastScrape: null,
    lastSynced: null,
    syncing: false,
    checking: true,
    error: null,
  })

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/status`, {
        signal: AbortSignal.timeout(5000),
      })
      if (!res.ok) throw new Error("Backend no disponible")
      const data = await res.json()
      setStatus({
        online: data.online,
        dbDriver: data.dbDriver || "sqlite",
        lastScrape: data.lastScrape,
        lastSynced: data.lastSynced,
        syncing: data.syncing || false,
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

  const triggerSync = useCallback(async () => {
    try {
      await fetch(`${API_URL}/trigger-sync`, { method: "POST" })
      await checkStatus()
    } catch {
      // ignore
    }
  }, [checkStatus])

  useEffect(() => {
    checkStatus()
    const interval = setInterval(checkStatus, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [checkStatus])

  return { ...status, refresh: checkStatus, triggerSync }
}
