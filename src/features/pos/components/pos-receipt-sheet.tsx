import { CheckCircle2, MessageCircle } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { formatCurrency, formatDateTime } from '@/lib/format'
import { handleServerError } from '@/lib/handle-server-error'
import { buildWaLink } from '@/lib/whatsapp'
import { SignaturePadField } from '@/components/signature-pad-field'
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
import { signSale } from '../api'
import { usePos } from './pos-provider'

function buildReceiptText(
  trxNo: string,
  items: {
    name: string
    qty: number
    unitPriceMember: number
    unitPriceNonMember: number
  }[],
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
  const { open, setOpen, currentTransaction, setCurrentTransaction } = usePos()
  const queryClient = useQueryClient()

  const signMutation = useMutation({
    mutationFn: (dataUrl: string) => signSale(currentTransaction!.id, dataUrl),
    onSuccess: (sale) => {
      queryClient.invalidateQueries({ queryKey: ['pos', 'penjualan'] })
      setCurrentTransaction(sale)
    },
    onError: handleServerError,
  })

  if (!currentTransaction) return null
  const trx = currentTransaction
  const receiptText = buildReceiptText(
    trx.trxNo,
    trx.items,
    trx.totalMember,
    trx.totalNonMember
  )
  const waTargetPhone =
    trx.buyerType === 'anggota' ? trx.memberPhone : trx.buyerPhone

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
              <Badge>
                Kontribusi (U): {formatCurrency(trx.kontribusiU ?? 0)}
              </Badge>
              <Badge variant='secondary'>
                KopPoin +{trx.kopPoinEarned ?? 0}
              </Badge>
            </div>
          ) : (
            <div className='space-y-2'>
              <p className='text-sm font-medium'>Tanda Tangan Pembeli</p>
              {trx.signatureUrl ? (
                <div className='flex items-center gap-3'>
                  <img
                    src={trx.signatureUrl}
                    alt='Tanda tangan pembeli'
                    className='h-20 rounded-md border bg-white object-contain'
                  />
                  <Badge>
                    <CheckCircle2 className='size-3.5' /> Sudah Ditandatangani
                  </Badge>
                </div>
              ) : (
                <SignaturePadField
                  disabled={signMutation.isPending}
                  onSave={(dataUrl) => signMutation.mutate(dataUrl)}
                />
              )}
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
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
