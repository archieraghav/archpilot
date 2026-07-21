import { AlertTriangle, CheckCircle2 } from "lucide-react"

interface ColumnProfile {
  name: string
  inferred_type: string
  missing_count: number
  missing_percent: number
  unique_count: number
  outlier_count: number | null
  min_value: number | string | null
  max_value: number | string | null
  mean_value: number | null
}

interface StatsPanelProps {
  qualityScore: number
  duplicateRowCount: number
  columns: ColumnProfile[]
}

const typeColors: Record<string, string> = {
  numeric: "text-blueprint",
  categorical: "text-signal",
  datetime: "text-graphite",
  boolean: "text-graphite",
}

export function StatsPanel({ qualityScore, duplicateRowCount, columns }: StatsPanelProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 rounded-lg border border-line p-5 dark:border-white/10">
        {qualityScore >= 80 ? (
          <CheckCircle2 className="text-blueprint" size={28} />
        ) : (
          <AlertTriangle className="text-signal" size={28} />
        )}
        <div>
          <p className="font-display text-2xl font-semibold">{qualityScore}<span className="text-sm text-graphite">/100</span></p>
          <p className="font-mono text-xs text-graphite">
            Data quality score · {duplicateRowCount} duplicate row{duplicateRowCount === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-line dark:border-white/10">
        <table className="w-full text-left font-mono text-xs">
          <thead className="border-b border-line bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.03]">
            <tr>
              <th className="px-4 py-2 font-medium text-graphite">Column</th>
              <th className="px-4 py-2 font-medium text-graphite">Type</th>
              <th className="px-4 py-2 font-medium text-graphite">Missing</th>
              <th className="px-4 py-2 font-medium text-graphite">Unique</th>
              <th className="px-4 py-2 font-medium text-graphite">Outliers</th>
              <th className="px-4 py-2 font-medium text-graphite">Mean</th>
            </tr>
          </thead>
          <tbody>
            {columns.map((col) => (
              <tr key={col.name} className="border-b border-line last:border-0 dark:border-white/5">
                <td className="px-4 py-2 font-medium">{col.name}</td>
                <td className={`px-4 py-2 ${typeColors[col.inferred_type] || ""}`}>{col.inferred_type}</td>
                <td className="px-4 py-2">{col.missing_percent}%</td>
                <td className="px-4 py-2">{col.unique_count}</td>
                <td className="px-4 py-2">{col.outlier_count ?? "—"}</td>
                <td className="px-4 py-2">{col.mean_value ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}