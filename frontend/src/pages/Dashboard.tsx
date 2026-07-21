import { useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { ChartFilters } from "@/components/charts/ChartFilters"
import { RevenueTrendChart } from "@/components/charts/RevenueTrendChart"
import { CategoryBreakdownChart } from "@/components/charts/CategoryBreakdownChart"
import { CorrelationHeatmap } from "@/components/charts/CorrelationHeatmap"
import { PreviewTable } from "@/components/PreviewTable"
import { Skeleton } from "@/components/ui/skeleton"

interface Dataset {
  id: string
  name: string
}

interface DatasetPreview {
  columns: string[]
  rows: Record<string, unknown>[]
  total_rows: number
}

interface DatasetProfile {
  columns: { name: string; inferred_type: string }[]
}

function computeCorrelationMatrix(rows: Record<string, unknown>[], numericCols: string[]): number[][] {
  const series: Record<string, number[]> = {}
  numericCols.forEach((col) => {
    series[col] = rows.map((r) => Number(r[col])).filter((v) => !isNaN(v))
  })

  const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / (arr.length || 1)

  const correlation = (a: number[], b: number[]) => {
    const n = Math.min(a.length, b.length)
    if (n < 2) return 0
    const ma = mean(a.slice(0, n))
    const mb = mean(b.slice(0, n))
    let num = 0, da = 0, db = 0
    for (let i = 0; i < n; i++) {
      num += (a[i] - ma) * (b[i] - mb)
      da += (a[i] - ma) ** 2
      db += (b[i] - mb) ** 2
    }
    const denom = Math.sqrt(da * db)
    return denom === 0 ? 0 : num / denom
  }

  return numericCols.map((colA) =>
    numericCols.map((colB) => Math.round(correlation(series[colA], series[colB]) * 100) / 100)
  )
}

export default function Dashboard() {
  const [searchParams] = useSearchParams()
  const datasetId = searchParams.get("dataset")
  const [drillRow, setDrillRow] = useState<Record<string, unknown> | null>(null)
  const [xAxis, setXAxis] = useState<string>("")
  const [yAxis, setYAxis] = useState<string>("")

  const { data: datasets } = useQuery({
    queryKey: ["datasets"],
    queryFn: async () => (await api.get<Dataset[]>("/datasets")).data,
  })

  const { data: preview, isLoading } = useQuery({
    queryKey: ["dataset-preview-full", datasetId],
    queryFn: async () => (await api.get<DatasetPreview>(`/datasets/${datasetId}/preview`, { params: { limit: 200 } })).data,
    enabled: !!datasetId,
  })

  const { data: profile } = useQuery({
    queryKey: ["dataset-profile", datasetId],
    queryFn: async () => (await api.get<DatasetProfile>(`/datasets/${datasetId}/profile`)).data,
    enabled: !!datasetId,
  })

  const numericColumns = useMemo(
    () => profile?.columns.filter((c) => c.inferred_type === "numeric").map((c) => c.name) || [],
    [profile]
  )
  const categoricalColumns = useMemo(
    () => profile?.columns.filter((c) => c.inferred_type !== "numeric").map((c) => c.name) || [],
    [profile]
  )

  const effectiveX = xAxis || categoricalColumns[0] || preview?.columns[0] || ""
  const effectiveY = yAxis || numericColumns[0] || ""

  const aggregatedData = useMemo(() => {
    if (!preview || !effectiveX || !effectiveY) return []
    const groups: Record<string, number> = {}
    preview.rows.forEach((row) => {
      const key = String(row[effectiveX] ?? "Unknown")
      const value = Number(row[effectiveY]) || 0
      groups[key] = (groups[key] || 0) + value
    })
    return Object.entries(groups).map(([name, value]) => ({ [effectiveX]: name, [effectiveY]: value }))
  }, [preview, effectiveX, effectiveY])

  const correlationMatrix = useMemo(() => {
    if (!preview || numericColumns.length < 2) return []
    return computeCorrelationMatrix(preview.rows, numericColumns)
  }, [preview, numericColumns])

  if (!datasetId) {
    return (
      <div className="p-8">
        <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
        <p className="mt-3 text-sm text-graphite">Select a dataset to explore.</p>
        <div className="mt-6 space-y-2">
          {datasets?.map((d) => (
            <Link key={d.id} to={`/dashboard?dataset=${d.id}`} className="block rounded-md border border-line px-4 py-3 text-sm hover:border-blueprint dark:border-white/10">
              {d.name}
            </Link>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl font-semibold">Dashboard</h1>

      {isLoading ? (
        <div className="mt-6 space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <>
          <div className="mt-6">
            <ChartFilters
              columns={[...categoricalColumns, ...numericColumns]}
              numericColumns={numericColumns}
              xAxis={effectiveX}
              yAxis={effectiveY}
              onXAxisChange={setXAxis}
              onYAxisChange={setYAxis}
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-line p-5 dark:border-white/10">
              <h2 className="mb-3 font-body text-sm font-medium">Trend</h2>
              <RevenueTrendChart data={aggregatedData} xKey={effectiveX} yKey={effectiveY} onPointClick={setDrillRow} />
            </div>
            <div className="rounded-lg border border-line p-5 dark:border-white/10">
              <h2 className="mb-3 font-body text-sm font-medium">Breakdown</h2>
              <CategoryBreakdownChart data={aggregatedData} xKey={effectiveX} yKey={effectiveY} variant="bar" onSegmentClick={setDrillRow} />
            </div>
            <div className="rounded-lg border border-line p-5 dark:border-white/10">
              <h2 className="mb-3 font-body text-sm font-medium">Share</h2>
              <CategoryBreakdownChart data={aggregatedData} xKey={effectiveX} yKey={effectiveY} variant="pie" onSegmentClick={setDrillRow} />
            </div>
            <div className="rounded-lg border border-line p-5 dark:border-white/10">
              <h2 className="mb-3 font-body text-sm font-medium">Correlation matrix</h2>
              <CorrelationHeatmap columns={numericColumns} matrix={correlationMatrix} />
            </div>
          </div>

          {drillRow && (
            <div className="mt-6 rounded-lg border border-blueprint/30 bg-blueprint/5 p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-body text-sm font-medium">Drill-down</h2>
                <button onClick={() => setDrillRow(null)} className="font-mono text-xs text-graphite hover:text-ink">Close</button>
              </div>
              <div className="mt-3">
                <PreviewTable columns={Object.keys(drillRow)} rows={[drillRow]} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}