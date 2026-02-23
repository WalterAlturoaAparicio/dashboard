"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertTriangle, Shield } from "lucide-react"

const DISCLAIMER_ACCEPTED_KEY = "baloto-disclaimer-accepted"

interface ResponsibleGamingDisclaimerProps {
  onAccept?: () => void
}

export function ResponsibleGamingDisclaimer({
  onAccept,
}: ResponsibleGamingDisclaimerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isChecked, setIsChecked] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem(DISCLAIMER_ACCEPTED_KEY)
    if (!accepted) {
      setIsOpen(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem(DISCLAIMER_ACCEPTED_KEY, "true")
    setIsOpen(false)
    onAccept?.()
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-lg"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <DialogTitle className="text-center text-xl">
            Juego Responsable
          </DialogTitle>
          <DialogDescription className="text-center">
            Antes de continuar, por favor lee esta informacion importante.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
            <div className="flex gap-3">
              <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
                <p className="font-medium">
                  Esta aplicacion es solo para fines informativos y de
                  entretenimiento.
                </p>
                <ul className="list-inside list-disc space-y-1 text-amber-700 dark:text-amber-300">
                  <li>
                    Los numeros generados NO garantizan ganar ningun premio
                  </li>
                  <li>
                    La loteria es un juego de azar con probabilidades muy bajas
                  </li>
                  <li>Nunca apuestes mas de lo que puedas permitirte perder</li>
                  <li>
                    Si sientes que el juego afecta tu vida, busca ayuda
                    profesional
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3 rounded-lg border p-4">
            <Checkbox
              id="accept-terms"
              checked={isChecked}
              onCheckedChange={(checked) => setIsChecked(checked === true)}
            />
            <label
              htmlFor="accept-terms"
              className="text-sm leading-relaxed text-muted-foreground cursor-pointer"
            >
              Soy mayor de 18 anos, entiendo que esta herramienta es solo
              informativa y que los juegos de azar implican riesgos.
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleAccept}
            disabled={!isChecked}
            className="w-full"
          >
            Entendido, continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
