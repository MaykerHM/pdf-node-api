import { HttpResponse, HttpRequest } from '../protocols/http'
import { FileTypeError } from '../errors/file-type-error'
import { MissingFilesError } from '../errors/missing-files-error'
import { badRequest, emptyFile, success } from '../helpers/http-helper'
import { unsupportedMediaType } from '../helpers/http-helper'
import { Controller } from '../protocols/controller'
import { PdfEditor } from '../protocols/pdf-editor'

export class MergeController implements Controller {
  private readonly pdfEditor: PdfEditor
  constructor(pdfEditor: PdfEditor) {
    this.pdfEditor = pdfEditor
  }

  handle(httpRequest: HttpRequest): HttpResponse {
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
    const filesPath = files.map((file) => file.path)
    const mergedPdfFile = this.pdfEditor.merge(filesPath)
    if (mergedPdfFile.length === 0) {
      return emptyFile()
    }
    return success()
  }
}
