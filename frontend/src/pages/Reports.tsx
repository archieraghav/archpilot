import { useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useQuery, useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { FileText, Download, FileDown } from "lucide-react"
import { api } from "@/lib/api"

interface Dataset {
  id: string
  name: string
}

interface ReportData {
  dataset_name: string
  executive_summary: string
  kpis: { label: string; total: number; average: number }[]
  insights: { category: string; severity: string; title: string; description: string }[]
  forecast_summary: string | null
  risks: string[]
  recommendations: string[]
  generated_at: string
}

export default function Reports() {
  const [searchParams] = useSearchParams()
  const datasetId = searchParams.get("dataset")
  const [report, setReport] = useState<ReportData | null>(null)
  const [forecastColumn, setForecastColumn] = useState("")

  const { data: datasets } = useQuery({
    queryKey: ["datasets"],
    queryFn: async () => (await api.get<Dataset[]>("/datasets")).data,
  })

  const generateMutation = useMutation({
    mutationFn: async () =>
      api.post<ReportData>(`/datasets/${datasetId}/report`, {
        forecast_column: forecastColumn || null,
      }),
    onSuccess: (res) => {
      setReport(res.data)
      toast.success("Report generated")
    },
    onError: () => toast.error("Could not generate report"),
  })

  const downloadFile = async (format: "markdown" | "pdf") => {
    try {
      const res = await api.post(
        `/datasets/${datasetId}/report/${format}`,
        { forecast_column: forecastColumn || null },
        { responseType: "blob" }
      )
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement("a")
      link.href = url
      link.download = `report.${format === "markdown" ? "md" : "pdf"}`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch {
      toast.error("Download failed")
    }
  }

  if (!datasetId) {
    return (
      <div className="p-8">
        <h1 className="font-display text-2xl font-semibold">Reports</h1>
        <p className="mt-3 text-sm text-graphite">Select a dataset to generate an executive report.</p>
        <div className="mt-6 space-y-2">
          {datasets?.map((d) => (
            <Link key={d.id} to={`/reports?dataset=${d.id}`} className="block rounded-md border border-line px-4 py-3 text-sm hover:border-blueprint dark:border-white/10">
              {d.name}
            </Link>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="flex items-center gap-2 font-display text-2xl font-semibold">
          <FileText size={22} className="text-blueprint" /> Executive Report
        </h1>
        <div className="flex items-center gap-2">
          <input
            placeholder="Forecast column (optional)"
            value={forecastColumn}
            onChange={(e) => setForecastColumn(e.target.value)}
            className="rounded-md border border-line bg-transparent px-3 py-2 text-sm dark:border-white/10"
          />
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper disabled:opacity-50 dark:bg-blueprint"
          >
            {generateMutation.isPending ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>

      {report && (
        <div className="mt-8 max-w-3xl space-y-8">
          <div className="flex gap-3">
            <button onClick={() => downloadFile("markdown")} className="flex items-center gap-2 rounded-md border border-line px-4 py-2 text-sm dark:border-white/10">
              <Download size={15} /> Markdown
            </button>
            <button onClick={() => downloadFile("pdf")} className="flex items-center gap-2 rounded-md border border-line px-4 py-2 text-sm dark:border-white/10">
              <FileDown size={15} /> PDF
            </button>
          </div>

          <div>
            <h2 className="font-body text-sm font-semibold text-graphite">Executive Summary</h2>
            <p className="mt-2 text-sm">{report.executive_summary}</p>
          </div>

          <div>
            <h2 className="font-body text-sm font-semibold text-graphite">Key KPIs</h2>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {report.kpis.map((kpi) => (
                <div key={kpi.label} className="rounded-lg border border-line p-3 dark:border-white/10">
                  <p className="font-mono text-xs text-graphite">{kpi.label}</p>
                  <p className="font-display text-lg font-semibold">{kpi.total}</p>
                  <p className="font-mono text-[10px] text-graphite">avg {kpi.average}</p>
                </div>
              ))}
            </div>
          </div>

          {report.forecast_summary && (
            <div>
              <h2 className="font-body text-sm font-semibold text-graphite">Forecast</h2>
              <p className="mt-2 text-sm">{report.forecast_summary}</p>
            </div>
          )}

          <div>
            <h2 className="font-body text-sm font-semibold text-graphite">Risks</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {report.risks.length ? report.risks.map((r, i) => <li key={i}>{r}</li>) : <li>No significant risks identified.</li>}
            </ul>
          </div>

          <div>
            <h2 className="font-body text-sm font-semibold text-graphite">Recommendations</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {report.recommendations.length ? report.recommendations.map((r, i) => <li key={i}>{r}</li>) : <li>No specific recommendations at this time.</li>}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}