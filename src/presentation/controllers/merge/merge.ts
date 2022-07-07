import { PdfEditor } from './merge-protocols'
import { Controller, HttpRequest, HttpResponse } from '../../protocols'
import { MissingFilesError, FileTypeError } from '../../errors'
import {
  badRequest,
  internalServerError,
  ok,
  unsupportedMediaType,
} from '../../helpers/http-helper'

export class MergeController implements Controller {
  private readonly pdfEditor: PdfEditor
  constructor(pdfEditor: PdfEditor) {
    this.pdfEditor = pdfEditor
  }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const files = httpRequest.files
      if (files.length === 0) {
        return badRequest(new MissingFilesError())
      }
      const isAllPdfTypeFiles = files.reduce((accumulator, file) => {
        return accumulator && file.type === 'application/pdf'
      }, true)
      if (!isAllPdfTypeFiles) {
        return unsupportedMediaType(new FileTypeError())
      }
      const filesPaths: string[] = files.map((file) => file.path)
      const mergedPdfFile = await this.pdfEditor.merge(filesPaths)
      if (mergedPdfFile.length === 0) {
        return ok('Empty file')
      }
      return ok('Successfully merged pdf files', mergedPdfFile)
    } catch (error) {
      console.log(error)
      return internalServerError()
    }
  }
}
