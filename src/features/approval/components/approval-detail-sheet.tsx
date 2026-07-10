import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { formatCurrency, formatDateTime } from '@/lib/format'
import { ROLE_LABELS } from '@/config/roles'
import { useRole } from '@/context/role-provider'
import {
  getQuorumMet,
  useApprovalsStore,
  VOTER_ROLES,
  type VoterRole,
} from '@/stores/approvals-store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { isDelegateFor, useDelegationStore } from '@/stores/delegation-store'
import { voteFormSchema, type VoteFormValues } from '../data/schema'
import { useApprovalUi } from './approval-provider'

function isVoterRole(role: string): role is VoterRole {
  return (VOTER_ROLES as string[]).includes(role)
}

export function ApprovalDetailSheet() {
  const { selectedId, setSelectedId } = useApprovalUi()
  const { activeRole } = useRole()
  const approvals = useApprovalsStore((s) => s.approvals)
  const castVote = useApprovalsStore((s) => s.castVote)
  const finalizeApproval = useApprovalsStore((s) => s.finalizeApproval)

  const delegation = useDelegationStore((s) => s.delegation)
  const actsAsKetua =
    activeRole === 'ketua' ||
    isDelegateFor(delegation, activeRole, 'pengeluaran')

  const approval = approvals.find((a) => a.id === selectedId)

  const form = useForm<VoteFormValues>({
    resolver: zodResolver(voteFormSchema),
    defaultValues: { decision: 'setuju', comment: '' },
  })

  if (!approval) return null

  const canVote = isVoterRole(activeRole)
  const myExistingVote = canVote
    ? approval.votes.find((v) => v.role === activeRole)
    : undefined
  const quorumMet = getQuorumMet(approval)
  const isRunning = approval.status === 'Berjalan'

  const onSubmitVote = (data: VoteFormValues) => {
    if (!canVote) return
    castVote(approval.id, {
      role: activeRole,
      decision: data.decision,
      comment: data.comment,
    })
    toast.success('Suara berhasil dikirim')
    form.reset({ decision: 'setuju', comment: '' })
  }

  const handleFinalize = (decision: 'Disetujui' | 'Ditolak') => {
    finalizeApproval(
      approval.id,
      decision,
      activeRole === 'ketua'
        ? ROLE_LABELS.ketua
        : `${ROLE_LABELS[activeRole]} (delegasi Ketua)`
    )
    toast.success(`Approval telah ${decision.toLowerCase()}`)
    setSelectedId(null)
  }

  return (
    <Sheet
      open={!!selectedId}
      onOpenChange={(v) => !v && setSelectedId(null)}
    >
      <SheetContent className='flex flex-col gap-0 sm:max-w-lg'>
        <SheetHeader className='text-start'>
          <SheetTitle>{approval.title}</SheetTitle>
          <SheetDescription>
            Diajukan {formatDateTime(approval.createdAt)}
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 space-y-4 overflow-y-auto px-4'>
          <div className='flex items-center justify-between'>
            <span className='text-lg font-semibold'>
              {formatCurrency(approval.amount)}
            </span>
            <Badge variant={isRunning ? 'secondary' : approval.status === 'Disetujui' ? 'default' : 'destructive'}>
              {approval.status}
            </Badge>
          </div>
          <p className='text-sm text-muted-foreground'>{approval.description}</p>
          {approval.proofPhotoDataUrl && (
            <img
              src={approval.proofPhotoDataUrl}
              alt='Bukti kwitansi'
              className='max-h-48 rounded-md border object-cover'
            />
          )}

          <Separator />

          <div className='space-y-2'>
            <p className='text-sm font-medium'>
              Suara ({approval.votes.length}/{VOTER_ROLES.length})
            </p>
            {VOTER_ROLES.map((role) => {
              const vote = approval.votes.find((v) => v.role === role)
              return (
                <div
                  key={role}
                  className='flex items-center justify-between rounded-md border p-2 text-sm'
                >
                  <div>
                    <p className='font-medium'>{ROLE_LABELS[role]}</p>
                    {vote?.comment && (
                      <p className='text-xs text-muted-foreground'>
                        {vote.comment}
                      </p>
                    )}
                  </div>
                  {vote ? (
                    <Badge variant={vote.decision === 'setuju' ? 'default' : 'destructive'}>
                      {vote.decision === 'setuju' ? 'Setuju' : 'Tolak'}
                    </Badge>
                  ) : (
                    <Badge variant='outline'>Belum memilih</Badge>
                  )}
                </div>
              )
            })}
          </div>

          {isRunning && canVote && (
            <>
              <Separator />
              <Form {...form}>
                <form
                  id='vote-form'
                  onSubmit={form.handleSubmit(onSubmitVote)}
                  className='space-y-3'
                >
                  <FormField
                    control={form.control}
                    name='decision'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Suara Anda sebagai {ROLE_LABELS[activeRole]}
                          {myExistingVote ? ' (mengganti suara sebelumnya)' : ''}
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            className='grid grid-cols-2 gap-2'
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <Label className='flex items-center gap-2 rounded-md border p-2 font-normal has-[[data-state=checked]]:border-primary'>
                              <RadioGroupItem value='setuju' /> Setuju
                            </Label>
                            <Label className='flex items-center gap-2 rounded-md border p-2 font-normal has-[[data-state=checked]]:border-primary'>
                              <RadioGroupItem value='tolak' /> Tolak
                            </Label>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='comment'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catatan (opsional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder='Alasan / catatan...' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </>
          )}
        </div>

        <SheetFooter className='gap-2'>
          {isRunning && canVote && (
            <Button form='vote-form' type='submit'>
              Kirim Suara
            </Button>
          )}
          {isRunning && actsAsKetua && (
            <div className='flex gap-2'>
              <Button
                variant='destructive'
                disabled={!quorumMet}
                onClick={() => handleFinalize('Ditolak')}
              >
                Tolak
              </Button>
              <Button disabled={!quorumMet} onClick={() => handleFinalize('Disetujui')}>
                Setujui &amp; Finalisasi
              </Button>
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
