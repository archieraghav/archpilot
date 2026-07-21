import { Link, useSearchParams } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Sparkles, RefreshCw } from "lucide-react"
import { api } from "@/lib/api"
import { InsightCard } from "@/components/InsightCard"
import { Skeleton } from "@/components/ui/skeleton"

interface Dataset {
  id: string
  name: string
}

interface Insight {
  id: string
  category: string
  severity: string
  title: string
  description: string
}

export default function Copilot() {
  const [searchParams] = useSearchParams()
  const datasetId = searchParams.get("dataset")
  const queryClient = useQueryClient()

  const { data: datasets } = useQuery({
    queryKey: ["datasets"],
    queryFn: async () => (await api.get<Dataset[]>("/datasets")).data,
  })

  const { data: insights, isLoading } = useQuery({
    queryKey: ["insights", datasetId],
    queryFn: async () => (await api.get<Insight[]>(`/datasets/${datasetId}/copilot/insights`)).data,
    enabled: !!datasetId,
  })

  const analyzeMutation = useMutation({
    mutationFn: async () => api.post(`/datasets/${datasetId}/copilot/analyze`),
    onSuccess: () => {
      toast.success("Analysis complete")
      queryClient.invalidateQueries({ queryKey: ["insights", datasetId] })
    },
    onError: () => toast.error("Analysis failed"),
  })

  if (!datasetId) {
    return (
      <div className="p-8">
        <h1 className="font-display text-2xl font-semibold">Business Copilot</h1>
        <p className="mt-3 text-sm text-graphite">Select a dataset to see proactive insights.</p>
        <div className="mt-6 space-y-2">
          {datasets?.map((d) => (
            <Link
              key={d.id}
              to={`/copilot?dataset=${d.id}`}
              className="block rounded-md border border-line px-4 py-3 text-sm hover:border-blueprint dark:border-white/10"
            >
              {d.name}
            </Link>
          ))}
          {datasets?.length === 0 && (
            <p className="font-mono text-xs text-graphite">No datasets yet — upload one first.</p>
          )}
        </div>
      </div>
    )
  }

  const currentDataset = datasets?.find((d) => d.id === datasetId)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 font-display text-2xl font-semibold">
            <Sparkles size={22} className="text-blueprint" /> Business Copilot
          </h1>
          <p className="mt-1 text-sm text-graphite">{currentDataset?.name}</p>
        </div>
        <button
          onClick={() => analyzeMutation.mutate()}
          disabled={analyzeMutation.isPending}
          className="flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper disabled:opacity-50 dark:bg-blueprint"
        >
          <RefreshCw size={15} className={analyzeMutation.isPending ? "animate-spin" : ""} />
          {analyzeMutation.isPending ? "Analyzing..." : "Re-analyze"}
        </button>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}

        {!isLoading && insights?.length === 0 && (
          <div className="col-span-full flex flex-col items-center rounded-lg border border-dashed border-line py-16 text-center dark:border-white/10">
            <Sparkles size={28} className="text-graphite" />
            <p className="mt-3 font-body text-sm font-medium">No insights yet</p>
            <p className="mt-1 font-mono text-xs text-graphite">Click "Re-analyze" to run the Copilot</p>
          </div>
        )}

        {insights?.map((insight) => <InsightCard key={insight.id} {...insight} />)}
      </div>
    </div>
  )
}