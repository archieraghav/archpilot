import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface CategoryBreakdownChartProps {
  data: Record<string, unknown>[]
  xKey: string
  yKey: string
  variant: "bar" | "pie"
  onSegmentClick?: (point: Record<string, unknown>) => void
}

const COLORS = ["#3B82F6", "#F59E0B", "#64748B", "#0B1120", "#93C5FD", "#FCD34D"]

export function CategoryBreakdownChart({ data, xKey, yKey, variant, onSegmentClick }: CategoryBreakdownChartProps) {
  if (variant === "pie") {
    return (
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey={yKey}
            nameKey={xKey}
            outerRadius={90}
            onClick={(entry) => onSegmentClick?.(entry)}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} cursor="pointer" />
            ))}
          </Pie>
          <Tooltip contentStyle={{ fontSize: 12, fontFamily: "monospace", borderRadius: 6 }} />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fontFamily: "monospace" }} />
        <YAxis tick={{ fontSize: 11, fontFamily: "monospace" }} />
        <Tooltip contentStyle={{ fontSize: 12, fontFamily: "monospace", borderRadius: 6 }} />
        <Bar
          dataKey={yKey}
          fill="#3B82F6"
          radius={[4, 4, 0, 0]}
          cursor="pointer"
          onClick={(entry) => onSegmentClick?.(entry)}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}