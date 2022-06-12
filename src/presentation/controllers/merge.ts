import { HttpResponse, HttpRequest } from '../protocols/http'
import { FileTypeError } from '../erros/file-type-error'
import { MissingFilesError } from '../erros/missing-files-error'
import { badRequest } from '../helpers/http-helper'
import { unsupportedMediaType } from '../helpers/http-helper'

export class MergeController {
  handle(httpRequest: HttpRequest): HttpResponse {
    const files = httpRequest.files
    if (files.length === 0) {
      return badRequest(new MissingFilesError())
    }
    const isAllPdfTypeFiles = files.reduce((accumulator, file) => {
      return accumulator && file.type === 'application/pdf'
    }, true)
    if (!isAllPdfTypeFiles) {
      console.log(files)
      return unsupportedMediaType(new FileTypeError())
    }
  }
}
