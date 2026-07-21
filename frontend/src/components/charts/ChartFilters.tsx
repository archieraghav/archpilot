interface ChartFiltersProps {
    columns: string[]
    numericColumns: string[]
    xAxis: string
    yAxis: string
    onXAxisChange: (col: string) => void
    onYAxisChange: (col: string) => void
  }
  
  export function ChartFilters({ columns, numericColumns, xAxis, yAxis, onXAxisChange, onYAxisChange }: ChartFiltersProps) {
    return (
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="font-mono text-xs text-graphite">Group by</label>
          <select
            value={xAxis}
            onChange={(e) => onXAxisChange(e.target.value)}
            className="rounded-md border border-line bg-transparent px-2 py-1.5 text-sm dark:border-white/10"
          >
            {columns.map((col) => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="font-mono text-xs text-graphite">Measure</label>
          <select
            value={yAxis}
            onChange={(e) => onYAxisChange(e.target.value)}
            className="rounded-md border border-line bg-transparent px-2 py-1.5 text-sm dark:border-white/10"
          >
            {numericColumns.map((col) => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>
      </div>
    )
  }