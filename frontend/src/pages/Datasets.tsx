import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Search, Database } from "lucide-react"
import { api } from "@/lib/api"
import { UploadDropzone } from "@/components/UploadDropzone"
import { DatasetCard } from "@/components/DatasetCard"
import { Skeleton } from "@/components/ui/skeleton"
import { Link } from "react-router-dom"

interface Dataset {
  id: string
  name: string
  row_count: number
  column_count: number
  file_type: string
  created_at: string
}

export default function Datasets() {
  const [search, setSearch] = useState("")
  const [uploading, setUploading] = useState(false)
  const queryClient = useQueryClient()

  const { data: datasets, isLoading } = useQuery({
    queryKey: ["datasets", search],
    queryFn: async () => {
      const res = await api.get<Dataset[]>("/datasets", { params: { search: search || undefined } })
      return res.data
    },
  })

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append("file", file)
      setUploading(true)
      return api.post("/datasets/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    },
    onSuccess: () => {
      toast.success("Dataset uploaded")
      queryClient.invalidateQueries({ queryKey: ["datasets"] })
    },
    onError: () => toast.error("Upload failed — check the file format"),
    onSettled: () => setUploading(false),
  })

  const renameMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => api.patch(`/datasets/${id}`, { name }),
    onSuccess: () => {
      toast.success("Dataset renamed")
      queryClient.invalidateQueries({ queryKey: ["datasets"] })
    },
    onError: () => toast.error("Rename failed"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/datasets/${id}`),
    onSuccess: () => {
      toast.success("Dataset deleted")
      queryClient.invalidateQueries({ queryKey: ["datasets"] })
    },
    onError: () => toast.error("Delete failed"),
  })

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl font-semibold">Datasets</h1>
      <p className="mt-1 text-sm text-graphite">Upload and manage the data ArchPilot analyzes.</p>

      <div className="mt-6">
        <UploadDropzone onFileSelect={(file) => uploadMutation.mutate(file)} uploading={uploading} />
      </div>

      <div className="mt-8 flex items-center gap-2 rounded-md border border-line px-3 py-2 dark:border-white/10">
        <Search size={16} className="text-graphite" />
        <input
          placeholder="Search datasets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      <div className="mt-6 space-y-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}

        {!isLoading && datasets?.length === 0 && (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-line py-16 text-center dark:border-white/10">
            <Database size={28} className="text-graphite" />
            <p className="mt-3 font-accent text-lg text-ink dark:text-paper">No datasets yet</p>
            <p className="mt-1 font-mono text-xs text-graphite">Upload a CSV or Excel file to get started</p>
          </div>
        )}

        {datasets?.map((dataset) => (
          <DatasetCard
            key={dataset.id}
            dataset={dataset}
            onRename={(id, name) => renameMutation.mutate({ id, name })}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
        ))}
      </div>
    </div>
  )
}