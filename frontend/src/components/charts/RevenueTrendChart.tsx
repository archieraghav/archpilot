import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface RevenueTrendChartProps {
  data: Record<string, unknown>[]
  xKey: string
  yKey: string
  onPointClick?: (point: Record<string, unknown>) => void
}

export function RevenueTrendChart({ data, xKey, yKey, onPointClick }: RevenueTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--line, #E2E8F0)" opacity={0.4} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fontFamily: "monospace" }} />
        <YAxis tick={{ fontSize: 11, fontFamily: "monospace" }} />
        <Tooltip
          contentStyle={{ fontSize: 12, fontFamily: "monospace", borderRadius: 6 }}
        />
        <Line
          type="monotone"
          dataKey={yKey}
          stroke="#3B82F6"
          strokeWidth={2}
          dot={{ r: 3, cursor: "pointer" }}
          activeDot={{ r: 5, onClick: (_, e: any) => onPointClick?.(e.payload) }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}