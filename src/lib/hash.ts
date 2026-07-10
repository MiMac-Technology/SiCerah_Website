/**
 * Hash ringan (FNV-1a 32-bit) untuk verifikasi integritas ledger di sisi UI.
 * Di produksi diganti hash kriptografis dari backend; polanya sama:
 * hash entri = h(hash entri sebelumnya + isi entri) sehingga perubahan satu
 * entri lama memutus seluruh rantai setelahnya.
 */
export function fnv1a(input: string): string {
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

export type ChainedEntry = { id: string; hash: string }

/** Bangun rantai hash dari entri ledger (urut kronologis). */
export function buildHashChain(
  entries: { id: string; content: string }[]
): ChainedEntry[] {
  let prev = 'genesis'
  return entries.map((e) => {
    const hash = fnv1a(prev + '|' + e.id + '|' + e.content)
    prev = hash
    return { id: e.id, hash }
  })
}
