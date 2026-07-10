import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCurrency } from '@/lib/format'

export type WeeklyFlowPoint = { label: string; masuk: number; keluar: number }

function FlowTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className='rounded-md border bg-popover px-3 py-2 text-sm shadow-sm'>
      <p className='mb-1 text-muted-foreground'>{label}</p>
      {payload.map((p) => (
        <p key={p.name} className='flex items-center gap-2'>
          <span
            className='inline-block size-2 rounded-full'
            style={{ background: p.color }}
          />
          {p.name === 'masuk' ? 'Kas Masuk' : 'Kas Keluar'}:{' '}
          <span className='font-medium'>{formatCurrency(p.value)}</span>
        </p>
      ))}
    </div>
  )
}

/** Arus kas per minggu — 2 seri (teal = masuk, amber = keluar), legend wajib. */
export function WeeklyFlowChart({ data }: { data: WeeklyFlowPoint[] }) {
  return (
    <ResponsiveContainer width='100%' height={300}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }} barGap={2}>
        <CartesianGrid
          vertical={false}
          stroke='var(--border)'
          strokeDasharray='3 3'
        />
        <XAxis
          dataKey='label'
          stroke='var(--muted-foreground)'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke='var(--muted-foreground)'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={70}
          tickFormatter={(v: number) =>
            v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}jt` : `${Math.round(v / 1000)}rb`
          }
        />
        <Tooltip content={<FlowTooltip />} cursor={{ fill: 'var(--muted)' }} />
        <Legend
          formatter={(value: string) =>
            value === 'masuk' ? 'Kas Masuk' : 'Kas Keluar'
          }
          wrapperStyle={{ fontSize: 12 }}
        />
        <Bar
          dataKey='masuk'
          fill='var(--chart-1)'
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
        />
        <Bar
          dataKey='keluar'
          fill='var(--chart-2)'
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
