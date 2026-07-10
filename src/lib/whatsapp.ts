/** Normalizes an Indonesian phone number to WhatsApp's international format (no leading +). */
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('62')) return digits
  if (digits.startsWith('0')) return `62${digits.slice(1)}`
  return digits
}

export function buildWaLink(phone: string, text: string): string {
  return `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(text)}`
}
