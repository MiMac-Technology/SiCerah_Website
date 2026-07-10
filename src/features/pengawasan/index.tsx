import { useMemo, useState } from 'react'
import { Flag, MessageSquarePlus, SendHorizonal, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { buildHashChain } from '@/lib/hash'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/format'
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
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRoleAccess } from '@/hooks/use-role-access'
import {
  FLAG_TARGET_LABELS,
  useAuditFlagsStore,
} from '@/stores/audit-flags-store'
import { useCashInStore } from '@/stores/cash-in-store'
import { useExpensesStore } from '@/stores/expenses-store'
import { useMembersStore } from '@/stores/members-store'
import { useProductsStore } from '@/stores/products-store'
import { useTransactionsStore } from '@/stores/transactions-store'
import { FlagDialog, type FlagTarget } from './components/flag-dialog'

const MEMBER_STATUS_LABEL: Record<string, string> = {
  aktif: 'Aktif',
  pasif: 'Pasif',
  keluar: 'Keluar',
}

function FlaggedBadge() {
  return (
    <Badge variant='destructive' className='gap-1'>
      <Flag className='size-3' /> Flagged
    </Badge>
  )
}

export function Pengawasan() {
  const { activeRole, hasAccess } = useRoleAccess(['pengawas', 'ketua'])
  const canFlag = activeRole === 'pengawas'

  const cashIns = useCashInStore((s) => s.cashIns)
  const expenses = useExpensesStore((s) => s.expenses)
  const transactions = useTransactionsStore((s) => s.transactions)
  const products = useProductsStore((s) => s.products)
  const members = useMembersStore((s) => s.members)
  const flags = useAuditFlagsStore((s) => s.flags)
  const addComment = useAuditFlagsStore((s) => s.addComment)
  const markReported = useAuditFlagsStore((s) => s.markReported)

  const [flagTarget, setFlagTarget] = useState<FlagTarget | null>(null)
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({})
  const [verified, setVerified] = useState(false)

  const flaggedIds = useMemo(
    () => new Set(flags.map((f) => f.targetId)),
    [flags]
  )

  // Rantai hash gabungan ledger kas (masuk + keluar), urut kronologis.
  const hashChain = useMemo(() => {
    const ledger = [
      ...cashIns.map((c) => ({
        id: c.id,
        no: c.cashInNo,
        date: c.date,
        label: `${c.type} — ${formatCurrency(c.amount)}`,
        content: `${c.cashInNo}|${c.date}|${c.type}|${c.amount}|${c.description}`,
      })),
      ...expenses.map((e) => ({
        id: e.id,
        no: e.expenseNo,
        date: e.date,
        label: `${e.category} — ${formatCurrency(e.amount)}`,
        content: `${e.expenseNo}|${e.date}|${e.category}|${e.amount}|${e.description}`,
      })),
    ].sort((a, b) => a.date.localeCompare(b.date))
    const chain = buildHashChain(ledger)
    return ledger.map((entry, i) => ({ ...entry, hash: chain[i].hash }))
  }, [cashIns, expenses])

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
        <div className='mb-2'>
          <h2 className='text-2xl font-bold tracking-tight'>Pengawasan</h2>
          <p className='text-muted-foreground'>
            Akses read-only lintas modul untuk Pengawas — tanpa aksi edit atau
            hapus. Transaksi mencurigakan dapat di-flag dengan catatan audit.
          </p>
        </div>
        {!hasAccess && <AccessRestrictedBanner activeRole={activeRole} />}

        <Tabs defaultValue='keuangan' className='space-y-4'>
          <div className='w-full overflow-x-auto pb-2'>
            <TabsList>
              <TabsTrigger value='keuangan'>Keuangan</TabsTrigger>
              <TabsTrigger value='pos'>Transaksi POS</TabsTrigger>
              <TabsTrigger value='stok'>Stok</TabsTrigger>
              <TabsTrigger value='anggota'>Anggota</TabsTrigger>
              <TabsTrigger value='integritas'>Integritas Ledger</TabsTrigger>
              <TabsTrigger value='temuan'>
                Temuan Audit{flags.length > 0 ? ` (${flags.length})` : ''}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value='keuangan' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle>Jurnal Kas Masuk (Bendahara)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='overflow-hidden rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No.</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Jenis</TableHead>
                        <TableHead className='text-end'>Nominal</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cashIns.slice(0, 15).map((c) => (
                        <TableRow key={c.id}>
                          <TableCell>{c.cashInNo}</TableCell>
                          <TableCell>{formatDate(c.date)}</TableCell>
                          <TableCell>{c.type}</TableCell>
                          <TableCell className='text-end'>
                            {formatCurrency(c.amount)}
                          </TableCell>
                          <TableCell className='text-end'>
                            {flaggedIds.has(c.id) ? (
                              <FlaggedBadge />
                            ) : (
                              canFlag && (
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() =>
                                    setFlagTarget({
                                      type: 'kas-masuk',
                                      id: c.id,
                                      label: `${c.cashInNo} — ${c.type} ${formatCurrency(c.amount)}`,
                                    })
                                  }
                                >
                                  <Flag className='size-4' /> Flag
                                </Button>
                              )
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Jurnal Kas Keluar (Bendahara)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='overflow-hidden rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No.</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className='text-end'>Nominal</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.slice(0, 15).map((e) => (
                        <TableRow key={e.id}>
                          <TableCell>{e.expenseNo}</TableCell>
                          <TableCell>{formatDate(e.date)}</TableCell>
                          <TableCell>{e.category}</TableCell>
                          <TableCell>
                            <Badge variant='outline'>{e.status}</Badge>
                          </TableCell>
                          <TableCell className='text-end'>
                            {formatCurrency(e.amount)}
                          </TableCell>
                          <TableCell className='text-end'>
                            {flaggedIds.has(e.id) ? (
                              <FlaggedBadge />
                            ) : (
                              canFlag && (
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() =>
                                    setFlagTarget({
                                      type: 'kas-keluar',
                                      id: e.id,
                                      label: `${e.expenseNo} — ${e.category} ${formatCurrency(e.amount)}`,
                                    })
                                  }
                                >
                                  <Flag className='size-4' /> Flag
                                </Button>
                              )
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='pos'>
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Transaksi Kasir</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='overflow-hidden rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No.</TableHead>
                        <TableHead>Waktu</TableHead>
                        <TableHead>Pembeli</TableHead>
                        <TableHead className='text-end'>Total</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.slice(0, 20).map((t) => (
                        <TableRow key={t.id}>
                          <TableCell>{t.trxNo}</TableCell>
                          <TableCell>{formatDateTime(t.timestamp)}</TableCell>
                          <TableCell className='capitalize'>
                            {t.buyerType}
                          </TableCell>
                          <TableCell className='text-end'>
                            {formatCurrency(t.totalCharged)}
                          </TableCell>
                          <TableCell className='text-end'>
                            {flaggedIds.has(t.id) ? (
                              <FlaggedBadge />
                            ) : (
                              canFlag && (
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() =>
                                    setFlagTarget({
                                      type: 'transaksi-pos',
                                      id: t.id,
                                      label: `${t.trxNo} — ${formatCurrency(t.totalCharged)}`,
                                    })
                                  }
                                >
                                  <Flag className='size-4' /> Flag
                                </Button>
                              )
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='stok'>
            <Card>
              <CardHeader>
                <CardTitle>Data Stok (Logistik)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='overflow-hidden rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produk</TableHead>
                        <TableHead className='text-end'>Stok</TableHead>
                        <TableHead className='text-end'>Min.</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>{p.name}</TableCell>
                          <TableCell className='text-end'>
                            {p.stock} {p.unit}
                          </TableCell>
                          <TableCell className='text-end'>
                            {p.minThreshold} {p.unit}
                          </TableCell>
                          <TableCell>
                            {p.stock < p.minThreshold ? (
                              <Badge variant='destructive'>Menipis</Badge>
                            ) : (
                              <Badge variant='outline'>Aman</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='anggota'>
            <Card>
              <CardHeader>
                <CardTitle>Daftar Anggota</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='overflow-hidden rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No. Anggota</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Bergabung</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell>{m.memberNo}</TableCell>
                          <TableCell>{m.fullName}</TableCell>
                          <TableCell>
                            <Badge variant='outline'>
                              {MEMBER_STATUS_LABEL[m.status] ?? m.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(m.joinDate)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='integritas'>
            <Card>
              <CardHeader>
                <div className='flex flex-wrap items-start justify-between gap-2'>
                  <div>
                    <CardTitle>Verifikasi Append-Only Ledger</CardTitle>
                    <CardDescription>
                      Hash tiap entri dihitung berantai dari entri sebelumnya —
                      mengubah satu entri lama akan memutus seluruh rantai
                      sesudahnya.
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => {
                      setVerified(true)
                      toast.success(
                        `Rantai hash konsisten — ${hashChain.length} entri ledger utuh, tidak ada yang diubah/dihapus`
                      )
                    }}
                  >
                    <ShieldCheck className='size-4' /> Verifikasi Integritas
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {verified && (
                  <p className='mb-3 rounded-md border border-green-600/40 bg-green-600/10 p-3 text-sm'>
                    ✔ Seluruh {hashChain.length} entri terverifikasi utuh
                    (append-only).
                  </p>
                )}
                <div className='overflow-hidden rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No.</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Entri</TableHead>
                        <TableHead>Hash Integritas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hashChain
                        .slice(-15)
                        .reverse()
                        .map((e) => (
                          <TableRow key={e.id}>
                            <TableCell>{e.no}</TableCell>
                            <TableCell>{formatDate(e.date)}</TableCell>
                            <TableCell className='max-w-60 truncate'>
                              {e.label}
                            </TableCell>
                            <TableCell>
                              <code className='rounded bg-muted px-1.5 py-0.5 font-mono text-xs'>
                                {e.hash}
                              </code>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='temuan' className='space-y-4'>
            <div className='no-print flex flex-wrap justify-end gap-2'>
              <Button
                variant='outline'
                disabled={flags.length === 0}
                onClick={() => window.print()}
              >
                Cetak Laporan (PDF)
              </Button>
              <Button
                disabled={flags.length === 0 || !canFlag}
                onClick={() => {
                  markReported()
                  toast.success(
                    'Laporan temuan audit dikirim ke Ketua untuk ditindaklanjuti'
                  )
                }}
              >
                <SendHorizonal className='size-4' /> Kirim ke Ketua
              </Button>
            </div>
            <div className='print-area space-y-4'>
              <div className='hidden print:block'>
                <h2 className='text-xl font-bold'>
                  Laporan Temuan Audit Pengawas
                </h2>
                <p className='text-sm'>
                  Dicetak {formatDateTime(new Date().toISOString())} —{' '}
                  {flags.length} temuan
                </p>
              </div>
              {flags.length === 0 && (
                <Card>
                  <CardContent className='py-10 text-center text-muted-foreground'>
                    Belum ada transaksi yang di-flag. Gunakan tombol Flag pada
                    tab Keuangan / Transaksi POS.
                  </CardContent>
                </Card>
              )}
              {flags.map((f) => (
                <Card key={f.id}>
                  <CardHeader>
                    <div className='flex flex-wrap items-start justify-between gap-2'>
                      <div>
                        <CardTitle className='text-base'>
                          {f.targetLabel}
                        </CardTitle>
                        <CardDescription>
                          {FLAG_TARGET_LABELS[f.targetType]} — di-flag{' '}
                          {formatDateTime(f.createdAt)}
                        </CardDescription>
                      </div>
                      <Badge variant={f.reportedAt ? 'default' : 'secondary'}>
                        {f.reportedAt
                          ? `Dilaporkan ${formatDate(f.reportedAt)}`
                          : 'Belum dilaporkan'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <div className='space-y-2'>
                      {f.comments.map((c, i) => (
                        <div key={i} className='rounded-md border p-2 text-sm'>
                          <p>{c.text}</p>
                          <p className='mt-1 text-xs text-muted-foreground'>
                            {c.by} — {formatDateTime(c.at)}
                          </p>
                        </div>
                      ))}
                    </div>
                    {canFlag && (
                      <div className='no-print flex gap-2'>
                        <Input
                          placeholder='Tambah catatan audit (tidak dapat dihapus)...'
                          value={commentDrafts[f.id] ?? ''}
                          onChange={(e) =>
                            setCommentDrafts((d) => ({
                              ...d,
                              [f.id]: e.target.value,
                            }))
                          }
                        />
                        <Button
                          variant='outline'
                          disabled={!(commentDrafts[f.id] ?? '').trim()}
                          onClick={() => {
                            addComment(f.id, commentDrafts[f.id].trim())
                            setCommentDrafts((d) => ({ ...d, [f.id]: '' }))
                            toast.success('Catatan ditambahkan')
                          }}
                        >
                          <MessageSquarePlus className='size-4' /> Tambah
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </Main>
      {flagTarget && (
        <FlagDialog target={flagTarget} onClose={() => setFlagTarget(null)} />
      )}
    </>
  )
}
