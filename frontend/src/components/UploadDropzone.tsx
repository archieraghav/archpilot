import { useRef, useState } from "react"
import { UploadCloud } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadDropzoneProps {
  onFileSelect: (file: File) => void
  uploading?: boolean
}

export function UploadDropzone({ onFileSelect, uploading }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) onFileSelect(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFileSelect(file)
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center transition-colors",
        isDragging ? "border-blueprint bg-blueprint/5" : "border-line dark:border-white/10",
        uploading && "pointer-events-none opacity-60"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        className="hidden"
        onChange={handleFileInput}
      />
      <UploadCloud size={32} className="text-blueprint" />
      <p className="mt-4 font-body text-sm font-medium">
        {uploading ? "Uploading..." : "Drop a CSV or Excel file, or click to browse"}
      </p>
      <p className="mt-1 font-mono text-xs text-graphite">.csv, .xlsx, .xls</p>
    </div>
  )
}