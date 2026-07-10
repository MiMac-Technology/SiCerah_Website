import { useState } from 'react'
import { Check, ChevronsUpDown, UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMembersStore, type Member } from '@/stores/members-store'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type MemberComboboxProps = {
  value: string | undefined
  onSelect: (member: Member) => void
  disabled?: boolean
}

export function MemberCombobox({
  value,
  onSelect,
  disabled,
}: MemberComboboxProps) {
  const [popoverOpen, setPopoverOpen] = useState(false)
  const members = useMembersStore((s) => s.members)
  const activeMembers = members.filter((m) => m.status === 'aktif')
  const selected = members.find((m) => m.id === value)

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          role='combobox'
          disabled={disabled}
          className={cn(
            'w-full justify-between',
            !selected && 'text-muted-foreground'
          )}
        >
          <span className='flex items-center gap-2 truncate'>
            <UserRound className='size-4 shrink-0' />
            {selected
              ? `${selected.fullName} — ${selected.memberNo}`
              : 'Cari anggota (nama / no. anggota / WA)'}
          </span>
          <ChevronsUpDown className='size-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-100 p-0' align='start'>
        <Command
          filter={(itemValue, search) =>
            itemValue.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
          }
        >
          <CommandInput placeholder='Cari anggota...' />
          <CommandList>
            <CommandEmpty>Anggota tidak ditemukan.</CommandEmpty>
            <CommandGroup>
              {activeMembers.map((member) => (
                <CommandItem
                  key={member.id}
                  value={`${member.fullName} ${member.memberNo} ${member.phone}`}
                  onSelect={() => {
                    onSelect(member)
                    setPopoverOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'size-4',
                      member.id === value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className='flex flex-col'>
                    <span>{member.fullName}</span>
                    <span className='text-xs text-muted-foreground'>
                      {member.memberNo} — {member.phone}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
