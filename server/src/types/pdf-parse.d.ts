declare module "pdf-parse" {
  interface PdfParseResult {
    numpages: number
    numrender: number
    info: Record<string, unknown>
    metadata: unknown
    version: string
    text: string
  }

  interface PdfParseOptions {
    /** Stop after this many pages. 0 means all pages. */
    max?: number
  }

  function pdfParse(buffer: Buffer, options?: PdfParseOptions): Promise<PdfParseResult>

  export = pdfParse
}
