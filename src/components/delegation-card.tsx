import { useState } from 'react'
import { UserCheck, UserX } from 'lucide-react'
import { toast } from 'sonner'
import { formatDateTime } from '@/lib/format'
import { ROLE_LABELS, type Role } from '@/config/roles'
import {
  SCOPE_LABELS,
  useDelegationStore,
  type DelegationScope,
} from '@/stores/delegation-store'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const DELEGATE_ROLES: Role[] = ['bendahara', 'sekretaris', 'kasir', 'logistik']

/** Kartu pengaturan delegasi approval — hanya dirender untuk Ketua. */
export function DelegationCard() {
  const delegation = useDelegationStore((s) => s.delegation)
  const setDelegation = useDelegationStore((s) => s.setDelegation)
  const revokeDelegation = useDelegationStore((s) => s.revokeDelegation)
  const [delegateRole, setDelegateRole] = useState<Role>('bendahara')
  const [scope, setScope] = useState<DelegationScope>('semua')
  const [until, setUntil] = useState('')

  const isExpired = delegation && new Date(delegation.until) < new Date()

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <UserCheck className='size-4' /> Delegasi Approval
        </CardTitle>
        <CardDescription>
          Delegasikan hak approval Anda sementara ke pengurus lain saat tidak
          tersedia, dengan scope dan batas waktu.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {delegation && !isExpired ? (
          <div className='flex flex-wrap items-center justify-between gap-3 rounded-md border border-amber-500/50 bg-amber-500/10 p-3'>
            <div className='text-sm'>
              <p>
                <strong>{ROLE_LABELS[delegation.delegateRole]}</strong> memegang{' '}
                <strong>{SCOPE_LABELS[delegation.scope]}</strong>
              </p>
              <p className='text-muted-foreground'>
                hingga {formatDateTime(delegation.until)}
              </p>
            </div>
            <Button
              variant='outline'
              onClick={() => {
                revokeDelegation()
                toast.success('Delegasi dicabut')
              }}
            >
              <UserX className='size-4' /> Cabut Delegasi
            </Button>
          </div>
        ) : (
          <div className='flex flex-wrap items-end gap-3'>
            <div className='space-y-2'>
              <Label>Delegasikan ke</Label>
              <Select
                value={delegateRole}
                onValueChange={(v) => setDelegateRole(v as Role)}
              >
                <SelectTrigger className='w-44'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DELEGATE_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label>Scope</Label>
              <Select
                value={scope}
                onValueChange={(v) => setScope(v as DelegationScope)}
              >
                <SelectTrigger className='w-56'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.entries(SCOPE_LABELS) as [DelegationScope, string][]
                  ).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='delegation-until'>Berlaku Hingga</Label>
              <Input
                id='delegation-until'
                type='datetime-local'
                className='w-56'
                value={until}
                onChange={(e) => setUntil(e.target.value)}
              />
            </div>
            <Button
              disabled={!until || new Date(until) <= new Date()}
              onClick={() => {
                setDelegation(delegateRole, scope, new Date(until).toISOString())
                toast.success(
                  `${SCOPE_LABELS[scope]} didelegasikan ke ${ROLE_LABELS[delegateRole]}`
                )
              }}
            >
              <UserCheck className='size-4' /> Delegasikan
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
