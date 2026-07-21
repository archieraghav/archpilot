interface CorrelationHeatmapProps {
    columns: string[]
    matrix: number[][]
  }
  
  function colorForValue(value: number): string {
    const intensity = Math.abs(value)
    if (value >= 0) {
      return `rgba(59, 130, 246, ${intensity})`
    }
    return `rgba(245, 158, 11, ${intensity})`
  }
  
  export function CorrelationHeatmap({ columns, matrix }: CorrelationHeatmapProps) {
    if (columns.length === 0) {
      return <p className="font-mono text-xs text-graphite">Not enough numeric columns for a correlation matrix.</p>
    }
  
    return (
      <div className="overflow-x-auto">
        <table className="border-collapse">
          <thead>
            <tr>
              <th className="p-1"></th>
              {columns.map((col) => (
                <th key={col} className="p-1 font-mono text-[10px] font-normal text-graphite">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {columns.map((rowCol, i) => (
              <tr key={rowCol}>
                <td className="p-1 pr-2 font-mono text-[10px] text-graphite">{rowCol}</td>
                {columns.map((_, j) => (
                  <td key={j} className="p-1">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded font-mono text-[9px]"
                      style={{ backgroundColor: colorForValue(matrix[i][j]) }}
                      title={`${matrix[i][j]}`}
                    >
                      {matrix[i][j].toFixed(1)}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }