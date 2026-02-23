import { Sparkles } from "lucide-react"

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Baloto Analytics</h1>
            <p className="text-sm text-muted-foreground">{"Análisis inteligente de resultados históricos"}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
