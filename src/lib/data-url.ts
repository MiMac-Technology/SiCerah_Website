/**
 * PhotoUploadField menyimpan hasil pilih file sebagai base64 data URL di
 * form state (bukan File). Backend butuh multipart file upload asli, jadi
 * dikonversi balik ke File cuma pas submit.
 */
export async function dataUrlToFile(
  dataUrl: string,
  filename: string
): Promise<File> {
  const res = await fetch(dataUrl)
  const blob = await res.blob()
  return new File([blob], filename, { type: blob.type })
}

export function isDataUrl(value: string | undefined): value is string {
  return !!value && value.startsWith('data:')
}
