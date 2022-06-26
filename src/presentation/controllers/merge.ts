import { HttpResponse, HttpRequest } from '../protocols/http'
import { FileTypeError } from '../errors/file-type-error'
import { MissingFilesError } from '../errors/missing-files-error'
import { badRequest, ok } from '../helpers/http-helper'
import { unsupportedMediaType } from '../helpers/http-helper'
import { Controller } from '../protocols/controller'
import { PdfEditor } from '../protocols/pdf-editor'
import { ServerError } from '../errors/server-error'

export class MergeController implements Controller {
  private readonly pdfEditor: PdfEditor
  constructor(pdfEditor: PdfEditor) {
    this.pdfEditor = pdfEditor
  }

  handle(httpRequest: HttpRequest): HttpResponse {
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
      const filesPaths = files.map((file) => file.path)
      const mergedPdfFile = this.pdfEditor.merge(filesPaths)
      if (mergedPdfFile.length === 0) {
        return ok('Empty file')
      }
      return ok('Successfully merged pdf files', mergedPdfFile)
    } catch (error) {
      return {
        statusCode: 500,
        body: new ServerError(),
      }
    }
  }
}
