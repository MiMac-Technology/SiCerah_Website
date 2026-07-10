import { useMemo } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCurrency } from '@/lib/format'
import { useCashInStore } from '@/stores/cash-in-store'
import { useExpensesStore } from '@/stores/expenses-store'
import { useFinanceConfigStore } from '@/stores/finance-config-store'

const DAYS = 30

function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function CashTrendChart() {
  const cashIns = useCashInStore((s) => s.cashIns)
  const expenses = useExpensesStore((s) => s.expenses)
  const initialCash = useFinanceConfigStore(
    (s) => s.config.initialCashBalance ?? 0
  )

  const data = useMemo(() => {
    const inByDay = new Map<string, number>()
    for (const c of cashIns) {
      const k = dayKey(new Date(c.date))
      inByDay.set(k, (inByDay.get(k) ?? 0) + c.amount)
    }
    const outByDay = new Map<string, number>()
    for (const e of expenses) {
      if (e.status === 'Ditolak' || e.status === 'Menunggu Approval') continue
      const k = dayKey(new Date(e.date))
      outByDay.set(k, (outByDay.get(k) ?? 0) + e.amount)
    }

    // Saldo kumulatif: mulai dari C0 + seluruh mutasi sebelum jendela 30 hari.
    const windowStart = new Date()
    windowStart.setDate(windowStart.getDate() - (DAYS - 1))
    windowStart.setHours(0, 0, 0, 0)

    let balance = initialCash
    for (const c of cashIns) {
      if (new Date(c.date) < windowStart) balance += c.amount
    }
    for (const e of expenses) {
      if (e.status === 'Ditolak' || e.status === 'Menunggu Approval') continue
      if (new Date(e.date) < windowStart) balance -= e.amount
    }

    const points: { label: string; saldo: number }[] = []
    for (let i = 0; i < DAYS; i++) {
      const d = new Date(windowStart)
      d.setDate(windowStart.getDate() + i)
      const k = dayKey(d)
      balance += (inByDay.get(k) ?? 0) - (outByDay.get(k) ?? 0)
      points.push({
        label: `${d.getDate()}/${d.getMonth() + 1}`,
        saldo: balance,
      })
    }
    return points
  }, [cashIns, expenses, initialCash])

  return (
    <ResponsiveContainer width='100%' height={300}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray='3 3'
          stroke='currentColor'
          className='text-border'
          vertical={false}
        />
        <XAxis
          dataKey='label'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          interval='preserveStartEnd'
          minTickGap={24}
        />
        <YAxis
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={80}
          tickFormatter={(v: number) =>
            v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}jt` : `${Math.round(v / 1000)}rb`
          }
        />
        <Tooltip
          cursor={{ stroke: 'currentColor', strokeDasharray: '3 3' }}
          content={({ active, payload, label }) =>
            active && payload?.length ? (
              <div className='rounded-md border bg-background px-3 py-2 text-sm shadow-md'>
                <p className='text-muted-foreground'>{label}</p>
                <p className='font-medium'>
                  {formatCurrency(payload[0].value as number)}
                </p>
              </div>
            ) : null
          }
        />
        <Line
          type='monotone'
          dataKey='saldo'
          stroke='currentColor'
          className='text-primary'
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
