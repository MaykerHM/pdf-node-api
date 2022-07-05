export interface PdfEditor {
  merge(filesPath: string[]): Promise<Uint8Array>
}
