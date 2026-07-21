import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Database, Trash2, Pencil, Check, X } from "lucide-react"
import { Link } from "react-router-dom"

interface Dataset {
  id: string
  name: string
  row_count: number
  column_count: number
  file_type: string
  created_at: string
}

interface DatasetCardProps {
  dataset: Dataset
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
}

export function DatasetCard({ dataset, onRename, onDelete }: DatasetCardProps) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(dataset.name)

  const handleSave = () => {
    if (name.trim() && name !== dataset.name) {
      onRename(dataset.id, name.trim())
    }
    setEditing(false)
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-line p-4 dark:border-white/10">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blueprint/10 text-blueprint">
          <Database size={18} />
        </div>
        <div>
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded border border-line bg-transparent px-2 py-1 text-sm dark:border-white/10"
              />
              <button onClick={handleSave}><Check size={16} className="text-blueprint" /></button>
              <button onClick={() => { setEditing(false); setName(dataset.name) }}><X size={16} className="text-graphite" /></button>
            </div>
          ) : (
            <Link to={`/datasets/${dataset.id}`} className="font-body text-sm font-medium hover:text-blueprint">
            {dataset.name}
            </Link>
          )}
          <p className="font-mono text-xs text-graphite">
            {dataset.row_count} rows · {dataset.column_count} cols · {dataset.file_type.toUpperCase()} ·{" "}
            {formatDistanceToNow(new Date(dataset.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {!editing && (
          <button onClick={() => setEditing(true)} className="text-graphite hover:text-ink dark:hover:text-paper">
            <Pencil size={16} />
          </button>
        )}
        <button onClick={() => onDelete(dataset.id)} className="text-graphite hover:text-red-500">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}