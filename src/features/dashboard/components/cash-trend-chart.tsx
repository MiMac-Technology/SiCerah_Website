import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCurrency } from '@/lib/format'

export type CashTrendPoint = { label: string; saldo: number }

function TrendTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className='rounded-md border bg-popover px-3 py-2 text-sm shadow-sm'>
      <p className='text-muted-foreground'>{label}</p>
      <p className='font-medium'>{formatCurrency(payload[0].value)}</p>
    </div>
  )
}

/** Tren saldo kas 30 hari — satu seri, warna brand (chart-1). */
export function CashTrendChart({ data }: { data: CashTrendPoint[] }) {
  return (
    <ResponsiveContainer width='100%' height={300}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id='cash-fill' x1='0' y1='0' x2='0' y2='1'>
            <stop
              offset='0%'
              stopColor='var(--chart-1)'
              stopOpacity={0.25}
            />
            <stop offset='100%' stopColor='var(--chart-1)' stopOpacity={0} />
          </linearGradient>
        </defs>
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
          minTickGap={24}
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
        <Tooltip content={<TrendTooltip />} cursor={{ stroke: 'var(--border)' }} />
        <Area
          type='monotone'
          dataKey='saldo'
          stroke='var(--chart-1)'
          strokeWidth={2}
          fill='url(#cash-fill)'
          dot={false}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
