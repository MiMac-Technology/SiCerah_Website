import { Check, UserCog } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRole } from '@/context/role-provider'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ROLES, ROLE_LABELS, ROLE_ICONS } from '@/config/roles'

export function RoleSwitch() {
  const { activeRole, setActiveRole } = useRole()

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='sm' className='gap-2'>
          <UserCog className='size-4' />
          <span>{ROLE_LABELS[activeRole]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel>Lihat sebagai role</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ROLES.map((role) => {
          const Icon = ROLE_ICONS[role]
          return (
            <DropdownMenuItem key={role} onClick={() => setActiveRole(role)}>
              <Icon className='me-2 size-4' />
              {ROLE_LABELS[role]}
              <Check
                size={14}
                className={cn('ms-auto', activeRole !== role && 'hidden')}
              />
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
