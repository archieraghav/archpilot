import { useParams, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft } from "lucide-react"
import { api } from "@/lib/api"
import { PreviewTable } from "@/components/PreviewTable"
import { StatsPanel } from "@/components/StatsPanel"
import { Skeleton } from "@/components/ui/skeleton"

interface DatasetPreview {
  columns: string[]
  rows: Record<string, unknown>[]
  total_rows: number
}

interface DatasetProfile {
  row_count: number
  column_count: number
  duplicate_row_count: number
  quality_score: number
  columns: {
    name: string
    inferred_type: string
    missing_count: number
    missing_percent: number
    unique_count: number
    outlier_count: number | null
    min_value: number | string | null
    max_value: number | string | null
    mean_value: number | null
  }[]
}

export default function DatasetDetail() {
  const { id } = useParams<{ id: string }>()

  const { data: preview, isLoading: previewLoading } = useQuery({
    queryKey: ["dataset-preview", id],
    queryFn: async () => (await api.get<DatasetPreview>(`/datasets/${id}/preview`)).data,
    enabled: !!id,
  })

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["dataset-profile", id],
    queryFn: async () => (await api.get<DatasetProfile>(`/datasets/${id}/profile`)).data,
    enabled: !!id,
  })

  return (
    <div className="p-8">
      <Link to="/datasets" className="flex items-center gap-2 text-sm text-graphite hover:text-ink dark:hover:text-paper">
        <ArrowLeft size={16} /> Back to datasets
      </Link>

      <h1 className="mt-4 font-display text-2xl font-semibold">Dataset Overview</h1>

      <div className="mt-8">
        <h2 className="font-body text-sm font-medium text-graphite">Data quality</h2>
        <div className="mt-3">
          {profileLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : profile ? (
            <StatsPanel
              qualityScore={profile.quality_score}
              duplicateRowCount={profile.duplicate_row_count}
              columns={profile.columns}
            />
          ) : null}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-body text-sm font-medium text-graphite">
          Preview {preview && `(${preview.total_rows} rows total, showing first ${preview.rows.length})`}
        </h2>
        <div className="mt-3">
          {previewLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : preview ? (
            <PreviewTable columns={preview.columns} rows={preview.rows} />
          ) : null}
        </div>
      </div>
    </div>
  )
}