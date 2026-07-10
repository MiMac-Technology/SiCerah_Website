import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarPlus, ClipboardList, Send, Users } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
import { formatDateTime } from '@/lib/format'
import { AccessRestrictedBanner } from '@/components/access-restricted-banner'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { RoleSwitch } from '@/components/role-switch'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useRole } from '@/context/role-provider'
import { useRoleAccess } from '@/hooks/use-role-access'
import { useMeetingsStore, type Meeting } from '@/stores/meetings-store'
import { useMembersStore } from '@/stores/members-store'

const meetingFormSchema = z.object({
  title: z.string().min(1, 'Judul rapat wajib diisi'),
  agenda: z.string().min(1, 'Agenda wajib diisi'),
  location: z.string().min(1, 'Lokasi wajib diisi'),
  scheduledAt: z.string().min(1, 'Waktu rapat wajib diisi'),
})

function CreateMeetingDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { activeRole } = useRole()
  const createMeeting = useMeetingsStore((s) => s.createMeeting)

  const form = useForm<z.infer<typeof meetingFormSchema>>({
    resolver: zodResolver(meetingFormSchema),
    defaultValues: { title: '', agenda: '', location: '', scheduledAt: '' },
  })

  const onSubmit = (data: z.infer<typeof meetingFormSchema>) => {
    createMeeting(
      { ...data, scheduledAt: new Date(data.scheduledAt).toISOString() },
      activeRole
    )
    toast.success('Rapat dijadwalkan')
    onOpenChange(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Jadwalkan Rapat</DialogTitle>
          <DialogDescription>
            Buat jadwal dan agenda, lalu kirim undangan ke anggota.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='meeting-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul Rapat</FormLabel>
                  <FormControl>
                    <Input placeholder='cth. Rapat Pengurus Bulanan' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='agenda'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agenda</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder={'1. Pembukaan\n2. Pembahasan ...'}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='location'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lokasi</FormLabel>
                    <FormControl>
                      <Input placeholder='cth. Balai Desa' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='scheduledAt'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Waktu</FormLabel>
                    <FormControl>
                      <Input type='datetime-local' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button form='meeting-form' type='submit'>
            <CalendarPlus className='size-4' /> Jadwalkan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AttendanceDialog({
  meeting,
  onClose,
}: {
  meeting: Meeting
  onClose: () => void
}) {
  const members = useMembersStore((s) => s.members)
  const toggleAttendance = useMeetingsStore((s) => s.toggleAttendance)
  const activeMembers = members.filter((m) => m.status === 'aktif')

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Absensi Digital</DialogTitle>
          <DialogDescription>
            {meeting.title} — {meeting.attendeeIds.length} hadir dari{' '}
            {activeMembers.length} anggota aktif
          </DialogDescription>
        </DialogHeader>
        <div className='max-h-80 space-y-1 overflow-y-auto'>
          {activeMembers.map((m) => (
            <label
              key={m.id}
              className='flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-muted'
            >
              <Checkbox
                checked={meeting.attendeeIds.includes(m.id)}
                onCheckedChange={() => toggleAttendance(meeting.id, m.id)}
              />
              <div>
                <p className='text-sm'>{m.fullName}</p>
                <p className='text-xs text-muted-foreground'>{m.memberNo}</p>
              </div>
            </label>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Selesai</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function NotulensiDialog({
  meeting,
  onClose,
}: {
  meeting: Meeting
  onClose: () => void
}) {
  const { activeRole } = useRole()
  const uploadNotulensi = useMeetingsStore((s) => s.uploadNotulensi)
  const [text, setText] = useState(meeting.notulensiText ?? '')

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notulensi Rapat</DialogTitle>
          <DialogDescription>
            {meeting.title} — mengunggah notulensi menandai rapat selesai.
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-2'>
          <Label htmlFor='notulensi'>Isi Notulensi</Label>
          <Textarea
            id='notulensi'
            rows={8}
            placeholder='Ringkasan pembahasan dan keputusan rapat...'
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Batal
          </Button>
          <Button
            disabled={!text.trim()}
            onClick={() => {
              uploadNotulensi(meeting.id, text.trim(), activeRole)
              toast.success('Notulensi tersimpan, rapat ditandai selesai')
              onClose()
            }}
          >
            <ClipboardList className='size-4' /> Simpan Notulensi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function Rapat() {
  const { activeRole, hasAccess } = useRoleAccess(['sekretaris', 'ketua'])
  const meetings = useMeetingsStore((s) => s.meetings)
  const sendInvitations = useMeetingsStore((s) => s.sendInvitations)
  const [createOpen, setCreateOpen] = useState(false)
  const [attendanceFor, setAttendanceFor] = useState<string | null>(null)
  const [notulensiFor, setNotulensiFor] = useState<string | null>(null)
  const canManage = hasAccess && activeRole === 'sekretaris'

  const attendanceMeeting = meetings.find((m) => m.id === attendanceFor)
  const notulensiMeeting = meetings.find((m) => m.id === notulensiFor)

  return (
    <>
      <Header>
        <Search className='me-auto' />
        <RoleSwitch />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>
      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Manajemen Rapat
            </h2>
            <p className='text-muted-foreground'>
              Jadwal, undangan, absensi digital, dan notulensi rapat.
            </p>
          </div>
          <Button disabled={!canManage} onClick={() => setCreateOpen(true)}>
            <CalendarPlus className='size-4' /> Jadwalkan Rapat
          </Button>
        </div>
        {!hasAccess && <AccessRestrictedBanner activeRole={activeRole} />}
        <div className='space-y-4'>
          {meetings.map((m) => (
            <Card key={m.id}>
              <CardHeader>
                <div className='flex flex-wrap items-start justify-between gap-2'>
                  <div>
                    <CardTitle>{m.title}</CardTitle>
                    <CardDescription>
                      {formatDateTime(m.scheduledAt)} · {m.location}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={m.status === 'Selesai' ? 'default' : 'secondary'}
                  >
                    {m.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='rounded-md border p-3'>
                  <p className='mb-1 text-sm font-medium'>Agenda</p>
                  <p className='text-sm whitespace-pre-line text-muted-foreground'>
                    {m.agenda}
                  </p>
                </div>
                {m.notulensiText && (
                  <div className='rounded-md border p-3'>
                    <p className='mb-1 text-sm font-medium'>
                      Notulensi{' '}
                      <span className='font-normal text-muted-foreground'>
                        ({formatDateTime(m.notulensiUploadedAt!)})
                      </span>
                    </p>
                    <p className='text-sm whitespace-pre-line text-muted-foreground'>
                      {m.notulensiText}
                    </p>
                  </div>
                )}
                <div className='flex flex-wrap items-center gap-2'>
                  {canManage && (
                    <>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => {
                          sendInvitations(m.id, activeRole)
                          toast.success(
                            'Undangan terkirim via notif in-app + WA blast'
                          )
                        }}
                      >
                        <Send className='size-4' />
                        {m.invitationSentAt
                          ? 'Kirim Ulang Undangan'
                          : 'Kirim Undangan'}
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => setAttendanceFor(m.id)}
                      >
                        <Users className='size-4' /> Absensi (
                        {m.attendeeIds.length})
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => setNotulensiFor(m.id)}
                      >
                        <ClipboardList className='size-4' />
                        {m.notulensiText ? 'Edit Notulensi' : 'Upload Notulensi'}
                      </Button>
                    </>
                  )}
                  {m.invitationSentAt && (
                    <span className='text-xs text-muted-foreground'>
                      Undangan terkirim {formatDateTime(m.invitationSentAt)}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Main>
      <CreateMeetingDialog open={createOpen} onOpenChange={setCreateOpen} />
      {attendanceMeeting && (
        <AttendanceDialog
          meeting={attendanceMeeting}
          onClose={() => setAttendanceFor(null)}
        />
      )}
      {notulensiMeeting && (
        <NotulensiDialog
          key={notulensiMeeting.id}
          meeting={notulensiMeeting}
          onClose={() => setNotulensiFor(null)}
        />
      )}
    </>
  )
}
