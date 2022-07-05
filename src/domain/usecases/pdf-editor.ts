export interface PdfEditor {
  merge(filesPath: string[]): Uint8Array
}
