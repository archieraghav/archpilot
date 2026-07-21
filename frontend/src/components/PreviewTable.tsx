interface PreviewTableProps {
    columns: string[]
    rows: Record<string, unknown>[]
  }
  
  export function PreviewTable({ columns, rows }: PreviewTableProps) {
    return (
      <div className="overflow-x-auto rounded-lg border border-line dark:border-white/10">
        <table className="w-full text-left font-mono text-xs">
          <thead className="border-b border-line bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.03]">
            <tr>
              {columns.map((col) => (
                <th key={col} className="whitespace-nowrap px-4 py-2 font-medium text-graphite">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-line last:border-0 dark:border-white/5">
                {columns.map((col) => (
                  <td key={col} className="whitespace-nowrap px-4 py-2">
                    {String(row[col] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }