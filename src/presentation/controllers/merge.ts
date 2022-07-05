import { PdfEditor } from '../../domain/usecases/pdf-editor'
import { MissingFilesError, FileTypeError } from '../errors'
import {
  badRequest,
  internalServerError,
  ok,
  unsupportedMediaType,
} from '../helpers/http-helper'
import { Controller } from '../protocols/controller'
import { HttpRequest, HttpResponse } from '../protocols/http'

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
      return internalServerError()
    }
  }
}
