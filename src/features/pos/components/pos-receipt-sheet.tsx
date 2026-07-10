import { MessageCircle, ShieldCheck } from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/format'
import { buildWaLink } from '@/lib/whatsapp'
import { useRole } from '@/context/role-provider'
import { useMembersStore } from '@/stores/members-store'
import { useTransactionsStore } from '@/stores/transactions-store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { usePos } from './pos-provider'

function buildReceiptText(
  trxNo: string,
  items: { name: string; qty: number; unitPriceMember: number; unitPriceNonMember: number }[],
  totalMember: number,
  totalNonMember: number
) {
  const lines = items.map(
    (item) =>
      `${item.name} x${item.qty} — Anggota ${formatCurrency(item.unitPriceMember)} / Non-Anggota ${formatCurrency(item.unitPriceNonMember)}`
  )
  return [
    `Struk SiCerah — ${trxNo}`,
    ...lines,
    '',
    `Total Harga Anggota: ${formatCurrency(totalMember)}`,
    `Total Harga Non-Anggota: ${formatCurrency(totalNonMember)}`,
    `Selisih: ${formatCurrency(totalNonMember - totalMember)} — daftar jadi anggota untuk harga lebih murah!`,
  ].join('\n')
}

export function PosReceiptSheet() {
  const { open, setOpen, currentTransaction } = usePos()
  const { activeRole } = useRole()
  const simulateWaVerification = useTransactionsStore(
    (s) => s.simulateWaVerification
  )
  const members = useMembersStore((s) => s.members)

  if (!currentTransaction) return null
  const trx = currentTransaction
  const member = trx.memberId ? members.find((m) => m.id === trx.memberId) : undefined
  const receiptText = buildReceiptText(
    trx.trxNo,
    trx.items,
    trx.totalMember,
    trx.totalNonMember
  )
  const waTargetPhone = trx.buyerType === 'anggota' ? member?.phone : trx.buyerPhone

  return (
    <Sheet
      open={open === 'struk'}
      onOpenChange={(v) => setOpen(v ? 'struk' : null)}
    >
      <SheetContent className='flex flex-col gap-0 sm:max-w-md'>
        <SheetHeader className='text-start'>
          <SheetTitle>Struk {trx.trxNo}</SheetTitle>
          <SheetDescription>{formatDateTime(trx.timestamp)}</SheetDescription>
        </SheetHeader>
        <div className='flex-1 space-y-4 overflow-y-auto px-4'>
          <div className='space-y-2'>
            {trx.items.map((item, i) => (
              <div key={i} className='flex justify-between text-sm'>
                <span>
                  {item.name} × {item.qty}
                </span>
                <span className='text-muted-foreground'>
                  {formatCurrency(item.unitPriceMember)} /{' '}
                  {formatCurrency(item.unitPriceNonMember)}
                </span>
              </div>
            ))}
          </div>
          <Separator />
          <div className='space-y-1 text-sm'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Harga Anggota</span>
              <span>{formatCurrency(trx.totalMember)}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>Harga Non-Anggota</span>
              <span>{formatCurrency(trx.totalNonMember)}</span>
            </div>
            <div className='flex justify-between font-semibold'>
              <span>Total Ditagih</span>
              <span>{formatCurrency(trx.totalCharged)}</span>
            </div>
          </div>

          {trx.buyerType === 'anggota' ? (
            <div className='flex flex-wrap gap-2'>
              <Badge>Kontribusi (U): {formatCurrency(trx.kontribusiU ?? 0)}</Badge>
              <Badge variant='secondary'>
                KopPoin +{trx.kopPoinEarned ?? 0}
              </Badge>
            </div>
          ) : (
            <div className='flex items-center gap-2'>
              <Badge
                variant={
                  trx.waVerificationStatus === 'Terverifikasi'
                    ? 'default'
                    : 'secondary'
                }
              >
                {trx.waVerificationStatus}
              </Badge>
            </div>
          )}
        </div>

        <SheetFooter className='gap-2'>
          {waTargetPhone && (
            <Button asChild variant='outline'>
              <a
                href={buildWaLink(waTargetPhone, receiptText)}
                target='_blank'
                rel='noreferrer'
              >
                <MessageCircle className='size-4' /> Kirim Struk WA
              </a>
            </Button>
          )}
          {trx.buyerType === 'non-anggota' && (
            <>
              <Button asChild variant='outline'>
                <a
                  href={buildWaLink(
                    trx.buyerPhone ?? '',
                    `Halo ${trx.buyerName ?? ''}, mohon konfirmasi transaksi ${trx.trxNo} senilai ${formatCurrency(trx.totalCharged)} di Koperasi kami dengan membalas pesan ini "YA".`
                  )}
                  target='_blank'
                  rel='noreferrer'
                >
                  <MessageCircle className='size-4' /> Kirim Konfirmasi WA
                </a>
              </Button>
              {trx.waVerificationStatus !== 'Terverifikasi' && (
                <Button
                  variant='secondary'
                  onClick={() =>
                    simulateWaVerification(trx.id, activeRole)
                  }
                >
                  <ShieldCheck className='size-4' /> Simulasikan Konfirmasi
                  Diterima
                </Button>
              )}
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
